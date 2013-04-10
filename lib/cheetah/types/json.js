var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive
  , Buffer    = require('../buffer').Buffer


/**
  * @namespace json
  */
var json = module.exports = {};


/**
  * @public
  * @function JSONType
  * @param {Number} json
  */
var JSONType = json.JSON = Type(function JSONType(str){
	if (!Primitive.isString(str) || !Primitive.isJSON(str)) 
    throw new TypeError("Type [JSON]: Invalid initialized type.");

  var valueOf = this.valueOf

  this.valueOf = function(parse) {
    var value = valueOf();
    return (parse)? JSON.parse(value.toString()) : value;
  };

  this.toString = function() {
    return valueOf().toString();
  };

	return new Buffer(str);
});


JSONType.prototype.toJSON = function() {
  return this.toString();
};

JSONType.prototype.toObject = function() {
  return this.valueOf(true)
};