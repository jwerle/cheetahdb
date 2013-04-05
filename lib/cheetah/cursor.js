var utils 			= require('./utils')
  , events 			= require('./events')

/**
  * @namespace cursor
  */
var cursor = module.exports = {};


/**
  * @public
  * @constructor Cursor
  */
var Cursor = cursor.Cursor = function Cursor(transaction, range) {
	this.transaction = transaction;
	// {lowerBound: [0, true]} | {upperBound(5, true)}
	if (typeof range === 'object') {
		var args = range[Object.keys(range)[0]]
		args = (Array.isArray(args))? args : [args];
		this.range =  IDBKeyRange[Object.keys(range)[0]].apply(IDBKeyRange , args);
	}
	else {
		this.range = null
	}
};
utils.inherits(Cursor, events.EventEmitter);


/**
  * @public
  * @function Cursor#open
  */
Cursor.prototype.open = function(collection, callback) {
	callback 		= (typeof collection === 'function')? collection : callback
	callback 		= (typeof callback === 'function')? callback : function(){}
	collection 	= (typeof collection === 'string')? collection : null;

	var	self 				= this
		,	collection 	= this.transaction.exec().stores[collection || this.transaction.collection]
	  , cursor 			= collection.openCursor(this.range)

	cursor.onsucess = function(event) {
		var result = this.result
		if (!!result) return callback(null, null, null);
		callback(null, result, result.continue.bind(result));
		self.emit('result', result);
	};

	cursor.onerror  = function(event) {
		callback(new Error(this.error), null, null);
		self.emit('error', event);
	};

	return this;
};