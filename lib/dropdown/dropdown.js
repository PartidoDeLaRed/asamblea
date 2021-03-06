import View from '../view/view.js';
import ToggleParent from 'democracyos-toggle-parent';
import template from './template.jade';
import t from 't-component';
import o from 'component-dom';

var log = require('debug')('democracyos:dropdown');

/**
 * Dropdown
 *
 * @return {Dropdown} `Dropdown` instance.
 * @api public
 *
 * Options:
 *  caption
 *  all
 *  style
 *  items
 *  defaultValue
 *
 * Events:
 *  change
 *
 * Example:
 *  var people = dropdown({
 *    caption: 'Person: %s',
 *    all: true,
 *    style: 'primary',
 *    items: getPeople().map(function(person) {
 *      return { id: person.id, text: person.name };
 *    })
 *  })
 *  .on('change', function(value) {
 *    console.log('Value selected: %s', value.text);
 *  });
 *
 *  people.appendTo(o('#container'));
 */

export default class Dropdown extends View {
  constructor (opts) {
    super();

    opts = opts || {};
    this.onChange = opts.change;
    this._items = opts.items || [];
    this._all = opts.all || false;
    this._allText = opts.allText || t('dropdown.all');
    this._style = opts.style;

    if (opts.defaultValue) {
      var defaultItem = this._items.filter(function(item) { return item.id === opts.defaultValue});
      if (defaultItem.length > 0) {
        this._value = { id: defaultItem[0].id, text: defaultItem[0].text }
      } else {
        throw new Error('Specified default value not found in items');
      }
    } else if (this._all) {
      this._value = { id: '0', text: this._allText };
    }

    this._caption = opts.caption || '%s';

    super(template, {
      items: this._items,
      caption: this._formatCaption(this._caption),
      all: this._all,
      allText: this._allText,
      style: this._style
    });
  }

  switchOn () {
    this._domElement = new ToggleParent(this.find('.dropdown-button')[0]);
    var items = this.find('.dropdown-item');
    items.on('click', this._onChange.bind(this));
  }

  _onChange (ev) {
    ev.preventDefault();
    var li = o(ev.target.parentNode);
    var id = li.attr('data-id');
    var text = li.find('a').html();
    log('_onChange: id: %s, text: %s', id, text);
    this._value = { id: id, text: text };
    this._onChangeCompleted();
  }

  _onChangeCompleted () {
    this.find('.dropdown-button .caption').html(this._formatCaption(this._caption));
    this._domElement.hide();
    this.emit('change', this._value);
  }

  selectedValue () {
    var value = this._value ? this._value.id : null;
    log('selectedValue: %s', value);
    return value;
  }

  selectedText () {
    var value = this._value ? this._value.text : null;
    log('selectedText: %s', value);
    return value;
  }

  _formatCaption (text) {
    if (!this.selectedText()) {
      return text;
    }

    return text.replace('%s', this.selectedText());
  }

  appendTo (el) {
    View.prototype.appendTo.call(this, el);
    return this;
  }
}
