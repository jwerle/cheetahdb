var utils				= require('./utils')
  , events			= require('./events')
  , error				= require('./error')
  , Connection 	= require('./connection').Connection

/**
  * @namespace cheetah
  */
 var cheetah = module.exports = {}


/**
  * @public
  * @constructor Cheetah
  */
 var Cheetah = cheetah.Cheetah = function Cheetah() {
 	events.EventEmitter.call(this);
 	this.options 			= {};
 	this.models  			= {};
 	this.schemas 			= {};
 	this.middleware 	= {};
 	this.connections 	= [];
 	// set up default connection
 	this.createConnection();
 };
utils.inherits(Cheetah, events.EventEmitter);

Cheetah.Cheetah       = Cheetah.prototype.Cheetah         = Cheetah;
Cheetah.types         = Cheetah.prototype.types           = require('./types');
Cheetah.type  		    = Cheetah.prototype.type  		      = require('./type');
Cheetah.Connection 	  = Cheetah.prototype.Connection      = Connection;
Cheetah.Database 		  = Cheetah.prototype.Database 		    = require('./database').Database;
Cheetah.Collection 	  = Cheetah.prototype.Collection 	    = require('./collection').Collection;
Cheetah.Error 			  = Cheetah.prototype.Error 			    = error.CheetahError;
Cheetah.Buffer 			  = Cheetah.prototype.Buffer 			    = require('./buffer').Buffer;
Cheetah.Cursor 			  = Cheetah.prototype.Cursor 			    = require('./cursor').Cursor;
Cheetah.Schema        = Cheetah.prototype.Schema          = require('./schema').Schema;
Cheetah.SchemaField   = Cheetah.prototype.SchemaField 		= require('./schemafield').SchemaField;

/**
  * @public
  * @function Cheetah#set
  *
  * 	Sets a Cheetah option
  *
  * @param {String} key
  * @param {Mixed} value
  */
 Cheetah.prototype.set = function(key, value) {
 	if (arguments.length !== 2)
 		throw new error.CheetahError("Wrong number of arguments given. Cheetah#set expects two arguments (key, value)");
 	else if (typeof key !== 'string')
 		throw new TypeError("Invalid type for argument 'key'. Cheetah#set expects a type of 'string' for the first argument (key)");
 	else if (value === null || value === undefined)
 		throw new TypeError("Invalid type for argument 'value'. Cheetah#set expects a valid type for the second argument (value). It cannot be 'null' or 'undefined'");
 	this.options[key] = value;
 	return this;
 };


 /**
   * @public
   * @function Cheetah#get
   *
   *  Gets a Cheetah option
   *
   * @param {String} key
   */
 Cheetah.prototype.get = function(key) {
 	if (arguments.length < 0)
 		throw new error.CheetahError("Wrong number of arguments given. Cheetah#get expects a valid key to retrieve an option.")
 	else if (typeof key !== 'string')
 		throw new TypeError("Invalid type for argument 'key'. Cheetah#get expects a type of 'string' for the first argument (key)");
 	return this.options[key]
 };


/**
  * @public
  * @function Cheetah#createConnection
  *
  * 	Creates a connection
  */
Cheetah.prototype.createConnection = function() {
	var connection = new Connection(this)
	this.connections.push(connection);
	return connection;
};


Cheetah.prototype.connect = function() {
	var connection = this.connection
	connection.open.apply(connection, arguments);
	return this;
};

/**
  * @public
  * @property connection
  */
Cheetah.prototype.__defineGetter__('connection', function(){
  return this.connections[0];
});

function setModelField() {

}
/**
  *
  */
Cheetah.prototype.model = function(name, schema) {
  var Model = function Model(data) {
    this.__schema__ = schema;
    var define = Object.defineProperty.bind(this)
    // set schema
    function initFields(schema) {
      // set schema
      for (var field in schema.tree) {
        if (schema.tree[field] instanceof Cheetah.SchemaField) {
          this.__defineGetter__(field, schema.tree[field].get);
          this.__defineSetter__(field, schema.tree[field].set);
        }
        else if (Cheetah.type.Primitive.isObject(schema[field])) {
          initFields.call(this, schema.tree[field]);
        }
      }
    }

    initFields.call(this, schema);

    //
    for (var prop in data) {
      this[prop] = data[prop];
    }
  };

  return Model;
};


/**
  * @public
  * @function Cheetah#modelNames
  *
  *		Returns an array of model names
  */
Cheetah.prototype.modelNames = function() { return Object.keys(this.models); };


/**
  * @private
  * @function Cheetah#applyPlugins
  *
  *		Applies plugins to a schema
  *
  * @param {Schema} schema
  */
Cheetah.prototype.applyPlugins = function (schema) {
  for (var i = 0, l = this.plugins.length; i < l; i++)
    schema.plugin(this.plugins[i][0], this.plugins[i][1]);
  return this;
};


/**
  * @public
  * @function Cheetah#plugin
  *
  * 	Declares a new plugin
  *
  * @param {Function} func
  * @param {Object} options
  */
Cheetah.prototype.plugin = function (func, options) {
  this.plugins.push([func, options]);
  return this;
};



Cheetah.prototype.ready = function(callback) {
	var document, self = this
		,	callback = (callback instanceof Function)? callback : null

	if (!callback) return false;

	this.once('ready', callback);

	if (!this.readyListen && 
			typeof (document = (global || window).document) === 'object' &&
			typeof document.addEventListener === 'function') {
		if (!this.domLoaded) {
			this.readyListen = true;
			document.addEventListener('DOMContentLoaded', function() {
				self.domLoaded = true;
				setTimeout(function(){ self.emit('ready'); }, 0);
			});
		}
		else {
			setTimeout(function(){ self.emit('ready'); }, 0);
		}
	}
	else if (!this.domLoaded) {
		setTimeout(function(){ self.emit('ready'); }, 0);
	}

	return this;
};