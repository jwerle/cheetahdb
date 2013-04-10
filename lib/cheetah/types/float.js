var type      = require('../type')
  , Type      = type.Type
  , Primitive = type.Primitive


/**
  * @namespace float
  */
var float = module.exports = {};

float.CONV_N = 10e10;

/**
  * @public
  * @function FloatType
  * @param {Number} float
  */
var FloatType = float.Float = Type(function FloatType(n) {
  if (!Primitive.isNumber(n)) 
    throw new TypeError("Type [Float]: Invalid initialized type.");

  var valueOf = this.valueOf

  this.valueOf = function(b) {
    var value = valueOf();
    return (Primitive.isBoolean(b) && b)? (parseInt(value, 2)/float.CONV_N).toString(2)
            : parseInt(value, 2)/float.CONV_N;
  };

  return (n*float.CONV_N).toString(2);
});