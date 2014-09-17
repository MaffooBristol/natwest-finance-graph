app = require 'application'

View = require './view'
template = require './templates/home'

dateFormat = 'DD/MM/YYYY'

module.exports = class HomeView extends View
  id: 'home-view'
  template: template
  afterRender: () ->

    svgElement = @$el.find '#chart'
    svgElement.empty()

    paper = Raphael svgElement.get(0), svgElement.width(), svgElement.height()

    app.DataCollection.fetch
      success: (data) ->
        x = []
        for z in data.pluck 'Date'
          x.push moment(z, dateFormat).unix()
        y = []
        for z in data.pluck 'Balance'
          y.push z

        console.log moment.unix(_.min x).format(dateFormat)
        console.log moment.unix(_.max x).format(dateFormat)
        chart = paper.linechart(
          20
          0
          svgElement.width() - 25
          svgElement.height() - 20
          [x, [_.min(x), _.max(x)]]
          [y, [1, 1]]
          {
            # symbol: 'disc'
            smooth: false
            axis: '0 0 1 1'
          }
        )

        axisItems = chart.axis[0].text.items
        i = 0
        l = axisItems.length

        while i < l
          date = axisItems[i].attr("text")
          axisItems[i].attr "text", moment.unix(date).format(dateFormat)
          i++
