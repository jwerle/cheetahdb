var events = require('./events')
  , utils  = require('./utils')


/**
  * @namespace connection
  */
var connection = module.exports = {}


/**
  * @public
  * @constructor Connection
  * @param {Object} base
  */
var Connection = connection.Connection = function Connection(base){
	events.EventEmitter.call(this);
	this.base = base;
	this.collections = {};
	this.models = {};
	this.options = {};
	this.db = null;
	this.opened = false;
};
utils.inherits(Connection, events.EventEmitter);


/**
  * @public
  * @function Connection#open
  *
  *		Opens a connection to the database
  *
  */
Connection.prototype.open = function(database, version) {
	var self = this
	  , conn = global.indexedDB.open(database, (version || 1)|0);

	conn.onsuccess = function(event) {
		// set the database
		self.db = this.result;
		// set opened flag to true
		self.opened = true;
		// emit connected with null error and forwarding the event object
		self.emit('connected', null, self);
	};

	conn.onerror = function(event) {
		var err = new Error(self.error)
		// set opened flag to false
		self.opened = false;
		// emit connected event with err
		self.emit('connected', err, null);
		// call error handle
		self.error(err)
	};

	conn.onupgradeneeded = function(event) {
		this.transaction.onerror = self.error.bind(self);
		self.emit('ready', event.target);
	};

	// chain
	return this;
};


/**
 * @public
 * @function Connection#error
 *
 *	Handles errors via callback or the 'error' event
 *
 * @param {Error} error
 * @param {Function} callback optional
 */

Connection.prototype.error = function (error, callback) {
  if (callback) return callback(error);
  this.emit('error', error);
};



Connection.prototype.collection = function (name, options) {
  if (!(name in this.collections))
    this.collections[name] = new Collection(name, this, options);
  return this.collections[name];
};