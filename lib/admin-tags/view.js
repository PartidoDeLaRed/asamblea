/**
 * Module dependencies.
 */

import page from 'page';
import List from 'democracyos-list.js';
import template from './template.jade';
import View from '../view/view.js';

/**
 * Creates a list view of tags
 */

export default class TagsListView extends View {
  constructor(options = {}) {
    super(template, options);
    this.options = options;
  }

  switchOn() {
    this.list = new List('tags-wrapper', { valueNames: ['tag-title'] });
  }
}
