require('./fixes')
var Cheetah = require('./cheetah').Cheetah

/**
	* @namespace cheetah
	*/
var cheetah = module.exports = new(Cheetah);

// attach Database constructor
cheetah.Database = require('./db').Database;

// attach Collection constructor
cheetah.Collection = require('./collection').Collection;