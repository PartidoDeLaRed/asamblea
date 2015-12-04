/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config';
import template from './admin-container.jade';
import Sidebar from '../admin-sidebar/admin-sidebar';
import TopicsListView from '../admin-topics/view';
import TopicForm from '../admin-topics-form/view';
import TagsList from '../admin-tags/view';
import TagForm from '../admin-tags-form/view';
import user from '../user/user';
import { dom as render } from '../render/render';
import title from '../title/title';
import topicStore from '../topic-store/topic-store';
import page from 'page';
import o from 'component-dom';
import qs from 'qs';
import forumRouter from '../forum-router/forum-router';
import urlBuilder from '../url-builder/url-builder';
import { findForum } from '../forum-middlewares/forum-middlewares';
import { findPrivateTopics, findTopic } from '../topic-middlewares/topic-middlewares';
import { findAllTags, findTag, clearTagStore } from '../tag-middlewares/tag-middlewares';

page(forumRouter('/admin/*'),
  valid,
  findForum,
  user.required,
  (ctx, next) => {
    let section = ctx.section;
    let container = render(template);

    // prepare wrapper and container
    o('#content').empty().append(container);

    // set active section on sidebar
    ctx.sidebar = new Sidebar(ctx.forum);
    ctx.sidebar.set(section);
    ctx.sidebar.appendTo(o('.sidebar-container', container)[0]);

    // Set page's title
    title();

    // if all good, then jump to section route handler
    next();
  }
);

page(forumRouter('/admin'), findForum, ctx => {
  page.redirect(urlBuilder.admin(ctx.forum) + '/topics');
});

page(forumRouter('/admin/topics'), user.hasAccessToForumAdmin, findPrivateTopics, ctx => {
  let currentPath = ctx.path;
  let topicsList = new TopicsListView(ctx.topics, ctx.forum);
  topicsList.replace('.admin-content');
  ctx.sidebar.set('topics');

  const onTopicsUpdate = () => { page(currentPath); };
  bus.once('topic-store:update:all', onTopicsUpdate);
  bus.once('page:change', () => {
    bus.off('topic-store:update:all', onTopicsUpdate);
  });
});

page(forumRouter('/admin/topics/create'), clearTagStore, findAllTags, ctx => {
  var params = qs.parse(ctx.querystring);

  if (!params.short) {
    ctx.sidebar.set('topics');
  } else {
    ctx.sidebar.hide();
  }

  let form = new TopicForm({
    forum: ctx.forum,
    tags: ctx.tags,
    publish: !!params.publish,
    short: !!params.short
  });

  form.replace('.admin-content');
  form.once('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/topics/:id'), user.hasAccessToForumAdmin, clearTagStore, findAllTags, findTopic, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('topics');

  // render topic form for edition
  let form = new TopicForm({
    topic: ctx.topic,
    forum: ctx.forum,
    tags: ctx.tags
  });
  form.replace('.admin-content');
  form.on('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/tags'), user.hasAccessToForumAdmin, clearTagStore, findAllTags, ctx => {
  const tagsList = new TagsList({
    forum: ctx.forum,
    tags: ctx.tags
  });

  tagsList.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/create'), user.hasAccessToForumAdmin, ctx => {
  let form = new TagForm();
  form.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/:id'), user.hasAccessToForumAdmin, findTag, ctx => {
  // force section for edit
  // as part of list
  ctx.sidebar.set('tags');

  // render topic form for edition
  let form = new TagForm(ctx.tag);
  form.replace('.admin-content');
});

if (config.usersWhitelist) {
  require('../admin-whitelists/admin-whitelists.js');
  require('../admin-whitelists-form/admin-whitelists-form.js');
}

/**
 * Check if page is valid
 */

function valid(ctx, next) {
  let section = ctx.section = ctx.params[0];
  if (/topics|tags|users/.test(section)) return next();
  if (/topics|tags|users\/create/.test(section)) return next();
  if (/topics|tags|users\/[a-z0-9]{24}\/?$/.test(section)) return next();
}
