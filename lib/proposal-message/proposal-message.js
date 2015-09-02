/**
 * Module dependencies.
 */

import user from '../user/user'
import config from '../config/config'
import FormView from '../form-view/form-view'
import template from './template.jade'
import request from '../request/request'
import serialize from 'get-form-data'
import t from 't-component'
import debug from 'debug'

/**
 * Constants definition
 */

const log = debug('democracyos:proposal-message')

/**
 * Creates a ProposalMessage
 *
 * @param {String} reference
 */

export default class ProposalMessage extends FormView {
  
  constructor(topic) {
    super(template, { topic })
    this.topic = topic
    this.form = this.find('.message-form')
    this.static = this.find('.static')
    this.textarea = this.form.find('textarea')
    this.edit = this.find('.edit')
    this.cancel = this.find('.cancel')
  }

  switchOn() {
    this.on('success', this.bound('onsuccess'))
    this.edit.on('click', this.bound('onEditClick'))
    this.cancel.on('click', this.bound('onCancelClick'))
  }

  onsuccess(res) {
    this.static.html(this.textarea.val())
    this.static.removeClass('hide')
    this.edit.removeClass('hide')
    this.form.addClass('hide')
    this.cancel.addClass('hide')
  }

  onEditClick(ev) {
    ev.preventDefault()

    this.textarea.val(this.static.html())
    this.static.addClass('hide')
    this.edit.addClass('hide')
    this.form.removeClass('hide')
    this.cancel.removeClass('hide')
  }

  onCancelClick(ev) {
    ev.preventDefault()
    this.static.removeClass('hide')
    this.edit.removeClass('hide')
    this.form.addClass('hide')
  }
}
