var utils = require('./utils')

/**
  * @namespace error
  */
var error = module.exports = {};

var CheetahError = error.CheetahError = function CheetahError(message){
	Error.call(this)
	Error.captureStackTrace(this, arguments.callee);
	this.message = message;
	this.name = "CheetahError";
};
utils.inherits(CheetahError, Error);