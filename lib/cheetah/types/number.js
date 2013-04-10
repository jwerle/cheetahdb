var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive


/**
  * @namespace number
  */
var number = module.exports = {};


/**
  * @public
  * @function NumberType
  * @param {Number} n
  */
var NumberType = number.Number = Type(function NumberType(n){
	if (!Primitive.isNumber(n)) 
    throw new TypeError("Type [Number]: Invalid initialized type.");
	return n;
});