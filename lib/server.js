'use strict';

import _        from 'lodash';
import express  from 'express';
import path     from 'path';
import fs       from 'fs';
import Promise  from 'bluebird';
import socketIO from 'socket.io';
import siofu    from 'socketio-file-upload';

import {Statements, Transactions} from './Data';

module.exports = class Server {

  statementsRequest (socket, opts, callback) {
    Statements.getStatements().map((file) => {
      return new Promise((resolve, reject) => {
        fs.stat(file.path, (err, stat) => {
          resolve({
            filename: path.basename(file.path),
            size: (stat.size / 1000.0).toFixed(2) + "KB"
          });
        });
      });
    }).then((files) => {
      socket.emit('statements:receive', null, files);
    }).error((err) => {
      console.log('error');
    });
  }

  initSiofu (socket) {
    let uploader = new siofu();
    uploader.dir = path.join(__dirname, '../place-csvs-here');
    uploader.listen(socket);
    uploader.on('start', (event) => {
      if (!/\.csv$/.test(event.file.name)) {
        uploader.abort(event.file.id, socket);
      }
    });
    uploader.on('complete', (event) => {
      console.log(`Added file${event.file.name}`);
      this.statementsRequest(socket, {}, () => {})
    });
  }

  constructor (opts) {
    const app  = express();
    const port = opts.port || 1234;

    app.use(express.static(global.paths.CLIENT_PATH));
    app.use(siofu.router);

    const server = app.listen(port);
    const io     = socketIO(server);

    console.log(`Finance.js started on port ${port}.`);

    app.get('/', function (req, res) {
      res.sendFile('./index.html');
      res.end()
    });

    io.on('connection', (socket) => {
      this.initSiofu(socket);

      socket.on('transactions:request', (opts, callback) => {
        Transactions.getCache().then(function (data) {
          if (opts.filter) {
            data = Transactions.filter(data, opts);
          }
          socket.emit('transactions:receive', null, data);
        })
      });
      socket.on('stats:request', (opts, callback) => {
        Transactions.getTransactionStats(opts).then((data) => {
          socket.emit('stats:receive', null, data);
        });
      });
      socket.on('statements:request', (opts, callback) => this.statementsRequest(socket, opts, callback));
    });
  }

}
