var EventEmitter = require('./events').EventEmitter
	,	 stream = require('./stream')

/**
	* @namespace process
	*/
var process = module.exports = new(EventEmitter);

process.noDeprecation = false;
process.throwDeprecation = false;
process.traceDeprecation = false;

process.stdout = new(stream.Wwritable);
process.stdin  = new(stream.Readble);
process.stderr = new(stream.Wwritable);

process.platform = navigator.platform
process.language = navigator.language
process.online   = navigator.onLine