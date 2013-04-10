var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive


/**
  * @namespace boolean
  */
var boolean = module.exports = {};


/**
  * @public
  * @function BooleanType
  * @param {Boolean} boolean
  */
var BooleanType = boolean.Boolean = Type(function BooleanType(bool){
	if (!Primitive.isBoolean(bool)) throw new TypeError("Type [Boolean]: Invalid initialized type.");
	return Primitive(bool);
});