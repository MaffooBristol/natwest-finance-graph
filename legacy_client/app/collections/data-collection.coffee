app = require 'application'

module.exports = class Collection extends Backbone.Collection
  url: '/get'
