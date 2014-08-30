


ResetValidator.prototype.validatePassword = function(s)
{
	if (s.length >= 6){
		return true;
	}	else{
		this.showAlert('Password','Password Should Be At Least 6 Characters');
		return false;
	}
}

ResetValidator.prototype.showAlert = function(t,m)
{
		$('.modal-linha1  p').text(t);
		$('.modal-linha2  p').text(m);
		$('div.box-message').show();
}

