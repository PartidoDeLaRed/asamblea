import template from './sidebar-template.jade';
import View from '../view/view.js';
import urlBuilder from '../url-builder/url-builder';

export default class Sidebar extends View {
  constructor(forum) {
    super(template, {
      forumUrl: urlBuilder.forum(forum)
    });
  }

  set(section) {
    this.unset();
    // Prune trailing subsection if they exist
    section = section && ~section.indexOf('/') ? section.split('/')[0] : section;
    let select = this.find(`a[data-section=${section}]`).parent('li');
    select.addClass('active');
  }

  unset() {
    let actives = this.find('.active');
    actives.removeClass('active');
    return this;
  }

  hide() {
    this.el.addClass('hide');
  }
}
