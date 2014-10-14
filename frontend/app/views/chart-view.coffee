app = require 'application'

View = require './view'

dateFormat = 'DD/MM/YYYY'

module.exports = class ChartView extends View
  initialize: (opts) ->
    @app = opts.app or {}
    @collection = opts.collection
    @initialCollection = _.clone opts.collection
    @app.State.on 'change update', (val) =>
      @render()
  toUnix: (date) ->
    return moment(date, dateFormat).unix()
  toDate: (timestamp) ->
    return moment.unix(timestamp).format(dateFormat)
  afterRender: () ->
    _self = @
    console.log @initialCollection.models.length
    @collection.reset @initialCollection.models, silent: true

    svgElement = @$el
    svgElement.empty()

    paper = Raphael svgElement.get(0), svgElement.width(), svgElement.height()

    _months = @app.State.get('months')
    if _months > 0
      filtered = @collection.filter (x) =>
        return @toUnix(x.get('Date')) > @toUnix(moment().subtract(_months, 'months'))
      @collection.reset filtered

    x = []
    for z in @collection.pluck 'Date'
      x.push @toUnix z
    y = []
    for z in @collection.pluck 'Balance'
      y.push z

    console.log @toDate _.min x
    console.log @toDate _.max x

    chart = paper.linechart(
      20
      0
      svgElement.width() - 25
      svgElement.height() - 20
      [x, [_.min(x), _.max(x)]]
      [y, [1, 1]]
      {
        symbol: 'circle'
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
        x.get('Date') == _self.toDate axis

      if ting?
        $('#description').html ting.get('Date') + ' : ' + ting.get('Description') + ' / ' + ting.get('Value')

    axisItems = chart.axis[0].text.items
    i = 0
    l = axisItems.length

    while i < l
      date = axisItems[i].attr("text")
      axisItems[i].attr "text", @toDate date
      i++
