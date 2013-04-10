var utils 							= require('./utils')
	,	events 							= require('./events')
	, types 							= require('./types')
	, type 								= require('./type')
	, mpath   						= require('./mpath')
	, model 							= require('./model')
	, SchemaField   			= require('./schemafield').SchemaField
	, SchemaFieldArray   	= require('./schemafield').SchemaFieldArray
	, SchemaFieldObject  	= require('./schemafield').SchemaFieldObject
	, Primitive 					= type.Primitive


/**
  * @namespace schema
  */
var schema = module.exports = {};


/**
  * @public
  * @constructor Schema
  * @param {Object} obj
  */
var Schema = schema.Schema = function Schema(obj) {
	events.EventEmitter.call(this);
	
	this.tree 	 = {};
	this.methods = {};
	this.statics = {};

	if (typeof obj === 'object')
		this.add(obj)
};
utils.inherits(Schema, events.EventEmitter);


/**
  * Reserved words for field names
  */
var reserved = Schema.reserved = Object.create(null);
reserved.on =
reserved.get =
reserved.set =
reserved.type =
reserved.default =
reserved.unique =
reserved.length =
reserved.validate =
reserved.once =
reserved.db =
reserved.errors =
reserved.schema =
reserved.options =
reserved.collection =
reserved.toObject =
reserved.emit =   
reserved._events = 1;


/**
  * @public
  * @function Schema#add
  * @param {Object} obj
  * @param {String} prefix
  */
Schema.prototype.add = function(obj, prefix) {
	if (typeof obj !== 'object') 
		throw new TypeError("Schema#add expects a valid object");

	prefix = (typeof prefix === 'string')? prefix : '';

	for (var prop in obj) {
		if (obj[prop] == null) 
			throw new TypeError('Invalid value for schema path `'+ prefix + prop +'`');

		if (obj[prop].constructor.name == 'Object' && (!obj[prop].type || obj[prop].type.type)) {
			if (Object.keys(obj[prop]).length) {
        this.add(obj[prop], prefix + prop + '.');
      } 
      else {
      	this.path(prefix + prop, obj[prop]); // mixed type
      }
    }
    else {
    	this.path(prefix + prop, obj[prop]);
    }
	}

	return this;
};


/**
  * @public
  * @function Schema#path
  * @param {String} param
  * @param {Object} obj
  */
Schema.prototype.path = function(path, obj) {
	var field

  if (reserved[path])
    throw new Error("`" + path + "` may not be used as a schema pathname");

	if (typeof obj === 'function') {
		if (Primitive.isPrimitive(obj)) {
			field = new SchemaField({type: obj});
		}
		else if (types[obj.name] instanceof Function) { // supported type
			field = new SchemaField({type: obj});
		}
	}
	else if (obj === Array) {
		field = new SchemaField({type: types.Array})
	}
	else if (Primitive.isObject(obj) || Primitive.isArray(obj)) {
		var type = (obj.type && typeof obj.type === 'function')? obj.type 
								: (obj.constructor && typeof obj.constructor === 'function')? obj.constructor
									: null;

		if (obj instanceof Schema) {
			type = Object;
			field = new SchemaField(obj.tree);
		}

		if (Primitive.isArray(obj)) {
			if (model.isModel(obj[0]))
				field = new SchemaFieldArray({type: obj[0], typed: true})
			else
				field = new SchemaFieldArray({});
		}
		else if (Primitive.isPrimitive(type)) {
			if (obj.type) {
				obj.typed = true;
				field = new SchemaField(obj);
			}
			else {
				field = new SchemaFieldObject(null, obj);
			}
		}
		else if (types[obj.type.name] instanceof Function) {
			field = new SchemaField(obj)
		}

		if (!type) {
			field = null;
		}
	}
	else {
		field = null;
	}

	if (!field)
		throw new TypeError("Invalid type for schema for path `"+ path +"`");

	var subpaths = path.split(/\./)
    , last = subpaths.pop()
    , branch = this.tree;

  subpaths.map(function(sub, i) {
  	var parent = subpaths.slice(0, i).concat([sub]).join('.')
    branch[sub] = (!branch[sub])? {} : branch[sub];
    	
    if (typeof branch[sub] !== 'object')
      throw new Error('Cannot set nested path `'+ path +'`. Parent path `'+ parent +'` already set to type '+ branch[sub].name +'.');

    branch = branch[sub];
  });

  branch[last] = utils.clone(obj);

	mpath.set(path, field, this.tree);

	return this;
};



Schema.prototype.method = function(name, func) {
	if (typeof func === 'function' && typeof name === 'string') {
		this.methods[name] = func;
	}
	return this;
};


Schema.prototype.static = function(name, func) {
	if (typeof func === 'function' && typeof name === 'string') {
		this.statics[name] = func;
	}
	return this;
};