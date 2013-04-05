var utils		= require('./utils')
  , events	= require('./events')


/**
  * @namespace transaction
  */
var transaction = module.exports = {};


const READ_ONLY 	= transaction.READ_ONLY 	= 'readonly';
const READ_WRITE 	= transaction.READ_WRITE 	= 'readwrite';

/**
  * @public
  * @constructor Transaction
  * @param {Object} connection
  * @param {String|Array} collections
  * @param {String} [mode]
  */
var Transaction = transaction.Transaction = function Transaction(connection, collections, mode) {
	this.connection 	= connection;
	this.collections 	= (Array.isArray(collections))? collections : [collections]
	this.mode 				= mode || READ_ONLY;
};
utils.inherits(Transaction, events.EventEmitter);


/**
  * @public
  * @function Transaction#exec
  *
  *		Executes a transaction and returns an instance of IDBTransaction
  *
  * @param {String} mode
  * @return {IDBTransaction}
  */
Transaction.prototype.exec = function(mode) {
	var stores = {}, trans = this.db.transaction(this.collections, mode || this.mode)
	this.collections.map(function(collection){ stores[collection] = rans.objectStore(collection); });
	return stores;
};


/**
  * @public
  * @property collection
  */
Transaction.prototype.__defineGetter__('collection', function(){ return this.collections[0]; });