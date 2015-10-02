/**
 * Module Dependencies
 */

import o from 'component-dom'
import { dom } from '../render/render'
import page from 'page'
import marked from 'marked'
import commissionsContainer from './commissions-container.jade'
import Home from './home.md'
import Communication from './communication.md'
import Organization from './organization.md'
import Platforms from './platforms.md'
import Territory from './territory.md'
import Financing from './financing.md'
import NetParties from './net-parties.md'
import Affiliations from './affiliations.md'

const pages = {}
pages['home'] = marked(Home)
pages['comunicacion'] = marked(Communication)
pages['organizacion'] = marked(Organization)
pages['plataformas'] = marked(Platforms)
pages['territorio'] = marked(Territory)
pages['financiamiento'] = marked(Financing)
pages['partidos-en-red'] = marked(NetParties)
pages['afiliaciones'] = marked(Affiliations)

page('/comisiones/:page?', valid, (ctx, next) => {
  if (!ctx.valid) return next()

  const page = ctx.params.page || 'home'
  const container = dom(commissionsContainer)
  const content = o('.commissions-content', container)
  
  // prepare wrapper and container
  const el = o('#content')
  el.empty()
  el.append(container)
  for (var p in pages) {
    o("<div>"+pages[p]+"</div>").addClass(p == page ? 'no-hide' : 'hide').appendTo(content)
  }

  const menuItem = o('a[href="/comisiones/' + page + '"]', container)
  if (menuItem) menuItem.parent().addClass('active')  
})

function valid(ctx, next) {
  var page = ctx.params.page || 'home'
  var valids = [
    'home',
    'comunicacion',
    'organizacion',
    'plataformas',
    'territorio',
    'financiamiento',
    'partidos-en-red',
    'afiliaciones'
  ]
  return ctx.valid = ~valids.indexOf(page), next()
}