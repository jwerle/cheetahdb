var schemafield 			= require('./schemafield')
	,	SchemaField 			= schemafield.SchemaField
  , SchemaFieldObject = schemafield.SchemaFieldObject
	,	SchemaFieldArray  = schemafield.SchemaFieldArray
	,	Primitive 				= require('./type').Primitive
	, Document 					= require('./document').Document
	,	utils							= require('./utils')
  , events						= require('./events')
  , error							= require('./error')
  , uuid 							= require('./uuid')
  , mpath   	  			= require('./mpath')
  , isFunction        = Primitive.isFunction
  , isPrimitive 			= Primitive.isPrimitive


/**
  * @namespace model
  */
var model = module.exports = {};


/**
  * @public
  * @function model.createModel
  * @param {String} name
  * @param {Schema} schema
  */
var createModel = model.createModel = function createModel(name, schema) {
	var method, proto = Object.create(Model.prototype);
	var M = function Model(data){ return new model.Model(name, schema, data, M.__type__); };

  M.schema    = M.__schema__    = M.$s = schema;
  M.name      = M.__name__      = name;
  M.__type__  = proto.__type__  = M;

	// static methods
	for (method in schema.statics) {
		if (typeof schema.statics[method] === 'function' && !M[method]) {
			M[method] = schema.statics[method];
		}
	}

	// instance methods
	for (method in schema.methods) {
		if (typeof schema.methods[method] === 'function' && !proto[method]) {
			proto[method] = schema.methods[method];
		}
	}

	M.prototype = proto;
	M.prototype.constructor = M;
	// leave a stamp
	M.__model__ = M.prototype.__model__ = M.prototype.constructor.__model__ = true;
	return M;
};


/**
  * @public
  * @function model.isModel
  * @param {Mixed} value
  */
var isModel = model.isModel = function(value) {
	return (value) && (value.__model__ === true)? true : false;
};


/**
  * @public
  * @constructor Model
  * @param {String} name
  * @param {Schema} schema
  * @param {Object} data
  */
var Model = model.Model = function Model(name, schema, data, type) {
	// make sure the schema exists
  schema = this.__schema__ = schema || this.__schema__ || null;
  // ensure a name
  name = this.__name__ = name || this.__name__ || null;
  // propagate type to new instance
  this.__type__ = type;
  // if no schema throw an error
  if (!schema) throw new TypeError("Model missing schema");
  // inherit Document constructor
  Document.call(this);
  
  var tree = schema.tree
  	,	fields = {}
  	, define = Object.defineProperty.bind(null, this)

  this.set = function(path, value) {
    mpath.set(path, value, this);
    return this;
  };

  Object.defineProperty(this, '__fields__', {
    enumerable    : false,
    configurable  : false,
    get           : function(){ return fields; }
  })

  /**
    * @private
    * @function setField
    * @param {Function} TypeConstructor
    * @param {String} key
    * @param {Mixed} value
    */
  function setField(TypeConstructor, fields, key, value) {
  	// primitives won't pass `instanceof` checks
  	if (isPrimitive(TypeConstructor)) {
  		// check type by primitive constructor
  		switch (TypeConstructor) {
  			case Number :
  				if (typeof value === 'number')
  					fields[key] = value;
  			break;

  			case Boolean :
  				if (typeof value === 'boolean')
  					fields[key] = value;
  			break;

  			case String :
  				if (typeof value === 'string')
  					fields[key] = value;
  			break;

  			case Function :
  				if (typeof value === 'function')
  					fields[key] = value;
  			break;

  			case Date :
  				if (typeof value === 'object' && value instanceof Date)
  					fields[key] = value;
  			break;

  			case Array :
  				if (typeof value === 'object' && value instanceof Array)
  					fields[key] = value;
  			break;

  			case Object :
  				if (typeof value === 'object' && value !== null)
  					fields[key] = value;
  			break;
  		}
  	}
  	else {
			if (value instanceof TypeConstructor) {
				fields[key] = value;
			}
		}

  	return value;
  }

  /**
    *
    */
  function convertToSchemaObject(object, fieldObject, treeObject) {
    var value
    // ensure top level object is an instance of SchemaFieldObject
    if (! (object instanceof SchemaFieldObject))
      object = new SchemaFieldObject(null, object);

    // enumerate and convert each child object
    // to a SchemaFieldObject
    for (var property in object) {
      !function(property, object) {
        var setter, getter
        if (typeof object[property] === 'object') {
          // primitive object conversion
          if (isPrimitive(object[property])) {
            // set child stub
            fieldObject[property] = {};
            value = convertToSchemaObject(object[property], fieldObject[property], treeObject[property]);
            object.__defineGetter__(property, function(){ return value; });
          }
          // true SchemaField type
          else if (object[property].__type__ instanceof Function) {
            // scalar types (string|boolean|number)
            if (object[property].scalar) {
              fieldObject[property] = undefined;
              getter = treeObject[property].get
              setter = treeObject[property].set
              object.__defineGetter__(property, function(){ return getter(fieldObject[property]); });
              object.__defineSetter__(property, function(value){
                return setField(treeObject[property].type, fieldObject, property, value)
              });
            }

            // objects|array
            else {
              // handle raw untyped arrays
              if (object[property].__type__ === Array) {
                fieldObject[property] = [];
                var array = object[property];
                //console.log(property, object)
                object.__defineGetter__(property, function(){ return array; });
                object.__defineSetter__(property, function(value){
                  // iterate over each element and set
                  if (Array.isArray(value)) {
                    return value.map(function(val){ return array.$set(val); })
                  }
                  else {
                    return array.$set(value);
                  }
                });
              }
              else if (object[property].__type__ === Object) {
                console.log(property)
              }
            }
          }
        }
        else {
          // we don't want to handle unsupported types
        }
      }(property, object);
    } // end for

    return object;
  }


  /**
    * enumerate and build accessors
    */
	for (var field in tree) {
		// encapsulate in closure
		;(function(field){
			// field is already an SchemaField
			if (tree[field] instanceof SchemaField) {


				// is it a scalar field
				if (tree[field].scalar === true) {
					// retrieve getter/setters already defined if available
					var getter = isFunction(tree[field].get)? tree[field].get.bind(tree[field]) : function(v){ return v; }
						,	setter = isFunction(tree[field].set)? tree[field].set.bind(tree[field]) : function(v){ return v; }

					// field getter. sets a default if non-existent
					tree[field].get = function() { return getter(fields[field]); };
					// field setter. sets a default if non-existent
					tree[field].set = function(value) { return setField(tree[field].type, fields, field, setter(value)); };
					// __value__ getter
					tree[field].__defineGetter__('__value__', function() { return fields[field];  });
					// __value__ setter propagate changes to internal field object
					tree[field].__defineSetter__('__value__', function(value) { return setField(tree[field].type, fields, field, value); });
					// define descriptor
					define(field, tree[field]);
				}

        // non-scalar schema (Array/Object)
        else {

          // arrays
          if (tree[field] instanceof SchemaFieldArray) {
            // just return value for getter
            tree[field].get = function() { return tree[field]; };
            // do nothing for the setter
            tree[field].set = function(value) { return tree[field].$set(value); };
            // define descriptor
            define(field, tree[field]);
          }

          // object
          else if (tree[field] instanceof SchemaFieldObject) {
            //console.log('object', field, tree[field])
          }
          else {
            throw new TypeError("Unhandled type! ["+ field +"]");
          }
        }


			}

      // plain object/array
      else {
        // create stub object in internal fields object
        fields[field] = {};
        // convert to schema object
        tree[field] = convertToSchemaObject(tree[field], fields[field], tree[field]);
        // just return value for getter
        tree[field].get = function() { return tree[field]; };
        // do nothing for the setter
        tree[field].set = function() { return tree[field]; };
        // define descriptor
        define(field, tree[field]);
        // remove getter
        delete tree[field].get;
        // remove setter
        delete tree[field].set;

      }
		}).call(this, field);
	} // end for

  function recursiveSet(scope, tree, data) {
    for (var prop in data) {
      if (prop in tree) {
        if (typeof data[prop] === 'object' && !Array.isArray(data[prop])) {
          recursiveSet(scope[prop], tree[prop], data[prop])
        }
        else {
          //console.log(scope, prop, data[prop])
          scope[prop] = data[prop]
        }
      }
    }
  }

  recursiveSet(this, tree, data)
};
// inheirt from Document
utils.inherits(Model, Document);


/**
  * @public
  * @function Model#get
  * @param {String} key
  */
Model.prototype.get = function(key) {
	return (key in this.__schema__.tree)? this[key] : undefined;
};

Model.prototype.toObject = function() {

};