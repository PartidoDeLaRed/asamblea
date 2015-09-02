/**
 * Module dependencies.
 */

import bus from 'bus';
import config from '../config/config.js';
import template from './admin-container.jade';
import Sidebar from '../admin-sidebar/admin-sidebar';
import TopicsListView from '../admin-topics/view.js';
import TopicForm from '../admin-topics-form/view.js';
import TagsList from '../admin-tags/view.js';
import TagForm from '../admin-tags-form/view.js';
import user from '../user/user.js';
import { dom as render } from '../render/render.js';
import title from '../title/title.js';
import topicStore from '../topic-store/topic-store.js';
import page from 'page';
import o from 'component-dom';
import forumRouter from '../forum-router/forum-router';
import { findForum } from '../forum-middlewares/forum-middlewares';
import { findPrivateTopics, findTopic } from '../topic-middlewares/topic-middlewares';
import { findAllTags, findTag } from '../tag-middlewares/tag-middlewares';

page(forumRouter('/admin/:section(*)?'),
  valid,
  findForum,
  user.required,
  user.hasAccessToForumAdmin,
  (ctx, next) => {
    let section = ctx.params.section;
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

page(forumRouter('/admin/topics'), findPrivateTopics, ctx => {
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

page(forumRouter('/admin/topics/create'), findAllTags, ctx => {
  var params = qs.parse(ctx.querystring);
  var publish = params.publish === undefined ? false : ('yes' === params.publish);
  var showSidebar = params.sidebar === undefined ? true : ('yes' === params.sidebar);
  var expanded = params.expanded === undefined ? true : ('yes' === params.expanded);

  if (showSidebar) {
    ctx.sidebar.set('topics');
  } else {
    ctx.sidebar.hide();
  }

  let form = new TopicForm({forum: ctx.forum, tags: ctx.tags});
  form.replace('.admin-content');
  form.once('success', function() {
    topicStore.findAll();
  });
});

page(forumRouter('/admin/topics/:id'), findAllTags, findTopic, ctx => {
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

page(forumRouter('/admin/tags'), findAllTags, ctx => {
  let tagsList = new TagsList(ctx.forum);
  tagsList.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/create'), ctx => {
  let form = new TagForm();
  form.replace('.admin-content');
  ctx.sidebar.set('tags');
});

page(forumRouter('/admin/tags/:id'), findTag, ctx => {
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
  // fix path for next matching handlers
  if (/^(\/.*\/admin|\/admin)$/.test(ctx.path)) ctx.path = ctx.path + '/topics';
  if (/^(\/.*\/admin|\/admin)$/.test(ctx.path)) ctx.path = ctx.path + 'topics';

  // test valid section
  let section = ctx.params.section = ctx.params.section || 'topics';
  if (/topics|tags|users/.test(section)) return next();
  if (/topics|tags|users\/create/.test(section)) return next();
  if (/topics|tags|users\/[a-z0-9]{24}\/?$/.test(section)) return next();
}
