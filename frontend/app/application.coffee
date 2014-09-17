_dataModel = require 'models/data-model'
_dataCollection = require 'collections/data-collection'

# The application bootstrapper.
module.exports = class Application
  initialize: ->
    HomeView = require 'views/home_view'
    Router = require 'lib/router'

    @DataCollection = new _dataCollection model: _dataModel

    # Ideally, initialized classes should be kept in controllers & mediator.
    # If you're making big webapp, here's more sophisticated skeleton
    # https://github.com/paulmillr/brunch-with-chaplin
    @homeView = new HomeView()

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this

module.exports = new Application()
