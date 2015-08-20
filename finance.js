#!/usr/bin/env node

var _ = require('underscore')._;
var express = require('express');

var server = express();

server.use(express.static(__dirname + '/frontend/public/'));
server.listen(1234);

console.log('Natwest Finance Tool started on port 1234.');

var getData = require('./src/getData.js');

server.get('/get', function (req, res) {
  getData.get(function (data) {
    res.send(data);
  })
});

server.get('/', function (req, res) {
  res.sendFile('./index.html');
  res.end()
});
