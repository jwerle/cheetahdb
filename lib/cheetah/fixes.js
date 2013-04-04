// D Crockford love right here
if (! (Object.create instanceof Function)) {
	Object.create = function(Function){
    return function(Object){
      Function.prototype = Object;
      return new Function;
    }
	}(function(){});
}