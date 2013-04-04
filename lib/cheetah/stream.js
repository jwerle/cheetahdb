var events = require('./events')

module.exports.Stream = Stream;
module.exports.Readable = Readable
module.exports.Writable = Writable

function Stream() {
  events.EventEmitter.call(this);
}

Stream.prototype = Object.create(events.EventEmitter.prototype)
Stream.prototype.constructor = Stream;


Stream.prototype.proxy = function(event, newEvent, target) {
  var self = this
  target.on(newEvent, function(){
    var args = [].splice.call(arguments, 0);
    self.emit.apply(self, [event].concat(args));
  });
  return this;
};

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (this.listeners('error').length === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);
  dest.on('close', cleanup);
  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

module.exports.ENCODING_UTF8 = 1;
module.exports.ENCODING_RAW  = -1;


function Readable() {
  Stream.call(this);
  this.readable = true;
  this._allow = false;
  this.encoding = stream.ENCODING_RAW
}

Readable.prototype = Object.create(Stream.prototype);
Readable.prototype.constructor = Readable;
Readable.prototype.setEncoding = function(encoding) {
  switch (encoding) {
    default: case stream.ENCODING_UTF8 : case 'utf8' :
      this.encoding = stream.ENCODING_UTF8;
    break;
  }

  return this;
};
Readable.prototype.resume = function() {
  this._allow = true;
  return this;
};
Readable.prototype.pause = function() {
  this._allow = false;
  return this;
};

function Writable(readstream) {
  Stream.call(this);
  this.writable = true;
}

Writable.prototype = Object.create(Stream.prototype);
Writable.prototype.constructor = Writable;
Writable.prototype.write = function(string){
  this.emit('write', string);
  this.emit('data', string);
  return this;
};