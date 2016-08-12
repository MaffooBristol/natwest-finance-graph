app = require 'application'

View = require './view'

Template = require './templates/slider'

module.exports = class SliderView extends View
  tagName: 'div'
  className: 'slider'
  template: Template
  timeout: null
  updateMonths: (from, to) ->
    app.State.set 'from', from
    app.State.set 'to', to
  afterRender: () ->
    min = app.toUnix(@options.data.at(0).get('Date'))
    $(@$el).find('input').ionRangeSlider
      type: 'double'
      min: +moment.unix(min).format("X")
      max: +moment().add(7, "days").format("X")
      # from: +moment().subtract(6, "months").format("X")
      prettify: (num) =>
        moment(num, "X").format("MMM Do YYYY")
      onFinish: (data) =>
        clearTimeout @timeout
        @timeout = setTimeout () =>
          @updateMonths data.from, data.to
        , 100
