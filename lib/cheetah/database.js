var utils 			= require('./utils')
  , events 			= require('./events')
  , Collection 	= require('./collection').Collection



/**
  * @namespace database
  */
var database = module.exports = {};



/**
  * @public
  * @constructor Database
  */
var Database = database.Database = function Database(name, connection) {
	this.name 			= name;
	this.version 		= null
	this.connection = connection;
	this.handle 		= null;
};
utils.inherits(Database, events.EventEmitter);



/**
  *
  */
Database.all = function(callback) {
	if (! (callback instanceof Function))
		throw new TypeError("Database.all expects a valid callback to be a function");

	var	idb = global.indexedDB
		,	getNames = (idb.getDatabaseNames || idb.webkitGetDatabaseNames || idb.mozGetDatabaseNames).bind(idb)

	var request = getNames()
	request.onsuccess = function(){ callback(null, utils.toArray(this.result)) };
	request.onerror = function() {
		callback(new Error(request[Object.keys(request).filter(function(k){ return (/errormessage/).test(k.toLowerCase()); })[0]]))
	}
	return request;
};



/**
  * @public
  * @function Database#connect
  */
Database.prototype.connect = function(options) {
	var self 		= this
	  , conn 		= this.connection
	  , request = null
	  , options = (typeof options === 'object')? options : {}
	  , name, version

	name 		= (options.name || this.name);
	version = (options.version || this.version || null);
	request = (version)? global.indexedDB.open(name, version) : global.indexedDB.open(name);
	request.onsuccess = function(event) {
		// set the database
		var	idb = self.handle = this.result
			,	stores = idb.objectStoreNames
			,	collections = utils.toArray(idb.objectStoreNames)

		self.version = idb.version
		self.collections = collections.map(function(collection){ return new Collection(collection, self); });
		if (conn) conn.opened = true
		self.emit('connected', idb);
		self.emit('ready');
	};

	request.onerror = function(event) {
		var err = new Error(request[Object.keys(request).filter(function(k){ return (/errormessage/).test(k.toLowerCase()); })[0]])
		if (conn) conn.opened = false;
		self.emit('error', err);
	};

	request.onupgradeneeded = function(event) {
		self.handle = this.result
		this.transaction.onerror = conn.error.bind(self);
		self.emit('upgradeneeded', event);
		self.emit('upgrade', event);
	};

	request.onblocked = function(event) {
		self.blocked = true;
		self.emit('blocked');
		throw this.result
	};

	return this;
};


/**
  * @public
  * @function Database#createCollection
  *
  * 	Creates an empty collection
  *
  * @param {String} name
  */
Database.prototype.createCollection = function(name) {
	var self = this
	this.upgrade(function(){
		self.handle.createObjectStore(name)
	});
	return this
};



/**
  *
  */
Database.prototype.disconnect = function(callback) {
	var request = this.handle.close();
	if (typeof callback === 'function') setTimeout(callback.bind(this), 0);
	return this;
};



/**
  *
  */
Database.prototype.upgrade = function(version, callback) {
	var self = this
	callback = (version instanceof Function)? version : callback;
	version  = (typeof version === 'number')? version : null;

	if (typeof callback !== 'function')
		throw new TypeError("Database#upgrade expects a valid callback");

	version = (!version)? this.version + 1 : version;
	this.disconnect(function(){
		self.connect({version: version})
		self.once('upgrade', function(){
			callback(null, self)
		});
		self.once('error', function(err){
			callback(err);
		});
	});

	return this;
};