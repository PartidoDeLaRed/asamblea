import bus from 'bus';
import debug from 'debug';
import encode from 'mout/queryString/encode';
import findIndex from 'mout/array/findIndex';
import MemoryCache from './memory-cache';
import request from '../request/request';

export default class Store {
  constructor () {
    this._fetches = new MemoryCache;
    this._fetchRequests = new MemoryCache;
    this._destroys = new MemoryCache;
    this.item = new MemoryCache;

    this._findAllCache = {
      url: null,
      items: []
    };

    this.log = debug(`democracyos:${this.name()}-store`);
    bus.on('login', this.clear.bind(this));
    bus.on('logout', this.clear.bind(this));
  }

  busEmit (scope, ...args) {
    bus.emit(`${this.name()}-store:${scope}`, ...args);
  }

  /**
   * Name of the scope, to be used as a namespace for events, logs, etc.
   *
   * @return {String} name
   * @api public
   */
  name () {
    throw new Error('Store must implement name():string');
  }

  /**
   * Returns url where to fetch models, must implement GET, POST, DELETE.
   *
   * @param {String} id
   * @return {String} url
   * @api public
   */
  url (id, params = {}) {
    return `/api/${this.name()}/${id}${encode(params)}`;
  }

  /**
   * Method to implement the parsing of the returned Model on ._fetch().
   * Could be used to add template properties/methods on the received object.
   *
   * @param {Object} item
   * @return {Promise} item
   * @api protected
   */
  parse (item) {
    return Promise.resolve(item);
  }

  /**
   * Save item to the cache.
   *
   * @param {String} id
   * @param {Object} item to save
   * @api public
   */
  set (id, item) {
    this.item.set(id, item);
    this.busEmit(`update:${id}`, item);

    let findAllCacheIndex = findIndex(this._findAllCache.items, i => item.id == i.id);
    if (~findAllCacheIndex) {
      this._findAllCache.items[findAllCacheIndex] = item;
      this.busEmit('update:all', this._findAllCache.items);
    }

    return this;
  }

  /**
   * Cleans the cache of a previously getted model. Once unloaded will be
   * fetched to the server again when .get() is called.
   *
   * @param {String} id
   * @api public
   */
  unset (id) {
    if (!this.item.remove(id)) return this;
    this._fetchAbort(this.url(id));
    this.busEmit(`remove:${id}`);

    let findAllCacheIndex = findIndex(this._findAllCache.items, i => id == i.id);
    if (~findAllCacheIndex) {
      this._findAllCache.items.splice(findAllCacheIndex, 1);
      this.busEmit('update:all', this._findAllCache.items);
    }

    return this;
  }

  /**
   * Clears the cache of a all previously getted model.
   *
   * @api public
   */
  clear () {
    let ids = this.item.keys();
    this.item.clear();

    ids.forEach(id => {
      this._fetchAbort(this.url(id));
      this.busEmit(`remove:${id}`);
    });

    if (this._findAllCache.url) {
      this._findAllCache.url = null;
      this._findAllCache.items = [];
      this.busEmit('update:all', this._findAllCache.items);
    }

    return this;
  }

  /**
   * Method to get a Model from the Database.
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  findOne (id) {
    if (this.item.get(id)) return Promise.resolve(this.item.get(id));

    let url = this.url(id);

    if (this._fetches.get(url)) return this._fetches.get(url);

    let fetch = this._fetch(url);

    fetch.then(item => {
      this.item.set(id, item);
    }).catch(err => {
      this.log('Found error', err);
    });

    return fetch;
  }

  /**
   * Sends to the server a DELETE call to .url(id), and unloads
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  destroy (id) {
    let item = this.item.get(id);
    if (!item) {
      return this.findOne(id).then(() => {
        return this.destroy(id);
      });
    }

    if (this._destroys.get(id)) return this._destroys.get(id);

    let destroy = new Promise((resolve, reject) => {
      request
        .del(this.url(id))
        .end((err, res) => {
          this._destroys.remove(id);

          if (err || !res.ok) return reject(err);

          this.unset(id);

          resolve(item);

          this.busEmit(`destroy:${id}`, item);
        });
    });

    this._destroys.set(id, destroy);

    return destroy;
  }

  /**
   * Fetch an item from backend
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api protected
   */
  _fetch (url) {
    if (this._fetches.get(url)) return this._fetches.get(url);

    let fetch = new Promise((resolve, reject) => {
      let req = request
        .get(url)
        .end((err, res) => {
          this._fetches.remove(url);
          this._fetchRequests.remove(url);
          if (err) return reject(err);

          if (Array.isArray(res.body)) {
            Promise.all(res.body.map(this.parse)).then(resolve);
          } else {
            this.parse(res.body).then(resolve);
          }
        });

      this._fetchRequests.set(url, req);
    });

    this._fetches.set(url, fetch);

    return fetch;
  }

  /**
   * Aborts a currently running fetch to the server
   *
   * @param {String} id
   * @api protected
   */
  _fetchAbort (url) {
    let req = this._fetchRequests.get(url);
    if (req) req.abort();
  }

  /**
   * Method to find a list of Models from the Database and cache them.
   *
   * @param {String} id
   * @return {Promise} fetch
   * @api public
   */
  findAll (...args) {
    let url = this.url('all', ...args);

    if (this._findAllCache.url === url) {
      return Promise.resolve(this._findAllCache.items);
    }

    if (this._fetches.get(url)) return this._fetches.get(url);

    let fetch = this._fetch(url);

    fetch.then(items => {
      this._findAllCache = {
        url: url,
        items: items
      };
      this.busEmit('update:all', items);
    }).catch(err => {
      this.log('Found error', err);
    });

    return fetch;
  }
}
