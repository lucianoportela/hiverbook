


$(document).ready(function(){
	
	var lv = new LoginValidator();
	var lc = new LoginController();
	var ev = new EmailValidator();
// main login form //

	$('#login-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){

			if (lv.validateForm() == false){
				return false;
			} 	else{
			// append 'remember-me' option to formData to write local cookie //
				formData.push({name:'remember-me', value:$("input:checkbox:checked").length == 1})
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') window.location.href = '/home';
		},
		error : function(e){


           lv.showLoginError('Login Failure', 'Please check your email and/or password');
		}
	}); 
//	$('#user-tf').focus(); RETIRANDO O FOCU , POIS A TELA NÃO FICA NA PARTE SUPERIOR
	
// login retrieval form via email //
	

	
	$('#get-credentials-form').ajaxForm({
		url: '/lost-password',
		beforeSubmit : function(formData, jqForm, options){
			if (ev.validateEmail($('#email-tf').val())){
				ev.hideEmailAlert();
				return true;
			}	else{

				ev.showEmailAlert(" Error! ","Please enter a valid email address");
				return false;
			}
		},
		success	: function(responseText, status, xhr, $form){
			ev.showEmailSuccess("Please ","Check your email on how to reset your password.");
		},
		error : function(){
			ev.showEmailAlert("Sorry"," There was a problem, please try again later.");
		}
	});



	
	
})



