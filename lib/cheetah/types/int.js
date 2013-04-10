var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive


/**
  * @namespace int
  */
var int = module.exports = {};


/**
  * @public
  * @function IntType
  * @param {Number} int
  */
var IntType = int.Int = Type(function IntType(int){
	if (!Primitive.isNumber(int)) 
    throw new TypeError("Type [Int]: Invalid initialized type.");

  var valueOf = this.valueOf
  
  int = Math.floor(Primitive(int));
  int = (+int).toString(2);

  this.valueOf = function(b) {
    var value = valueOf();
    return (Primitive.isBoolean(b) && b)? value : parseInt(value, 2);
  };

	return int;
});