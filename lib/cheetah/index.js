/**
	* @namespace cheetah
	*/
var cheetah = {};

// attach Database constructor
cheetah.Database = require('./db').Database;

// attach Collection constructor
cheetah.Collection = require('./collection').Collection;

// attach Stream constructor
cheetah.Stream = require('./stream').Stream;
