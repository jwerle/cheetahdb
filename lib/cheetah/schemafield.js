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
	options = (typeof options === 'object')? options : {};
	var self = this
		,	define = Object.defineProperty.bind(null, this);
	
	define('type', {
		value 				: options.type || undefined,
		configurable 	: false,
		writable 			: false
	});

	define('define', {
		value 				: options.define || undefined,
		configurable 	: false,
		writable 			: false
	});

	define('unique', {
		value 				: options.unique || false,
		configurable 	: false,
		writable 			: false
	});

	define('length', {
		value 				: options.length || Infinity,
		configurable 	: false,
		writable 			: false
	});

	define('validate', {
		value 				: options.validate || function(){},
		configurable 	: false,
		writable 			: false
	});

	define('get', {
		value 				: options.get || function(){},
		configurable 	: false,
		writable 			: false
	});

	define('set', {
		configurable 	: false,
		writable 			: false,
		value 				: function(value){
			var setter = options.set || function(){}
			if (value.constructor === self.type) {
				return setter(value);
			}
			else {
				return undefined;
			}
		}
	});
};
