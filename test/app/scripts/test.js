var cheetah = require('cheetahdb')
  , conn, db 

/*
var User = cheetah.model('User', new cheetah.Schema({
	name 					: String,
	email 				: String,
	created_date 	: Date
}))
*/

User = new cheetah.Schema({
	id 	: Number,
	comments : [],
	profile : {
		name 	: String,
		email : String,
		friends : {
			inNetwork : [],
			outofNetwork : []
		}
	}
});

console.log(User)


cheetah.ready(function() {
	conn 	= cheetah.createConnection()
	db 		= conn.open('test')
	db.once('connected', function() {
		//var user = new User({name: 'werle', email: 'joseph.werle@gmail.com'})
	});
});