app = require 'application'

HomeView = require 'views/home_view'

module.exports = class Router extends Backbone.Router
  routes:
    '': 'home'

  home: ->
    app.DataCollection.fetch
      success: (_collection) =>
        homeView = new HomeView app: app, collection: _collection
        $('body').html homeView.render().el
      error: () =>
        console.log 'Failed to get data'
