var events = require('./events')
  , utils  = require('./utils')

/**
  * @namespace buffer
  */
var buffer = module.exports = {}

/**
  * @public
  * @constructor Buffer
  * @param {Number|Array|String} arg1 - A number indicating the size to allocate octets of the buffer, 
  * an array of octets, or a string which is converted to octets
  */
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
			for (var i = string.length - 1; i >= 0; i--) 
				view[i] = string.charCodeAt(i);
		break;
		default : throw new TypeError("First argument needs to be a number, array, or string.");
	}

	this.length = length;
	updateFromView();

	function updateFromView() {
		for (var i = 0; i < view.length; i++)
			self[i] = view[i]
	}

	
	/**
	  * @public
	  * @function Buffer#toString
	  * @param {Number} start optional
	  * @param {Number} end optional
	  */

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

	this.valueOf = function(returnHex) {
		var codes = [], ret = []
		for (var i = 0; i < view.length; i++) ret.push(+view[i].toString(16));
		return (returnHex)? ret
						: ['<Buffer'].concat(ret).join(' ') +'>';
	};
}.bind(null);


Buffer.fromHex = function() {
	var hex = (arguments.length > 1)? utils.toArray(arguments)
							: (Array.isArray(arguments[0]))? arguments[0]
								: (typeof arguments[0] === 'string' || typeof arguments[0] === 'number')? [arguments[0]]
									: (arguments[0] instanceof Buffer)? Buffer.valueOf(true)
											: null;

	if (!hex) 
		throw new Error("Buffer#fromHex expects valid hex values as an argument(s)");

	if (hex.length === 1 && typeof hex[0] === 'string' && hex[0].indexOf('<Buffer'))
		hex = hex[0].replace(/<Buffer|>/ig,'').split(' ').map(function(v){ return +(v); });

	return new Buffer(hex.map(function(value){
		return +(value).toString(8);
	}));
};
utils.inherits(Buffer, ArrayBufferView)