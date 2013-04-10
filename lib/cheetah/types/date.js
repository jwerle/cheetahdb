var type      = require('../type')
  , Type      = type.Type
  , Primitive = type.Primitive


/**
  * @namespace date
  */
var date = module.exports = {};


/**
  * @public
  * @function DateType
  * @param {Number} float
  */
var DateType = date.Date = Type(function DateType(date) {
  if (!Primitive.isDate(date)) 
    throw new TypeError("Type [Date]: Invalid initialized type.");

  return date;
});