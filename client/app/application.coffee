_dataModel = require 'models/data-model'
_dataCollection = require 'collections/data-collection'

_stateModel = require 'models/state-model'

# The application bootstrapper.
module.exports = class Application
  dateFormat: 'DD/MM/YYYY'
  toUnix: (date) ->
    return moment(date, @dateFormat).unix()
  toDate: (timestamp) ->
    return moment.unix(timestamp).format @dateFormat
  initialize: ->
    Router = require 'lib/router'

    @DataCollection = new _dataCollection model: _dataModel

    @State = new _stateModel()

    # Instantiate the router
    @router = new Router()
    # Freeze the object
    Object.freeze? this

module.exports = new Application()
