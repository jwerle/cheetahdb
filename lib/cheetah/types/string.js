var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive
  , Buffer    = require('../buffer').Buffer


/**
  * @namespace string
  */
var string = module.exports = {};


/**
  * @public
  * @function StringType
  * @param {Number} n
  */
var StringType = string.String = Type(function StringType(str) {
	if (!Primitive.isString(str)) 
    throw new TypeError("Type [String]: Invalid initialized type.");

  var valueOf = this.valueOf
  this.toString = function() {
    return valueOf().toString()
  };

  return new Buffer(str);
});