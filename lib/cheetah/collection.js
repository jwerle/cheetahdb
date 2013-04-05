var utils 			= require('./utils')
  , events 			= require('./events')
  , transaction = require('./transaction')
  , Cursor 			= require('./cursor').Cursor


/**
  * @namespace collection
  */
 var collection = module.exports = {};


/**
  * @public
  * @constructor Collection
  * @param {String} name
  * @param {Object} connection
  * @param {Object} options
  */
var Collection = collection.Collection = function Collection(name, connection, options) {
	events.EventEmitter.call(this);
	options = (typeof options === 'object')? options : {};

	if (typeof name !== 'string' || !name)
		throw new TypeError("Collection argument 'name' must be a valid string");

	this.options 		= options;
	this.name    		= name;
	this.buffer  		= null;
	this.queue      = [];
	this.connection = connection;

	if (this.connection.opened)
		this.open();
};
utils.inherits(Collection, events.EventEmitter);


/**
  * @private
  * @function Collection#open
  *
  * 	Called if the connection is open
  */
Collection.prototype.open = function() {
	this.execQueue();
	return this;
};


/**
  * @private
  * @function Collection#addToQueue
  *
  * 	Queues an action for later when the connection is opened
  */
Collection.prototype.addToQueue = function(name, args) {
	this.queue.push([name, args]);
	return this;
};


/**
  * @private
  * @function Collection#execQueue
  *
  * 	Executes all queued actions and clears queue
  */
Collection.prototype.execQueue = function () {
  for (var i = 0, l = this.queue.length; i < l; i++)
    this[this.queue[i][0]].apply(this, this.queue[i][1]);
  return this.clearQueue();
};


/**
  * @private
  * @function Collection#clearQueue
  *
  * 	Resets the queue to an empty array
  */
Collection.prototype.clearQueue = function() {
	this.queue = [];
	return this;
};


/**
  * @public
  * @function Collection#ensureIndex
  */
Collection.prototype.ensureIndex = function() {};


/**
  * @public
  * @function Collection#findAndModify
  */
Collection.prototype.findAndModify = function() {};


/**
  * @public
  * @function Collection#findOne
  */
Collection.prototype.findOne = function() {};



/**
  * @public
  * @function Collection#find
  */
Collection.prototype.find = function() {};


/**
  * @public
  * @function Collection#insert
  */
Collection.prototype.insert = function(documents, options, callback) {
	var self 		= this
	  , trans 	= new transaction.Transaction(this.connection, this.name, transaction.READ_WRITE)
	  , store 	= trans.exec().stores[this.name]

	callback 	= (typeof options === 'function')? options : callback;
	callback 	= (typeof callback === 'function')? callback : function(){};
	options  	= (options == null)? {} : options;
	documents = Array.isArray(documents)? documents : [documents];
	// assign a uuid to each document
	documents.map(function(document){ document._id = utils.uuid(); });

	var request = store.put(documents, options.key || null);
	request.onsuccess = function(){ callback.apply(self, [null].concat(arguments)); };
	request.onerror   = function(){ callback.apply(self, [new Error(this.error)]); };	
	return this;
};


/**
  * @public
  * @function Collection#save
  */
Collection.prototype.save = function(document, options, callback) {
	callback 	= (typeof options === 'function')? options : callback;
	callback 	= (typeof callback === 'function')? callback : function(){};
	options  	= (options == null)? {} : options;

	if (document._id) {
		this.update({_id: document._id}, document, options, callback);
	}
	else {
		this.insert(document, options, callback && function(err, documents){
			if (err) return callback(err, null);
			else if (Array.isArray(documents)) return callback(null, documents[0])
			else return callback(err, documents);
		});
	}

	return this;
};


/**
  * @public
  * @function Collection#update
  */
Collection.prototype.update = function(selector, document, options, callback) {
	var self 		= this
	  , trans 	= new transaction.Transaction(this.connection, this.name, transaction.READ_WRITE)
	  , store 	= trans.exec().stores[this.name]
	  , cursor 	= new Cursor(trans)

	callback 	= (typeof options === 'function')? options : callback;
	callback 	= (typeof callback === 'function')? callback : function(){};
	options  	= (options == null)? {} : options;
	selector  = (typeof selector === 'object')? selector : null;

	if (!selector)
		throw new TypeError("Collection#update expects a valid selector object");

	cursor.range = (options.range && options.range instanceof IDBKeyRange)? options.range : cursor.range;
	
	cursor.open(function(err, result, next){
		for (var query in selector)
			if (result[query] !== selector[query]) return next();

		var id = document._id
		delete document._id
		for (var property in document) {
			if (property in result)	{
				if (typeof result[property] === 'object') {
					result[property] = utils.merge(result[property], document[property])
				}
				else {
					result[property] = document[property]
				}
			}
		}

		store.put(result, id);
	});


	return this;
};


/**
  * @public
  * @function Collection#getIndexes
  */
Collection.prototype.getIndexes = function() {};


/**
  * @public
  * @function Collection#mapReduce
  */
Collection.prototype.mapReduce = function() {};