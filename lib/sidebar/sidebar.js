import bus from 'bus';

import equals from 'mout/object/equals';
import '../topic-filter/topic-filter';
import view from '../view/mixin';
import template from './template.jade';
import List from './list/list';
import FilterView from './filter/filter';
import page from 'page';

class Sidebar extends view('appendable', 'withEvents') {
  constructor (options = {}) {
    options.template = template;
    super(options);

    this.refresh = this.refresh.bind(this);

    this.refresh();
    this.switchOn();
  }

  switchOn () {
    bus.on('topic-filter:update', this.refresh);
    this.bind('click', '#action-buttons button', this.onNewClick.bind(this));
  }

  switchOff () {
    bus.off('topic-filter:update', this.refresh);
  }

  refresh (items, filter) {
    this.refreshList(items);
    this.refreshFilter(filter);
  }

  refreshList (items) {
    if (!this.list) {
      this.list = new List({
        container: this.el.querySelector('[data-sidebar-list]')
      });
    }

    this.list.reset(items);
  }

  refreshFilter (filter) {
    if (this.filterView) {
      if (equals(this.filterView.options.locals, filter)) return;
      this.filterView.remove();
    }
    if (filter) {
      this.filterView = new FilterView({
        container: this.el.querySelector('[data-sidebar-filter]'),
        filter: filter
      });
    }
  }

  select (id) {
    this.list.select(id);
  }

  onNewClick () {
    page('/admin/topics/create?publish=true&short=true');
  }
}

const sidebar = new Sidebar({
  container: document.querySelector('aside.nav-proposal')
});

export default sidebar;
