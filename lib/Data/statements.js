'use strict';

import walk from 'walk';
import fs from 'graceful-fs';
import _ from 'lodash';
import Promise from 'bluebird';
import couchbase from 'couchbase';
import moment from 'moment';
import { Converter } from 'csvtojson';

import Base from '../base';

/**
 * Class for CSV statements. In the future this may allow other formats.
 */
export default class Statements {
  /**
   * Regex to match the CSV filenames.
   *
   * @type {RegExp}
   */
  static CSVRegex = /^([A-Z]+?(\d{8})?\-(\d+|HYPO)?( \(\d+\)|-\d+)?|Monzo.*)\.csv$/gi;

  mapStatements (data) {
    if (data[0] === undefined || (data[0].Date !== undefined && data[0].Date.length > 0)) {
      return data;
    }
    const outputData = [];
    if (data[0].created) {
      data.forEach((row) => {
        outputData.push({
          Date: moment(row.created).format('DD/MM/YYYY'), // needs to be morphed
          Description: row.description.slice(0, 22),
          Value: row.amount,
          Balance: 0,
          Type: row.category === 'cash' ? 'C/L' : 'MNZ',
        });
      });
    }
    return outputData;
  }
  /**
   * Loads the statements from file and CSV converts & merges them.
   *
   * @return {Promise}
   *   A promise that returns an array of CSV-parsed data.
   */
  getStatementsRows () {
    return this.getStatements().map((file) => {
      return new Promise((resolve, reject) => {
        const csvConverter = new Converter({
          constructResult: true,
          ignoreEmpty: true
        });
        csvConverter.on('end_parsed', (data) => resolve(this.mapStatements(data)));
        file.pipe(Base.streamTransformTrim()).pipe(csvConverter);
      });
    });
  }
  /**
   * Walks through the CSV files, returning an array of file streams.
   *
   * @return {Array}
   *   An array of streams made by fs.createReadStream().
   */
  getStatements () {
    return new Promise((resolve, reject) => {
      const csvWalker = walk.walk(global.paths.CSV_PATH, { followLinks: false });
      let files = [];
      csvWalker.on('file', (root, stat, next) => {
        if (stat.name.match(Statements.CSVRegex)) {
          const filename = `${root}/${stat.name}`;
          files.push({ stream: fs.createReadStream(filename), stat });
        }
        next();
      });
      csvWalker.on('end', () => {
        files = _.reverse(_.sortBy(files, (file) => moment(file.stat.birthtime).unix()));
        resolve(_.map(files, 'stream'));
      });
      csvWalker.on('errors', (err) => {
        console.log('error!', err);
        reject(err);
      });
    });
  }
}
