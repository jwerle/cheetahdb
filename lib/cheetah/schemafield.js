/**
  * @namespace schemafield
  */
var schemafield = module.exports = {};


/**
  * @public
  * @constructor SchemaField
  * @param {Object} options
  */
var SchemaField = schemafield.SchemaField = function SchemaField(options) {
	options = (typeof options === 'object')? options : {}
	this.type 		= options.type 			|| undefined;
	this.default 	= options.default 	|| undefined;
	this.unique   = options.unique 		|| false;
	this.length   = options.length 		|| Infinity;
	this.validate = options.validate 	|| function(){};
	this.get  		= options.get 			|| function(){};
	this.set  		= options.set 			|| function(){};
};
