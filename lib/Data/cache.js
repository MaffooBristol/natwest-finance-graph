'use strict';

import Promise   from 'bluebird';
import couchbase from 'couchbase';

const bucketName = 'finances';

export default class Cache {
  constructor () {
    this.cluster = new couchbase.Cluster('couchbase://localhost');
  }
  openBucket () {
    return new Promise((resolve, reject) => {
      if (this.bucket && this.bucket.connected) {
        return resolve(this.bucket);
      }
      this.bucket = this.cluster.openBucket(bucketName);
      this.bucket.on('connect', () => {
        resolve(this.bucket);
      });
      this.bucket.on('error', (err) => {
        if (this.bucket && this.bucket.removeEventListener !== undefined) {
          this.bucket.removeEventListener();
        }
        this.bucket = null;
        reject(err);
      });
    });
  }
  getCache (documentName) {
    return new Promise((resolve, reject) => {
      this.openBucket().then((bucket) => {
        if (!bucket.connected) {
          return reject(new Error('Could not connect to Couchbase.'));
        }
        bucket.get(documentName, (err, result) => {
          if (err) {
            // Catch "key does not exist on server".
            if (err.code === 13) {
              return this.setCache().then(resolve, reject);
            }
            return reject(err);
          }
          if (!result.value.length) {
            this.setCache().then(resolve, reject);
          }
          else {
            resolve(result.value);
          }
        });
      }).error(reject).catch(reject);
    });
  }
  setCache (documentName, DataPromise) {
    return new Promise((resolve, reject) => {
      this.openBucket().then((bucket) => {
        DataPromise().then((results) => {
          if (!bucket.connected) {
            return reject(new Error('Could not connect to Couchbase.'));
          }
          bucket.upsert(documentName, results, (err) => {
            if (err) {
              return reject(err);
            }
            resolve(results);
          });
        }).catch(reject).error(reject);
      }).catch(reject).error(reject);
    });
  }
}
