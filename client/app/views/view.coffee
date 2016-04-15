require 'lib/view_helper'

# Base class for all views.
module.exports = class View extends Backbone.View

  templateHelpers: {}

  template: ->
    return

  getRenderData: ->
    return if typeof @templateHelpers is 'function' then @templateHelpers() else @templateHelpers

  render: =>
    # console.debug "Rendering #{@constructor.name}"
    @$el.html @template @getRenderData()
    setTimeout () =>
      @afterRender()
    , 0
    this

  afterRender: ->
    return
