var utils 				= require('./utils')
	,	events 				= require('./events')
	, types 				= require('./types')
	, type 					= require('./type')
	, mpath   			= require('./mpath')
	, SchemaField   = require('./schemafield').SchemaField

/**
  * @namespace schema
  */
var schema = module.exports = {};


var Schema = schema.Schema = function Schema(obj) {
	events.EventEmitter.call(this);
	
	this.tree 			= {};

	if (typeof obj === 'object')
		this.add(obj)
};
utils.inherits(Schema, events.EventEmitter);


Schema.asType = function (path, obj) {

};

var reserved = Schema.reserved = Object.create(null);
reserved.on =
reserved.once =
reserved.db =
reserved.errors =
reserved.schema =
reserved.options =
reserved.collection =
reserved.toObject =
reserved.emit =   
reserved._events = 1;

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



Schema.prototype.path = function(path, obj) {
	var field

  if (reserved[path])
    throw new Error("`" + path + "` may not be used as a schema pathname");

	if (typeof obj === 'function') {
		if (type.Primitive.isPrimitive(obj)) {
			field = new SchemaField({type: obj});
		}
		else if (types[obj.name] instanceof Function) { // supported type
			field = new SchemaField({type: obj});
		}
	}
	else if (Array.isArray(obj)) {
		field = new SchemaField({type: types.Array})
	}
	else if (typeof obj === 'object') {
		console.log('o', path, obj)
	}

	if (!field)
		throw new TypeError("Invalid type for schema for path `"+ path +"`");

	var subpaths = path.split(/\./)
    , last = subpaths.pop()
    , branch = this.tree;

  subpaths.forEach(function(sub, i) {
    if (!branch[sub]) branch[sub] = {};
    if ('object' != typeof branch[sub]) {
      var msg = 'Cannot set nested path `' + path + '`. '
              + 'Parent path `'
              + subpaths.slice(0, i).concat([sub]).join('.')
              + '` already set to type ' + branch[sub].name
              + '.';
      throw new Error(msg);
    }
    branch = branch[sub];
  });

  branch[last] = utils.clone(obj);

	mpath.set(path, field, this.tree);

	return this;
};