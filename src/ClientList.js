'use strict';
var Emitter = require('events');
var match = require('./matcher');
var Promise = require('bluebird');

/**
 * Creates reactive lists of clients.
 * @param {Array} [lists] - A list of other lists
 * to join into a larger list.
 * @class ClientList
 * @augments EventEmitter
 */
function ClientList (lists) {
  var list = this;
  Emitter.call(this);
  list.clients = {};

  var add = list.add.bind(list);

  /** See if the user passed an array. */
  if (lists instanceof Array) {
    lists.forEach(function (list) {

     /** Add each client, listening for additions. */
      list.each(add).on('add', add);
    });
  }
}

var API = ClientList.prototype = new Emitter();
API.setMaxListeners(Infinity);

API.constructor = ClientList;

/**
 * Call the correct subclass when creating
 * new chains.
 * @param  {Array} [list] - A list of client lists to add.
 * @return {ClientList} - Either a ClientList instance
 * or a subclass.
 */
API.chain = function (list) {
  return new this.constructor(list);
};

/**
 * Iterate over the collection of low-level clients.
 * @param  {Function} cb - Callback, invoked for each client.
 * @return {this} - The current context.
 */
API.each = function (cb) {
  var key;
  for (key in this.clients) {
    if (this.clients.hasOwnProperty(key)) {
      cb(this.clients[key], key, this);
    }
  }
  return this;
};

/**
 * Add a low-level client object to the list.
 *
 * @param {Object} client - A strict client interface.
 * @param {Socket} client.socket - A socket.io interface.
 * @param {Object} client.platform - The `platform.js` object.
 * @returns {this} - The current context.
 */
API.add = function (client) {
  var socket, list = this;
  socket = client.socket;

  /**
   * Ignore disconnected clients,
   * or those already in the list.
   */
  if (!socket.connected || this.get(socket.id)) {
    return this;
  }

  /** Add the client. */
  this.clients[socket.id] = client;

  /** Remove on disconnect. */
  socket.on('disconnect', function () {
    list.remove(client);
  });

  /** Fire the 'add' event. */
  this.emit('add', client, socket.id);

  return this;
};

/**
 * Remove a client from the list.
 * @param  {Object} client - A client object.
 * @return {this} - The current context.
 */
API.remove = function (client) {

  /** Make sure we really have that client. */
  if (client.socket.id in this.clients) {

   /** Remove the client. */
    delete this.clients[client.socket.id];

   /** Fire the 'remove' event. */
    this.emit('remove', client, client.socket.id);
  }

  return this;
};

/**
 * Get the client corresponding to an ID.
 * @param  {String} ID - The socket.id of the client.
 * @return {Object|null} - The client object, if found.
 */
API.get = function (ID) {
  return this.clients[ID] || null;
};

/**
 * Create a new reactive list as the result of a
 * platform query.
 * @param  {Object|String|RegExp} query - Platform query.
 * @return {ClientList} - A new list of clients.
 */
API.filter = function (query) {

  /** Create a new target list. */
  var list = this.chain();

  /**
   * Adds matching clients to the new filtered list.
   * @param  {Client} client - A connected client.
   * @param  {String} ID - The client identifier.
   * @return {undefined}
   */
  function filter (client, ID) {
    if (query instanceof Function && query(client, ID)) {
      list.add(client);
      return;
    } else if (typeof query === 'string' || query instanceof RegExp) {
      query = {
        name: query,
      };
    }
    if (typeof query === 'object' && query) {
      if (match(query, client.platform)) {
        list.add(client);
      }
    }
  }

  /**
   * Filter everything in the list, then listen
   * for future clients.
   */
  this.each(filter).on('add', filter);

  return list;
};

/**
 * Create a new reactive list containing the original
 * items, minus anything in a provided exclusion list.
 * @param  {ClientList} exclude - A list of clients.
 * @return {ClientList} - A new client list.
 */
API.excluding = function (exclude) {

  /**
   * Add anything not in the exclusion list.
   * Remember .filter is reactive.
   */
  var list = this.filter(function (client) {
    var excluded = exclude.get(client.socket.id);

    return !excluded;
  });

  var self = this;

  /**
   * Add clients removed from the exclusion list,
   * and contained in the original list.
   */
  exclude.on('remove', function (client) {
    var socket = client.socket;
    var connected = socket.connected;
    var relevant = self.get(socket.id);

    if (connected && relevant) {
      list.add(client);
    }
  });

  return list;
};

/**
 * Run a function remotely on a group of clients.
 * @param  {Function} job - The function eval on clients.
 * @param  {Object} [props] - Any variables the job needs.
 * @return {Promise} - Resolves when the jobs finish,
 * rejects if any of them fail.
 */
API.run = function (job, props) {
  var jobs = [];

  /** Run the job on each client. */
  this.each(function (client) {
    var promise = client.run(job, props);
    jobs.push(promise);
  });

  /** Wait for all jobs to finish. */
  return Promise.all(jobs);
};

/**
 * Wait until a number of clients have joined the list.
 * @param  {Number} min - The minimum number of clients needed.
 * @return {Promise} - Resolves when the minimum is reached.
 */
API.atLeast = function (min) {
  var list = this;

  /** Check to see if we already have enough. */
  if (list.length >= min) {
    return Promise.resolve();
  }

  return new Promise(function (resolve) {

   /** Wait for new clients. */
    list.on('add', function cb () {

     /** If we have enough... */
      if (list.length >= min) {

      /** Unsubscribe and resolve. */
        list.removeListener('add', cb);
        resolve();
      }
    });
  });
};

/**
 * Create a new list with a maximum number of clients.
 *
 * @param  {Number} num - The maximum number of items.
 * @return {ClientList} - A new constrained list.
 */
API.pluck = function (num) {

  /** Create a new target list. */
  var list = this.chain();
  var self = this;

  /**
   * Add a client if there's still room.
   * @param  {Object} client - A client object.
   * @return {undefined}
   */
  function measure (client) {
    if (!list.atCapacity) {
      list.add(client);
    }
  }

  /** Check to see if it's already full. */
  list.on('add', function () {
    if (list.length === num) {
      list.atCapacity = true;
    }
  });

  /** See if we can replace the lost client. */
  list.on('remove', function () {
    list.atCapacity = false;
    self.each(measure);
  });

  /** Add as many clients as we can. */
  this.each(measure).on('add', measure);

  return list;
};

API.atCapacity = false;

/**
 * A getter, providing the number of clients in a list.
 * @returns {Number} - The length of the list.
 */
Object.defineProperty(API, 'length', {
  get: function () {

   /** Feature detect Object.keys. */
    if (Object.keys instanceof Function) {
      return Object.keys(this.clients).length;
    }

   /** Fall back to iterating. */
    var length = 0;
    this.each(function () {
      length += 1;
    });

    return length;
  },
});

module.exports = ClientList;
