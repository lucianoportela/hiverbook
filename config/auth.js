// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '***', // your App ID
		'clientSecret' 	: '***', // your App Secret
		'callbackURL' 	: 'http://localhost/auth/facebook/callback'
	},


	'googleAuth' : {
		'clientID' 		: '***',// your App ID
		'clientSecret' 	: '***', // your App Secret
		'callbackURL' 	: 'http://localhost/auth/google/callback'
	}
}
