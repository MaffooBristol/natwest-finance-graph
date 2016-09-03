'use strict';

import _        from 'lodash';
import express  from 'express';
import path     from 'path';
import fs       from 'fs';
import Promise  from 'bluebird';
import socketIO from 'socket.io';
import Siofu    from 'socketio-file-upload';

import {Statements, Transactions} from './Data';

export default class Server {

  statementsEmit (socket = null, opts) {
    Statements.getStatements().map((file) => {
      return Promise.promisify(fs.stat)(file.path).then((stat) => ({
        filename: path.basename(file.path),
        filesize: (stat.size / 1000.0).toFixed(2) + 'KB'
      }));
    }).then((files) => {
      if (socket) {
        socket.emit('statements:receive', null, files);
      }
      return files;
    }).error((err) => {
      if (socket) {
        socket.emit('error', err);
      }
    });
  }

  transactionsEmit (socket = null, opts) {
    Transactions.getTransactions().then(function (data) {
      if (opts.filter) {
        data = Transactions.filter(data, opts);
      }
      if (socket) {
        socket.emit('transactions:receive', null, {id: opts.id, data: data});
      }
      return data;
    });
  }

  initStatementsSiofu (socket) {
    let uploader = new Siofu();
    uploader.dir = path.join(__dirname, '../place-csvs-here');
    uploader.listen(socket);
    uploader.on('start', (event) => {
      if (!/\.csv$/.test(event.file.name)) {
        uploader.abort(event.file.id, socket);
      }
    });
    uploader.on('complete', (event) => {
      console.log(`Added file ${event.file.name}`);
      Transactions.setCache().finally(() => {
        console.log('sending requests back to client');
        this.statementsEmit(socket, {});
        this.transactionsEmit(socket, {});
      });
    });
  }

  constructor (opts) {
    const app  = express();
    const port = opts.port || 1234;

    app.use(express.static(global.paths.CLIENT_PATH));
    app.use(Siofu.router);

    const server = app.listen(port);
    const io     = socketIO(server);

    console.log(`Money Badger started on port ${port}.`);

    app.get('/', function (req, res) {
      res.sendFile('./index.html');
      res.end();
    });

    app.get('/fixed-data-table.css', function (req, res) {
      console.log(path.join(__dirname, '../', 'node_modules/fixed-data-table/dist/fixed-data-table.css'));
      res.sendFile(path.join(__dirname, '../', 'node_modules/fixed-data-table/dist/fixed-data-table.css'));
      // res.end();
    });

    let statements = io.of('/statements');
    statements.on('connection', (socket) => {
      this.initStatementsSiofu(socket);
      socket.on('statements:request', (opts, callback) => this.statementsEmit(socket, opts));
    });

    let transactions = io.of('/transactions');
    transactions.on('connection', (socket) => {
      socket.on('transactions:request', (opts, callback) => this.transactionsEmit(socket, opts));
    });

    let stats = io.of('/stats');
    stats.on('connection', (socket) => {
      socket.on('stats:request', (opts, callback) => {
        Transactions.getTransactionStats(opts).then((data) => {
          socket.emit('stats:receive', null, {id: opts.id, data: data});
        }).catch((err) => {
          socket.emit('client:error', err.message);
          callback(err.message);
        });
      });
    });
  }

}
