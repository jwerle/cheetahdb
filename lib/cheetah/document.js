var utils				= require('./utils')
  , events			= require('./events')
  , error				= require('./error')


/**
  * @namespace document
  */
var document = module.exports = {};


/**
  * @public
  * @constructor
  */
var Document = document.Document = function Document(object, fields) {
	events.EventEmitter.call(this);
	events.EventEmitter.prototype.setMaxListeners.call(this, 0);
	this.$id = null;
	this.$doc = {}
	if (object)
		this.$set(object)
};
utils.inherits(Document, events.EventEmitter);


Document.prototype.$set = function() {

};