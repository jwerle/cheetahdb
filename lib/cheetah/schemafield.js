var utils 				= require('./utils')
	,	events 				= require('./events')
	, ArrayType     = require('./types').Array
	, define 				= Object.defineProperty


/**
  * @namespace schemafield
  */
var schemafield = module.exports = {};


/**
  * @public
  * @function schemafield.createGetter
  * @param {Mixed} value
  * @return {Function}
  */
schemafield.createGetter = function(value) {
	return function() {
		return value;
	}
};



function setType (object, type) {
	Object.defineProperty(object, '__type__', {
		enumerable 		: false,
		configurable	: false,
		writable			: false,
		value 				: type
	});

	return object
}

function checkType(object, value) {
 return !!(!object.typed ||
 					value instanceof object.__type__ ||
 					(typeof value === 'object' && value.__name__ === object.__type__.__name__)
 				);
}

/**
  * @public
  * @constructor SchemaField
  * @param {Object} options
  */
var SchemaField = schemafield.SchemaField = function SchemaField(options) {
	options = (typeof options === 'object' && options !== null)? options : {};
	var self = this
		,	define = Object.defineProperty.bind(null, this);
	
	define('scalar', {
		value 				: options.scalar || true,
		configurable 	: false,
		writable 			: false
	});

	define('type', {
		value 				: options.type || undefined,
		configurable 	: false,
		writable 			: false
	});

	define('collection', {
		value 				: options.collection || false,
		configurable 	: false,
		writable 			: false
	});

	define('default', {
		value 				: options.default || undefined,
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


	// descriptors

	define('configurable', {
		value : options.configurable || false,
		enumerable: true,
		configurable: true
	});

	define('enumerable', {
		value : options.enumerable || false,
		enumerable: true,
		configurable: true
	});

	define('get', {
		value 				: options.get || function(v){ return v; },
		writable 			: true,
		enumerable 		: true,
		configurable 	: true
	});

	define('set', {
		writable 			: true,
		enumerable 		: true,
		configurable  : true,
		value 				: options.set || function(v){ return v; }
	});

	setType(this, this.type || Object);
};


/**
  * @public
  * @constructor SchemaFieldObject 
  * @inherits SchemaField
  * @param {Object} options
  */
var SchemaFieldObject = schemafield.SchemaFieldObject = function SchemaFieldObject(options, object) {
	options = utils.merge({
		scalar : false
	}, options || {});

	SchemaField.call(this, options);

	var object = utils.merge({}, object);
	object.__proto__ = SchemaFieldObject.prototype;
	setType(object, this.type || Object);
	Object.defineProperty(object, 'typed', {
		value 				: options.typed,
		enumerable 		: false,
		writable 			: false,
		configurable 	: false
	});
	return object;
};
// inherit SchemaField
utils.inherits(SchemaFieldObject, SchemaField);

// overload define
define = Object.defineProperty.bind(null, SchemaFieldObject.prototype);

/**
  * @public
  * @function SchemaFieldArray#push
  * @param {Mixed} value
  */
define('$set', {
	writable 			: false,
	enumerable 		: false,
	configurable  : false,
	value 				: function(value) {
		return this.push(value);
	}
});



// array methods
var push = [].push
	,	unshift = [].unshift
	, concat = [].concat

/**
  * @public
  * @constructor SchemaFieldArray 
  * @inherits SchemaField
  * @param {Object} options
  */
var SchemaFieldArray = schemafield.SchemaFieldArray = function SchemaFieldArray(options) {
	options = options || {}
	delete options.collection
	delete options.default
	options = utils.merge({
		collection: true,
		scalar : false
	}, options);

	SchemaField.call(this, options);

	var array = []

	array.__proto__ = SchemaFieldArray.prototype;
	setType(array, this.type || Array);
	Object.defineProperty(array, 'typed', {
		value 				: options.typed,
		enumerable 		: false,
		writable 			: false,
		configurable 	: false
	});

	Object.defineProperty(array, '__setter__', {
		value 				: options.setter || 'push',
		enumerable 		: false,
		writable 			: false,
		configurable 	: false
	});
	return array;
};
// inherit SchemaField
utils.inherits(SchemaFieldArray, SchemaField);

// overload define
define = Object.defineProperty.bind(null, SchemaFieldArray.prototype);


/**
  * @public
  * @function SchemaFieldArray#push
  * @param {Mixed} value
  */
define('$set', {
	writable 			: false,
	enumerable 		: false,
	configurable  : false,
	value 				: function(value) {
		return this[this.__setter__](value);
	}
});


/**
  * @public
  * @function SchemaFieldArray#push
  * @param {Mixed} value
  */
define('push', {
	writable 			: false,
	enumerable 		: false,
	configurable  : false,
	value 				: function(value) {
		return checkType(this, value)? push.call(this, value) : false;
	}
});


/**
  * @public
  * @function SchemaFieldArray#$get
  * @param {Mixed} value
  */
define('$get', {
	writable 			: false,
	enumerable 		: false,
	configurable  : false,
	value 				: function(value) { return this; }
});


/**
  * @public
  * @function SchemaFieldArray#unshift
  * @param {Mixed} value
  */
define('unshift', {
	writable 			: false,
	enumerable 		: false,
	configurable  : false,
	value 				: function(value) {
		return checkType(this, value)? unshift.call(this, value) : false;
	}
});


/**
  * @public
  * @function SchemaFieldArray#concat
  * @param {Mixed} value
  */
define('concat', {
	writable 			: false,
	enumerable 		: false,
	configurable  : false,
	value 				: function(value) {
		return checkType(this, value)? concat.call(this, value) : false;
	}
});



/**
  * @public
  * @constructor SchemaFieldCollection 
  * @inherits SchemaField
  * @param {Object} options
  */
var SchemaFieldCollection = schemafield.SchemaFieldCollection = function SchemaFieldCollection(options) {
	options = options || {}
	delete options.collection
	delete options.default
	options = utils.merge({
		collection: true,
		scalar : false
	}, options);

	SchemaField.call(this, options);

	var array = []

	array.__proto__ = SchemaFieldCollection.prototype;
	setType(array, this.type || Array);
	array.typed = options.typed;
	return array;
};
// inherit SchemaField
utils.inherits(SchemaFieldCollection, SchemaField);