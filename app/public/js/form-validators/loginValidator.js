
function LoginValidator(){



	//modal-div

	this.showLoginError = function(t, m)
	{
		$('.alert-title-error strong').text(t);
		$('.alert-msg-error  p').text(m);
		$('div.alert').show();
	}

}

LoginValidator.prototype.validateForm = function()
{
	
	if ($('#pass-tf').val() == ''){
		this.showLoginError('Whoops!', 'Please enter a valid password');
		return false;
	}	else{
		return true;
	}
}

