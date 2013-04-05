var utils 	= require('./utils')
  , events 	= require('./events')


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
Collection.prototype.insert = function() {};


/**
  * @public
  * @function Collection#save
  */
Collection.prototype.save = function() {};



/**
  * @public
  * @function Collection#update
  */
Collection.prototype.update = function() {};


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