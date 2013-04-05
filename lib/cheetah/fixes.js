global = window.global = (typeof global !== 'undefined')? global : window;
// D Crockford love right here
if (! (Object.create instanceof Function)) {
	Object.create = function(Function){
    return function(Object){
      Function.prototype = Object;
      return new Function;
    }
	}(function(){});
}

window.indexedDB = window.indexedDB 
								|| window.mozIndexedDB 
								|| window.webkitIndexedDB;

window.IDBTransaction = (window.IDBTransaction && window.IDBTransaction.READ_WRITE) ? window.IDBTransaction 
												: (window.webkitIDBTransaction && window.webkitIDBTransaction.READ_WRITE) ? window.webkitIDBTransaction 
													: { READ_WRITE: 'readwrite' };

window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

window.storageInfo = window.storageInfo || window.webkitStorageInfo;

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;