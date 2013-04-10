var events 		= require('./events')
  , utils  		= require('./utils')
  , Database 	= require('./database').Database


/**
  * @namespace connection
  */
var connection = module.exports = {}


/**
  * @public
  * @constructor Connection
  * @param {Object} base
  */
var Connection = connection.Connection = function Connection(base) {
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
	var	self = this
		,	db =	this.db = this.database(database, version)
	db.connect();
	return db;
};



Connection.prototype.database = function(database, version) {
	var db = new Database(database, this);
	db.version = version
	return db;
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
  return this;
};



Connection.prototype.collection = function (name, options) {
  if (!(name in this.collections))
    this.collections[name] = new Collection(name, this, options);
  return this.collections[name];
};



Connection.prototype.ready = function(callback) {
	callback = (callback instanceof Function)? callback : function(){};
	if (this.connection) setTimeout(callback, 0);
	else this.once('ready', callback);
	return this;
};