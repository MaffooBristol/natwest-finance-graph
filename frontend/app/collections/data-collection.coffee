app = require 'application'

module.exports = class Collection extends Backbone.Collection
  initialize: () ->
    console.log app.DataModel
  url: '/get'
