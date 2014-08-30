
var ES = require('./email-settings');
var EM = {};
module.exports = EM;

EM.server = require("emailjs/email").server.connect({

	host 	    : ES.host,
	user 	    : ES.user,
	password    : ES.password,
	ssl		    : true

});

EM.dispatchResetPasswordLink = function(account, callback)
{
	EM.server.send({
		from         : ES.sender,
		to           : account.local.email,
		subject      : 'Password Reset',
		text         : 'something went wrong... :(',
		attachment   : EM.composeEmail(account)
	}, callback );
}

EM.composeEmail = function(o)
{
	var link = 'http://www.hiverbook.com/reset-password?e='+o.local.email+'&p='+o.local.pass;
	var html = "<html><body>";
		html += "Hi "+o.local.name+",<br><br>";
		html += "Your username is :: <b>"+o.local.email+"</b><br><br>";
		html += "<a href='"+link+"'>Please click here to reset your password</a><br><br>";
		html += "Cheers,<br>";
		html += "<a href='http://www.hiverbook.com'>HiverBook© 2014</a><br><br>";
		html += "</body></html>";
	return  [{data:html, alternative:true}];
}