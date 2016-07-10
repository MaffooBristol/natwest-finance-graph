'use strict';

// require("node-jsx").install({extension: ".jsx"});

import _ from 'lodash';
// const _       = require('lodash');
const express = require('express');

const Data      = require('./data.js');
// const ReactMain = require('../client2/lib/main.jsx');

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
      var DataInstance = new Data();
      socket.on('transactions:request', (opts, callback) => {
        DataInstance.get(function (data) {
          if (opts.filter) {
            data = DataInstance.filter(data, opts);
          }
          socket.emit('transactions:receive', null, data);
          // callback(null, data);
        })
      });
      socket.on('statements:request', (opts, callback) => {
        DataInstance.readStatements().map((file) => {
          return {filename: file.path};
        }).then((files) => {
          socket.emit('statements:receive', null, files);
        })
      });
    });
  }

}
