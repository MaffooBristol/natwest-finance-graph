'use strict';

const _       = require('lodash');
const express = require('express');

const Data = require('./data.js');

module.exports = class Server {

  constructor (opts) {

    const app  = express();
    const port = opts.port || 1234;

    app.use(express.static(GLOBAL.paths.CLIENT_PATH));
    const server = app.listen(port);

    const io = require('socket.io')(server);

    console.log(`Finance.js started on port ${port}.`);

    // This may be outdated if I use socket.io instead!
    app.get('/get', function (req, res) {
      (new Data()).get(function (data) {
        res.send(data);
      });
    });

    app.get('/', function (req, res) {
      res.sendFile('./index.html');
      res.end()
    });

    io.on('connection', (socket) => {
      socket.on('transactions:get', (opts, callback) => {
        var DataInstance = new Data();
        DataInstance.get(function (data) {
          console.log(opts);
          if (opts.filter) {
            data = DataInstance.filter(data, opts);
          }
          callback(null, data);
        })
      });
    });
  }

}
