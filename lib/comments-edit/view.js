import FormView from '../form-view/form-view.js';
import template from './template.jade';
import Dropdown from '../dropdown/dropdown.js';
import o from 'component-dom';
import t from 't-component';

export default class CommentsEditView extends FormView {
  constructor (comment) {
    super(template, { comment: comment });

    this.comment = comment;
    FormView.call(this, template, { comment: comment });
    var that = this;
    this.tendencyDropdown = new Dropdown({
      items: [
        { id: 'infavor', text: t('comments.infavor') },
        { id: 'neutral', text: t('comments.neutral') },
        { id: 'against', text: t('comments.against') }
      ],
      defaultValue: comment.tendency
    })
    .on('change', function (value) {
      that.tendencyDropdown.el.find('button').removeClass('infavor');
      that.tendencyDropdown.el.find('button').removeClass('neutral');
      that.tendencyDropdown.el.find('button').removeClass('against');
      that.tendencyDropdown.el.find('button').addClass(value.id);
    });
  }

  /**
   * Switch on events
   *
   * @api public
   */

  switchOn () {
    this.bind('click', '.btn-cancel', 'oncancel');
    this.on('success', this.bound('onsuccess'));
    this.tendencyDropdown.appendTo('#change');
    this.tendencyDropdown.el
      .find('button')
      .addClass(this.comment.tendency);
  }

  postserialize (data) {
    data.tendency = this.tendencyDropdown.selectedValue();
  };

  /**
   * Put a comment
   *
   * @param {Object} data
   * @api public
   */

  onsuccess (res) {
    this.emit('put', res.body);
  }

  /**
   * On cancel editing a comment
   *
   * @param {Object} data
   * @api public
   */

   oncancel (ev) {
    ev.preventDefault();
    this.el.removeClass('edit');
    this.remove();
  }
}
