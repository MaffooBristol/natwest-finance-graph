'use strict';

const _ = require('lodash');
const express = require('express');

const Data = require('./data.js');

const server = express();

module.exports = class Server {

  constructor (opts) {

    var port = opts.port || 1234;

    server.use(express.static(GLOBAL.paths.CLIENT_PATH));
    server.listen(port);

    console.log(`Finance.js started on port ${port}.`);

    server.get('/get', function (req, res) {
      (new Data()).get(function (data) {
        res.send(data);
      })
    });

    server.get('/', function (req, res) {
      res.sendFile('./index.html');
      res.end()
    });
  }

}
