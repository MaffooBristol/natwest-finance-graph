app = require 'application'

View       = require './view'
ChartView  = require './chart-view'
ListView   = require './list-view'
SliderView = require './slider-view'

Template = require './templates/home'

module.exports = class HomeView extends View
  id: 'home-view'
  template: Template
  templateHelpers: () ->
    state: app.State.toJSON()
  initialize: (opts) ->
    @app = opts.app or {}
  events:
    'click .smooth': 'updateSmoothing'
  updateSmoothing: (e) ->
    @app.State.set 'smoothing', $(e.target).val()
  afterRender: () ->
    @chart = new ChartView collection: @collection, el: @$el.find('#chart'), app: @app
    @chart.render().$el

    @list = new ListView collection: @collection, el: @$el.find('#list'), app: @app
    @list.render().$el

    @months = new SliderView model: app.State, data: @collection, el: @$el.find('#months'), app: @app
    @months.render().$el

    return @
