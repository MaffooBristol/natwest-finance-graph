'use strict';

import Promise   from 'bluebird';
import couchbase from 'couchbase';

const defaultBucketName = 'finances';

/**
 * Cache controller.
 *
 * @todo Make this more generic and separate out couchbase- there are other dbs!
 */
export default class Cache {
  /**
   * On construction, create the couchbase cluster.
   */
  constructor () {
    this.cluster = new couchbase.Cluster('couchbase://localhost');
  }
  /**
   * Open the main finance bucket, or one specified in the arguments.
   *
   * @todo If the bucket name passed in is different, then it won't cache it
   * because it will overwrite the this.bucket variable. So really it should
   * be this.buckets (plural) as an array and then work with that. But phuckit
   * for now eh?
   *
   * @param {String} bucketName
   *   The name of the bucket.
   *
   * @return {Promise}
   *   Promise that resolves on bucket connection and rejects on error.
   *   It also caches the bucket, although I've just realised a flaw in this.
   */
  openBucket (bucketName = defaultBucketName) {
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
  /**
   * Get a document from the cache.
   *
   * @param {String} documentName
   *   The document name to get.
   *
   * @return {Promise}
   *   A promise that resolves if it fetches the document correctly and rejects
   *   if it doesn't, or receives a bucket error, or its own error.
   */
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
  /**
   * Set a document into the cache.
   *
   * @param {String} documentName
   *   The document name to get.
   * @param {Promise} DataPromise
   *   A promise that must resolve to true to get the data.
   *
   * @return {Promise}
   *   A promise that resolves if it saves the document into the cache.
   */
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
