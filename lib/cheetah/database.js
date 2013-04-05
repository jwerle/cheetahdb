var utils 	= require('./utils')
  , events 	= require('./events')
/**
  * @namespace database
  */
var database = module.exports = {};


/**
  * @public
  * @constructor Database
  */
var Database = database.Database = function Database(name, version, connection) {
	this.name 			= name;
	this.version 		= (version || 1)|0
	this.connection = connection;
	this.handle 		= null;
};
utils.inherits(Database, events.EventEmitter);


/**
  * @public
  * @function Database#connect
  */
Database.prototype.connect = function() {
	var self 		= this
	  , conn 		= this.connection
	  , request = null

	request = global.indexedDB.open(this.name, this.version);
	request.onsuccess = function(event) {
		// set the database
		self.handle = this.result;
		// set opened flag to true
		conn.opened = true;
		// emit connected with null error and forwarding the event object
		conn.emit('connected', null, self);
		self.emit('connected', event);
	};

	request.onerror = function(event) {
		var err = new Error(this.error)
		// set opened flag to false
		conn.opened = false;
		// emit connected event with err
		conn.emit('connected', err, null);
		// call error handle
		conn.error(err);
		self.emit('error', event);
	};

	request.onupgradeneeded = function(event) {
		self.handle = this.result
		this.transaction.onerror = conn.error.bind(self);
		conn.emit('ready', event.target);
		self.emit('upgradeneeded', event);
		console.log('upgradeneeded')
	};

	return this;
}