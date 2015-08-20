app = require 'application'

View = require './view'

Template = require './templates/list'

module.exports = class ChartView extends View
  searchValue: ''
  initialize: (opts) ->
    # @app = opts.app or {}
    # @collection = opts.collection
    @initialCollection = _.clone opts.collection
    @collection.on 'reset', () =>
      console.log 'reset'
      @render()
  afterRender: () ->
    console.log @collection
    @$el.html Template data: @collection, searchValue: @searchValue or ''

  events:
    'keyup #search-list': 'search'

  search: (e) ->
    # return if @searchValue is @$el.find('#search-list').val()
    # return if @collection is @initialCollection
    @searchValue = @$el.find('#search-list').val()
    @collection.reset @initialCollection.models, silent: true
    filtered = @collection.filter (val) =>
      toGet = if isFinite(@searchValue) then val.get('Value') else val.get('Description').toLowerCase()
      return toGet.indexOf(@searchValue.toLowerCase()) > -1
    @collection.reset filtered
    console.log @collection
