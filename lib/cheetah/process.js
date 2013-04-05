var EventEmitter = require('./events').EventEmitter
	,	 stream = require('./stream')

/**
	* @namespace process
	*/
var process = module.exports = new(EventEmitter);

process.noDeprecation = false;
process.throwDeprecation = false;
process.traceDeprecation = false;

process.stdin  = new(stream.Readable);
process.stdout = new(stream.Writable);
process.stderr = new(stream.Writable);

process.platform = navigator.platform
process.language = navigator.language
process.online   = navigator.onLine