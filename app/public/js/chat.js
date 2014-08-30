window.onload = function(){
	var messages = [];
	var socket = io.connect('/');
	var sendButton = $("#enviar");
	var content = $("#conteudo");
	var seletorCampo = ".campo-msg";
	var seletorBtnEnviar = ".btn-send";
	var seletorBtnSelectUser =".im_dialog";
	var seletorNomeUsuario = "#nome-usuario";
	var seletorNomeToNameuser = "#nome-usuario-friend";
	var seletorIdUsuario = "#id-usuario";
	var seletorIdUsuarioFriend ="#id-user-friend";
	var seletorContainer = ".msg-container";
    var userPrivate = "#name_user";
    var btn=".clickMe";
    var seletorToImgPath="#to-img-path-friend";
    var seletorFromImgPath="#from-img-path-friend";




	function novaMensagem(data, isOdd){
		if(data.message) { 
			var now = new Date(); 
			//var isOdd = !$(".im_content_message_wrap .ng-scope").hasClass('odd');
			//alert(data.fromId);

		
			$("#"+data.fromId+"").html('<span class="badge bg-primary">1</span> ');
			var $lastGroup = $(".mid-side .group-rom:last");
			$lastGroup.removeClass('last-group');
			var $msgGroup = "<div class='im_message_wrap clearfix' > ";
			$msgGroup +="<div class='im_content_message_wrap ng-scope "+(isOdd == true ? 'odd' : 'even')+"'> ";
			$msgGroup +="<div class='im_content_message_select_area'> ";
			$msgGroup +="<i class='icon icon-select-tick'></i>";
			$msgGroup +="</div>";
			$msgGroup +="<div class='im_message_meta pull-right text-right'>";
			$msgGroup +="<span class='im_message_date' >"+moment().fromNow(); +" </span>";
			$msgGroup +=" </div>";
			$msgGroup +="<div class='im_message_body'> ";
			$msgGroup +="<a  class='im_message_author ng-scope ng-binding' >"+data.user.substring(0, 7) +"</a>  ";
			$msgGroup +="  <div class='im_message_text ng-scope ng-binding' >"+data.message+"</div>  ";
			$msgGroup +="         </div> ";
            $msgGroup +="  </div> ";
           	$msgGroup +="  </div> ";
			//$msgGroup += +isOdd ? 'odd' : '';
			//$msgGroup += "'>"+
			//data.user+"</div><div class='second-part'>"+
			//data.message+"</div><div class='third-part'></div></div>";



			//alert($msgGroup);
			if($lastGroup.size()==0)
				$(seletorContainer).append($msgGroup);
			else	
				$lastGroup.after($msgGroup);
			$(seletorContainer).scrollTop($(seletorContainer)[0].scrollHeight);
			debugger;
			//var alturaContainer = $(window).height() - 160;
			//$(seletorContainer).css('height',alturaContainer+'px');

		} else {
			console.log("Huston...", data);
		}

		//##########################################################
		//FAZ A ROLAGEM AUTOMÁTICA
		//##########################################################
		document.getElementById('chatrolagem').scrollTop = 1000000; 
 
	}	
	socket.on('message', function(data){
		novaMensagem(data, true);
	});
	function sendMessage(){
		var data = {  
			message:$(seletorCampo).val().isUrl('_blank'),//$(seletorCampo).val().isUrl('_blank'),
			user:$(seletorNomeUsuario).val(),
			_id:$(seletorIdUsuario).val(),
			fromId:$(seletorIdUsuario).val(),
			fromNameuser:$(seletorNomeUsuario).val(),
			toId:$(seletorIdUsuarioFriend).val(),
			toImgPath:$(seletorToImgPath).val(),
			fromImgPath:$(seletorFromImgPath).val(),
			toNameuser:$(seletorNomeToNameuser).val()


		}
		$(seletorCampo).val("");
		$(userPrivate).val("111111111111111");
		novaMensagem(data, false);
		socket.emit('send', data);	
		
	}

	socket.on("conectado",function(){
		var data = {
			idMongo:$("#from-user-post-id").val()
		}
		socket.emit("register",data);
	});



// Thank you Sam Hesler at StackOverflow!
//http://stackoverflow.com/questions/37684/replace-url-with-html-links-javascript




String.prototype.isUr2 = function(text) { 
    var rawText = strip(text)
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;   
    this.tmpChar = "";

    return rawText.replace(urlRegex, function(url) {   

    if ( ( url.indexOf(".jpg") > 0 ) || ( url.indexOf(".png") > 0 ) || ( url.indexOf(".gif") > 0 ) ) {
            this.tmpChar =  '<img src="' + url + '">' + '<br/>'
        } else {
            this.tmpChar =  '<a href="' + url + '">' + url + ' target=_blank </a>' + '<br/>'
        }
    }) 
    return this.tmpChar;
} 

		String.prototype.isUrl = function(targ){
			this.tmpChar = "";
			this.tmpChar += replaceURLWithHTMLLinks(this);
			return this.tmpChar;
		}

  	
	// $(document).ready(function(){
		// debugger;
		$(seletorCampo).keyup(function(e) {
			if(e.keyCode == 13){
				sendMessage();
				
				
			}
		});
		$(seletorBtnEnviar).click(function(e){
			sendMessage();

		});

		$(seletorBtnSelectUser).click(function(e){

			
			$(seletorIdUsuarioFriend).attr("value", this.id);
			/*alert('id '+this.id +  'nome: '+this.name);*/
           //var clickedID = this.id;

		});



	// });


function replaceURLWithHTMLLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  
  // any text to use as anchor text?
  var anchor = $(seletorCampo).val();
  if (anchor == "") {
     return text.replace(exp,"<a href='$1' target='_blank'>$1</a>");
     }
  else {
    return text.replace(exp,"<a href='$1' target='_blank'>" + anchor + "</a>");
   }
  }
  
}



