_dataModel = require 'models/data-model'
_dataCollection = require 'collections/data-collection'

_stateModel = require 'models/state-model'

# The application bootstrapper.
module.exports = class Application
  initialize: ->
    HomeView = require 'views/home_view'
    Router = require 'lib/router'

    @DataCollection = new _dataCollection model: _dataModel

    @homeView = new HomeView app: @

    @State = new _stateModel()

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this

module.exports = new Application()
