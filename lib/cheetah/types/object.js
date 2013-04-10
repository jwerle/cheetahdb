var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive


/**
  * @namespace object
  */
var object = module.exports = {};


/**
  * @public
  * @function ObjectType
  * @param {Number} n
  */
var ObjectType = object.Object = Type(function ObjectType(obj) {
	if (!Primitive.isObject(obj)) 
    throw new TypeError("Type [Object]: Invalid initialized type.");
	return JSON.parse(JSON.stringify(obj));
});


ObjectType.prototype.toJSON = function() { 
  return JSON.stringify(this.valueOf());
};


ObjectType.prototype.toObject = function() {
  return this.valueOf();
};