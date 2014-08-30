
function EmailValidator(){

// bind this to _local for anonymous functions //

    var _local = this;

// modal window to allow users to request credentials by email //
	_local.retrievePassword = $('#get-credentials');
	_local.retrievePassword.modal({ show : false, keyboard : true, backdrop : true });
	_local.retrievePasswordAlert = $('#get-credentials .alert');
	_local.retrievePassword.on('show', function(){ $('#get-credentials-form').resetForm(); _local.retrievePasswordAlert.hide();});

}

EmailValidator.prototype.validateEmail = function(e)
{
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(e);
}

EmailValidator.prototype.showEmailAlert = function(t,m)
{
		$('.alert-title-error strong').text(t);
		$('.alert-msg-error  p').text(m);
		$('div.alert').show();
}




EmailValidator.prototype.hideEmailAlert = function()
{
  //  window.location.href = '/#section-3';
}

EmailValidator.prototype.showEmailSuccess = function(t,m)
{
		$('.alert-title-error strong').text(t);
		$('.alert-msg-error  p').text(m);
		$('div.alert').show();
}