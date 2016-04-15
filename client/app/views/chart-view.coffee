app = require 'application'

View = require './view'

module.exports = class ChartView extends View
  initialize: (opts) ->
    @app = opts.app or {}
    @collection = opts.collection
    @initialCollection = _.clone opts.collection
    @app.State.on 'change update', (val) =>
      @render()
  smoothOut: (arr = []) ->
    a = []
    l = null
    for n in arr
      if l? then a.push (n + l) / 2
      l = n
    return a
  afterRender: () ->
    _self = @

    @collection.reset @initialCollection.models, silent: true

    # @collection.reset @smoothOut(@collection.models), silent: true

    svgElement = @$el
    svgElement.empty()

    paper = Raphael svgElement.get(0), svgElement.width(), svgElement.height()

    # _months = @app.State.get('months')

    filtered = @collection.filter (x) =>
      _date = app.toUnix(x.get('Date'))
      return _date > @app.State.get('from') and _date < @app.State.get('to')
    @collection.reset filtered

    x = []
    for z in @collection.pluck 'Date'
      x.push app.toUnix z
    y = []
    for z in @collection.pluck 'Balance'
      y.push parseFloat z, 10

    smoothingFactor = @app.State.get('smoothing') or 0

    for [1..smoothingFactor]
      y = @smoothOut y

    chart = paper.linechart(
      20
      0
      svgElement.width() - 25
      svgElement.height() - 20
      [x, [_.min(x), _.max(x)]]
      [y, [1, 1]]
      {
        # symbol: 'circle'
        width: 0.5
        smooth: false
        axis: '0 0 1 1'
      }
    ).hoverColumn (e) ->

      axis = Math.round this.axis

      # for i in chart.symbols[0]
        # i.attr fill: '#00ff00'
      # this.symbols[0].attr fill: '#ff0000'
      # console.log moment.unix(axis).format(dateFormat)

      ting = _self.collection.find (x) ->
        x.get('Date') == app.toDate axis

      if ting?
        $('#description').html ting.get('Date') + ' : ' + ting.get('Description') + ' / ' + ting.get('Value')

    axisItems = chart.axis[0].text.items
    i = 0
    l = axisItems.length

    while i < l
      date = axisItems[i].attr("text")
      axisItems[i].attr "text", app.toDate date
      i++
