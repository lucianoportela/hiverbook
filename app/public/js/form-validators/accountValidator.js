
function AccountValidator(){

// build array maps of the form inputs & control groups //

	this.formFields = [$('#name-signup-tf'), $('#email-signup-tf'), $('#pass-signup-tf')];
	this.controlGroups = [$('#name-cg'), $('#email-cg'), $('#pass-cg')];
	
// bind the form-error modal window to this controller to display any errors //
	
	this.alert = $('.modal-form-errors');
	this.alert.modal({ show : false, keyboard : true, backdrop : true});
	
	this.validateName = function(s)
	{
		return s.length >= 3;
	}
	
	this.validatePassword = function(s)
	{
	// if user is logged in and hasn't changed their password, return ok
		if ($('#userId').val() && s===''){
			return true;
		}	else{
			return s.length >= 6;
		}
	}
	
	this.validateEmail = function(e)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(e);
	}
	
	this.showErrors = function(t,a)
	{
		$('.alert-title-error strong').text(t);
		$('.alert-msg-error  p').text(a);
		$('div.alert').show();

	}

}

AccountValidator.prototype.showInvalidEmail = function()
{
	this.showErrors('Warning','That email address is already in use.');
}

AccountValidator.prototype.showSuccess = function()
{
	this.showErrors('Info','Success.');
	window.location.href = '/home';
}

AccountValidator.prototype.showInvalidUserName = function()
{
	this.showErrors('Warning','That username is already in use.');
}

AccountValidator.prototype.validateForm = function()
{
	var e = [];
	for (var i=0; i < this.controlGroups.length; i++) this.controlGroups[i].removeClass('error');
	if (this.validateName(this.formFields[0].val()) == false) {
		this.controlGroups[0].addClass('error'); e.push('Please Enter Your Name');
	}
	if (this.validateEmail(this.formFields[1].val()) == false) {
		this.controlGroups[1].addClass('error'); e.push('Please Enter A Valid Email');
	}
	if (this.validatePassword(this.formFields[2].val()) == false) {
		this.controlGroups[2].addClass('error');
		e.push('Password Should Be At Least 6 Characters');
	}
	if (e.length) this.showErrors('Warning',e);
	return e.length === 0;
}

	