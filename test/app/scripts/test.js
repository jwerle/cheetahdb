CHEETAH_DEBUG = 1;
var cheetah = require('cheetahdb')
  , conn, db 

/*
var User = cheetah.model('User', new cheetah.Schema({
	name 					: String,
	email 				: String,
	created_date 	: Date
}))
*/

Comment = cheetah.model('Comment', new cheetah.Schema({
	content 		: String,
	attachments	: []
}));

Post = cheetah.model('Post', new cheetah.Schema({
	comments : [Comment],
	content 	: String
}));

User = cheetah.model('User', new cheetah.Schema({
	id 		: {
		type 	: Number, 
		get 	: function(value) {
			return value;
		},
		set   : function(value) {
			return value
		}
	},

	uuid : String,

	thing : Object,
	things : [],
	big:  {},
	posts : [Post],
	profile : {
		name 		: {type: String},
		email 	: String,
	},
	friends : {
		inNetwork 	 : [],
		outNetwork : []
	}
}));





cheetah.ready(function() {
	conn 	= cheetah.createConnection()
	db 		= conn.open('test')
	db.once('connected', function() {
		user = new User({
			foo: 'barrrr',
			id : 1234,
			profile : {
				name : "Joseph Werle",
				email : "joseph.werle@gmail.com",
				fib: 'biz'
			},
			friends : {
				inNetwork: ['john', 'jane'],
				outNetwork : ['harold', 'frank']
			}
		});
		post = new Post({content: "I am an awesome post about nothing."});
		post.comments.push(new Comment({content: "Yeah it is a pretty good post"}));
		post.comments.push(new Comment({content: "Eh, it was alright."}));
		user.posts.push(post)
	});
});