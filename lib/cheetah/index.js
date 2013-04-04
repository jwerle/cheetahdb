require('./fixes')
/**
	* @namespace cheetah
	*/
var cheetah = {};

// attach Database constructor
cheetah.Database = require('./db').Database;

// attach Collection constructor
cheetah.Collection = require('./collection').Collection;

module.exports = cheetah