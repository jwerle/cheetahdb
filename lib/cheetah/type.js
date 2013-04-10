var	error = require('./error')
	,	utils = require('./utils')

/**
  * @namespace type
  */
var type = module.exports = {};


/**
  * @public
  * @constructor NotImplementedError
  * @inherits CheetahError
  */
var NotImplementedError = type.NotImplementedError = function NotImplementedError(message) {
	error.CheetahError.call(this);
	this.message = message;
	this.name = "NotImplementedError";
};
utils.inherits(NotImplementedError, error.CheetahError);


/**
  * @public
  * @{constructor|function} Primitive
  */
var Primitive = type.Primitive = function Primitive(value) {
	switch (typeof value) {
		default: return value; break;
		case 'number': return Number(value); break;
		case 'string': return String(value); break;
		case 'boolean': return Boolean(value); break;
		case 'undefined': return undefined;
		case 'object':
			// array
			if (Array.isArray(value)) return [].concat(value);
			// null
			if (value === null) return null;
			// object
			return Object.create(value).__proto__
		break;
	}
};


/**
  * @public
  * @function Primitive.type
  * @param {Mixed} value
  * @return {String}
  */
Primitive.type = function (value) {
	var type;
	return (type = typeof value) === 'object'? 
						(value === null? 'null' 
							: (Primitive.isDate(value)? 'date' : type)) : type;
};


/**
  * @public
  * @function Primitive.getPrimitive
  * @param {Mixed} value
  * @return {Mixed} Constructor
  */
Primitive.getPrimitive = function(value) {
	if (value === null) return null;
	else if (value === undefined) return undefined;

	var Ctor = value.constructor, ctor
	return Primitive.isPrimitive(ctor = Primitive(Ctor.prototype.valueOf()).constructor)? ctor : Function;
};


/**
  * @public
  * @function Primitive.isPrimitive
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isPrimitive = function(value) {
	if (value === null || value === undefined) return 'foo';
	switch (value.constructor) {
		default: return false; break;
		case Number: 
			return (typeof value === 'number');	break;
		case String: 
			return (typeof value === 'string');	break;
		case Boolean: 
			return (typeof value === 'boolean'); break;
		case Function: 
			return (typeof value === 'function'); break;
		case Array: 	
			return (Array.isArray(value)); break;
		case Object: 
			return (typeof value === 'object'); break;
		case Date: 
			return (Date.prototype.isPrototypeOf(value)); break;
	}
};


/**
  * @public
  * @function Primitive.isNumber
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isNumber 		= function(value) { 
	return (typeof value === 'number'); 
};


/**
  * @public
  * @function Primitive.isBoolean
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isBoolean 	= function(value) { 
	return (typeof value === 'boolean'); 
};


/**
  * @public
  * @function Primitive.isObject
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isObject 		= function(value) { 
	return (Primitive.isPrimitive(value)) && (Primitive.type(value) === 'object'); 
};


/**
  * @public
  * @function Primitive.isJSON
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isJSON 		= function(value) { 
	try { JSON.parse(value); }
	catch (e) { return false; }
	return true;
};


/**
  * @public
  * @function Primitive.isNull
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isNull 			= function(value) { 
	return (Primitive.type(value) === 'null'); 
};


/**
  * @public
  * @function Primitive.isDate
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isDate 			= function(value) { 
	return (Primitive.isPrimitive(value)) && (Date.prototype.isPrototypeOf(value)); 
};


/**
  * @public
  * @function Primitive.isFunction
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isFunction 	= function(value) { 
	return (Primitive.isPrimitive(value)) && (Primitive.type(value) === 'function'); 
};


/**
  * @public
  * @function Primitive.isArray
  * @param {Mixed} value
  * @return {Boolean}
  */
Primitive.isArray = Array.isArray.bind(Array);


/**
  * @public
  * @constructor Cast
  */
var Cast = type.Cast = function Cast(value, to) {
	if (Primitive(to) !== undefined) {
		if (Primitive.isPrimitive(to)) {
			if (value instanceof Type) {
				value = value.valueOf();
			}
			
			if (!Primitive.isPrimitive(value)) {
				if (value.valueOf instanceof Function) {
					value = value.valueOf();
				}
				else {
					value = Primitive(value);
				}
			}
			else {
				throw new TypeError("Unsupported type value ["+ value + "]");
			}
		}
		else if (to instanceof Type) {
			value = to.cast(value);
		}
		else {
			throw new TypeError("Unsupported type to ["+ to + "]");
		}
	} else {
		value = Primitive(value);
	}

	return value;
};


/**
  * @public
  * @constructor Type
  */
var Type = type.Type = function Type(Ctor) {
	if (! (this instanceof Type))
		return new Type(Ctor);

	var name, proto, cons, ctor, type

	name = this.name || Primitive(Ctor).name;
	type = function Type(PrimitiveConstructor, value) {
		PrimitiveConstructor = (PrimitiveConstructor || Primitive);
		value = PrimitiveConstructor.call(this, value);
		if (this instanceof type) {
			this.name = name;
			this.valueOf 	 = function() { return value; };
			this.Primitive = PrimitiveConstructor;
		}
		else {
			if (Primitive.isFunction(PrimitiveConstructor)) return PrimitiveConstructor(value);
			else return Primitive.getPrimitive(value)(value);
		}

		this.__defineGetter__('__value__', function(){ return value; });

		return this;
	};

	proto 						= Object.create(this);
	cons 							= (Primitive.isFunction(Ctor))? Ctor : Primitive.getPrimitive(Ctor);
	proto.constructor = type;
	type.prototype 		= proto;
	ctor 							= type.bind(Object.create(proto), cons);
	ctor.prototype 		= type.prototype;
	return ctor;
};


/**
  * @public
  * @function Type#toString
  */
Type.prototype.toString = function() {
	return "[object "+ this.name +"]";
};


/**
  * @public
  * @function Type#toObject
  */
Type.prototype.toObject = function() {
	throw new NotImplementedError(this.name +"#toObject is not implemented.");
};


/**
  * @public
  * @function Type#toJSON
  */
Type.prototype.toJSON = function() {
	throw new NotImplementedError(this.name +"#toJSON is not implemented.");
};


/**
  * @public
  * @function Type#cast
  */
Type.prototype.cast = function() {
	throw new NotImplementedError(this.name +"#cast is not implemented.");
};