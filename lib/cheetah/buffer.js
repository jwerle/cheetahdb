var events = require('./events')
  , utils  = require('./utils')

/**
  * @namespace buffer
  */
var buffer = module.exports = {}

var Buffer = buffer.Buffer = function Buffer(/* [number|array|string] */) {
	if (! (this instanceof Buffer))
		return new Buffer(arguments[0]);

	var self = this, buffer, view, length
	switch (utils.type(arguments[0])) {
		case 'number' :
			var length = arguments[0]
			buffer = new ArrayBuffer(length * 2);
			view   = new Uint16Array(buffer);
		break;
		case 'array'  :
			var octets = arguments[0]
			length = octets.length * 2
			buffer = new ArrayBuffer(length)
			view 	 = new Uint16Array(buffer)
			octets.map(function(octet, i){ view[i] = octet; });
		break;
		case 'string' :
			var string = arguments[0]
			length = string.length * 2;
			buffer = new ArrayBuffer(length)
			view   = new Uint16Array(buffer)
			for (var i = string.length - 1; i >= 0; i--) view[i] = string.charCodeAt(i);
		break;
		default : throw new TypeError("First argument needs to be a number, array, or string.");
	}

	this.length = length;

	function updateFromView() {
		for (var i = 0; i < view.length; i++)
			self[i] = view[i]
	}

	updateFromView()

	this.toString = function(start, end) {
		var v = []
		start = (start || 0) | 0
		end   = (end || this.length) | 0;
		for (var i = start; i < end; i++) v.push(view[i])
		return String.fromCharCode.apply(null, view);
	};

	this.write = function(string, offset, length) {
		var codes = [], code
		offset = (offset || 0) | 0;
		length = (length || this.length - offset) | 0;
		for (var i = 0; i < length; i++) {
			if (i >= string.length || i >= this.length) break;
			else codes.push(string.charCodeAt(i))
		}
		view.set(codes, offset);
		updateFromView();
		return codes.length;
	}

	this.toJSON = function() {
		return Array.prototype.slice.call(this, 0);
	};

	this.valueOf = function() {
		var codes = [], ret = ['<Buffer']
		for (var i = 0; i < view.length; i++) ret.push(view[i].toString(16));
		return ret.join(' ') +'>'
	};
}.bind(null);

utils.inherits(Buffer, ArrayBufferView)