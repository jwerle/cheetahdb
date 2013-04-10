var type 			= require('../type')
	,	Type 			= type.Type
	, Primitive = type.Primitive


/**
  * @namespace array
  */
var array = module.exports = {};


/**
  * @public
  * @function ArrayType
  * @param {Array} array
  */
var ArrayType = array.Array = Type(function ArrayType(array){
	if (!Array.isArray(array)) throw new TypeError("Type [Array]: Invalid initialized type.");
	array.__proto__ = Object.create(ArrayType.prototype);
	return array;
});

ArrayType.prototype.push 					= function(){ return [].push.apply(this.valueOf(), arguments); };
ArrayType.prototype.pop 					= function(){ return [].pop.apply(this.valueOf(), arguments); };
ArrayType.prototype.shift 				= function(){ return [].shift.apply(this.valueOf(), arguments); };
ArrayType.prototype.unshift 			= function(){ return [].unshift.apply(this.valueOf(), arguments); };
ArrayType.prototype.map 					= function(){ return [].map.apply(this.valueOf(), arguments); };
ArrayType.prototype.reverse 			= function(){ return [].reverse.apply(this.valueOf(), arguments); };
ArrayType.prototype.sort 					= function(){ return [].sort.apply(this.valueOf(), arguments); };
ArrayType.prototype.splice 				= function(){ return [].splice.apply(this.valueOf(), arguments); };
ArrayType.prototype.concat 				= function(){ return [].concat.apply(this.valueOf(), arguments); };
ArrayType.prototype.join 					= function(){ return [].join.apply(this.valueOf(), arguments); };
ArrayType.prototype.slice 				= function(){ return [].slice.apply(this.valueOf(), arguments); };
ArrayType.prototype.indexOf 			= function(){ return [].indexOf.apply(this.valueOf(), arguments); };
ArrayType.prototype.lastIndexOf 	= function(){ return [].lastIndexOf.apply(this.valueOf(), arguments); };
ArrayType.prototype.forEach				= function(){ return [].forEach.apply(this.valueOf(), arguments); };
ArrayType.prototype.every					= function(){ return [].every.apply(this.valueOf(), arguments); };
ArrayType.prototype.some					= function(){ return [].some.apply(this.valueOf(), arguments); };
ArrayType.prototype.filter				= function(){ return [].filter.apply(this.valueOf(), arguments); };
ArrayType.prototype.reduce				= function(){ return [].reduce.apply(this.valueOf(), arguments); };
ArrayType.prototype.reduceRight		= function(){ return [].reduceRight.apply(this.valueOf(), arguments); };