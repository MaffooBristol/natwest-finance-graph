app = require 'application'

View = require './view'
ChartView = require './chart-view'

Template = require './templates/home'

module.exports = class HomeView extends View
  id: 'home-view'
  template: Template
  initialize: (opts) ->
    @app = opts.app or {}
  events:
    'keyup #months': 'updateMonths'
  updateMonths: (e) ->
    @app.State.set 'months', $(e.target).val()
    # @app.State.trigger 'update:months', $(e.target).val()
  render: () ->
    @app.DataCollection.fetch
      success: (_collection) =>
        @$el.html @template
        @chart = new ChartView collection: _collection, el: @$el.find('#chart'), app: @app
        @chart.render().$el

    return @
