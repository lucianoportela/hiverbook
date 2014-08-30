
$(document).ready(function(){
	
	var rv = new ResetValidator();
	
	$('#set-password-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){;
			if (rv.validatePassword($('#pass-tf').val()) == false){
				return false;
			} 	else{
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			//setTimeout(function(){ window.location.href = '/'; }, 3000);
			rv.showAlert("Success"," Modified password .");
		},
		error : function(){
			rv.showAlert("I'm sorry"," something went wrong, please try again.");
		}
	});

	$('#set-password').on('shown', function(){ $('#pass-tf').focus(); })

});