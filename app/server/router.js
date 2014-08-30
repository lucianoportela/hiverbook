
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var Account       = require('../models/account');


var newAccount            = new Account();
var fs = require('fs');
var moment = require('moment');


/// Include ImageMagick
var im = require('imagemagick');




module.exports = function(app, passport) {

	var socketHiver = require('./modules/socket-hiver')(app);

	app.get('/setlocale/:locale', function (req, res) {
	    res.cookie('locale', req.params.locale);
	    console.log("idioma " + req.params.locale);

	    res.redirect('back');

	});   



// main login page //

	app.get('/', function(req, res){
	
		if (req.cookies.email == undefined || req.cookies.pass == undefined || req.cookies._id == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
			AM.autoLogin(req.cookies.email, req.cookies.pass, function(o){
				if (o != null){
					console.log("zzzzzzzzzzzzzz");
				    req.session.email = o;
				    console.log("o"+o);
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){

		AM.manualLogin(req.param('email'), req.param('pass'), function(e, o){
			if (!o){
				console.log("manualLogin 400");
				res.send(e, 400);
			}	else{
			    req.session.email = o;
			    console.log("antes grava cookies: "+req.cookies.email);
				if (req.param('remember-me') == 'true'){
					res.cookie('email', o.local.email, { maxAge: 24*3600000 });
					res.cookie('pass', o.local.pass, { maxAge: 24*3600000 });
					res.cookie('_id', o._id, { maxAge: 24*3600000 });
					console.log("grava cookies: "+req.cookies.email);

				}
				res.send(o, 200);
			}
		});

	});


	
app.post("/novoPost", function(req, res){

 console.log("Resultado: " + req.files.name);

AM.addNewPost({

				owner: {id:req.body.userId,name:req.body.userName,imgpath:req.body.userImg},
				imgPost:req.body.existeFoto,
		        imgName:req.body.nomeImagem,
				text : req.body.userPostMsg }, function(e,o){
				if (e){
					//res.send(e, 400);
					console.log(e);
				}	else{
					//res.send('ok', 200);

				}
			});
    


if (req.body.existeFoto=="true")
{
    var uploadedFile = req.files.uploadingFile;
    var tmpPath = uploadedFile.path;
   
    var targetPath = __dirname + "/uploads/post/"+ req.body.nomeImagem;
    var caminhoImgPost ="/uploads/post/"+ req.body.nomeImagem;
 
    fs.rename(tmpPath, targetPath, function(err) {
    if (err) throw err;
    fs.unlink(tmpPath, function() {
        if (err) throw err;


          /*  fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);
            if (options.imageTypes.test(fileInfo.name)) {
                Object.keys(options.imageVersions).forEach(function (version) {
                    counter += 1;
                    var opts = options.imageVersions[version];
                    imageMagick.resize({
                        width: opts.width,
                        height: opts.height,
                        srcPath: options.uploadDir + '/' + fileInfo.name,
                        dstPath: options.uploadDir + '/' + version + '/' +
                            fileInfo.name
                    }, finish);
                });
            }*/

     var html = '<div class="recent-activity">';
         html += ' <div class="col-md-4 centered">';
         html += '    <div class="profile-pic">';
         html += '     <p><img   src="'+req.body.userImg+'" class="img-circle"></p>';
         html += '     <h4>1922</h4>';
         html += '     <h6>FOLLOWERS</h6>';
         html += '   </div>';
         html += ' </div> ';
         html += ' <div class="col-md-4 profile-text">';
         html += '   <h3>'+req.body.userName+'</h3>';
         html += '  <h5>'+req.body.date+'</h5>';
         html += '   <p><img   src="'+caminhoImgPost+'" class="img-post" ></p>';
         html += '   <p>'+req.body.userPostMsg+'</p>';
         html += '   <button class="btn btn-theme"><i class="fa fa-thumbs-up"></i> </button> ';
         html += '   <button class="btn btn-theme"><i class="fa fa-users"> 1,200 people</i> </button> ';
         html += '  </div>';
         html += ' </div>  ';
        
        var resposta = {
            html:html
        }
                
        res.json(resposta);            
        });
    });   
}
else // sem foto
{

 var html = '<div class="recent-activity">';
         html += ' <div class="col-md-4 centered">';
         html += '    <div class="profile-pic">';
         html += '     <p><img   src="'+req.body.userImg+'" class="img-circle"></p>';
         html += '     <h4>1922</h4>';
         html += '     <h6>FOLLOWERS</h6>';
         html += '   </div>';
         html += ' </div> ';
         html += ' <div class="col-md-4 profile-text">';
         html += '   <h3>'+req.body.userName+'</h3>';
         html += '  <h5>'+req.body.date+'</h5>';
         html += '   <p>'+req.body.userPostMsg+'</p>';
         html += '   <button class="btn btn-theme"><i class="fa fa-thumbs-up"></i> </button> ';
         html += '   <button class="btn btn-theme"><i class="fa fa-users"> 1,200 people</i> </button> ';
         html += '  </div>';
         html += ' </div>  ';
        
        var resposta = {
            html:html
        }
                
        res.json(resposta);

}




   
});


	// PROFILE SECTION =========================
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('home', {
			user : req.user
		});
	});




	// facebook -------------------------------

	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { failureRedirect: '/' }),
	  function(req, res) {
  	    req.session.email = req.user;
		res.cookie('email', req.user.local.email, { maxAge: 24*3600000 });
		res.cookie('pass', req.user.local.pass, { maxAge: 24*3600000 });
		res.cookie('_id', req.user._id, { maxAge: 24*3600000 });

	    res.redirect('/home');
	});

	app.get('/auth/google', passport.authenticate('google', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user

	app.get('/auth/google/callback',
	  passport.authenticate('google', { failureRedirect: '/' }),
	  function(req, res) {

	  	console.log("google name "+req.user.google.name);
	  	console.log("google email "+req.user.google.email);
	  	console.log("google token "+req.user.google.token);

  	    req.session.email = req.user;
		res.cookie('email', req.user.local.email, { maxAge: 24*3600000 });
		res.cookie('pass', req.user.local.pass, { maxAge: 24*3600000 });
		res.cookie('_id', req.user._id, { maxAge: 24*3600000 });




	    // Successful authentication, redirect home.
	    res.redirect('/home');
	});		



// logged-in email homepage //
function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
app.get('/showusers', function(req, res) {
	var fromId=req.cookies._id;

    	AM.getAllRecordsEvents(fromId, function(e, accountsEvents){
    		 	AM.getAllRecords(fromId,accountsEvents, function(e, accounts){

 	var html = '  <div class="chat-users-background"> ';

     accountsEvents.forEach(function(obj) {




		     html += '   <ul class="nav nav-pills nav-stacked"  data-name="'+obj.to.name+'"   > ';
		     html += ' <li  friend=\''+JSON.stringify(obj)+'\'  class="im_dialog_wrap"> ';
		     html += ' <a id="chatperson" name="'+obj.to.name+'" class="im_dialog"  > ';
		     html += ' <div class="im_dialog_meta pull-right text-right"> ';
		     html += ' <div class="im_dialog_date ng-binding" id="hora"> ';
  			 html += '                        <time data-momentjs>'+moment(obj.lastPosted, "MMMM Do YYYY, h:mm:ss a").fromNow();+'</time> ';
		     html += ' </div> ';
		     html += ' </div> ';
		     html += ' <div class="im_dialog_photo pull-left"> ';
		     html += '                       <img ';
		     html += '                          class="im_dialog_photo" ';
		     html += '                          my-load-thumb ';
		     html += '                          thumb="contact.userPhoto" ';
		     console.log("##AQUI");
		     console.log("##################################################"+obj.to.imgpath)
		     if ((obj.to.imgpath!=undefined) && (obj.to.imgpath!="undefined"))
		     {
		     	html += ' src="'+obj.to.imgpath+'" ';
		     }
		     else{
			    html += ' src="chat/img/users/UserAvatar4@2x.png" ';
		     }
		     html += '                        /> ';
		     html += '        </div> ';
		     html += '        <div class="im_dialog_message_wrap"> ';
		     html += '          <div class="im_dialog_peer"> ';
		     html += '            <span class="im_dialog_user" ng-bind-html="contact.user.rFullName">'+obj.to.name+'</span> ';
		     html += '          </div> ';
		     html += '          <div class="im_dialog_message"> ';
		     html += '  <div class="oi" id="'+obj.to.id+'"></div> ';
		     if (obj.qtd!=0)
		    {
             	html += ' <span class="badge bg-primary">1</span> ';
             }

		     html += '            <span class="im_dialog_message_text">'+obj.message+'</span> ';
		     html += '          </div> ';
		     html += '        </div> ';
		     html += '      </a> ';
		     html += '    </li> ';
		     html += '  </ul> ';    
		     
		});	



   accounts.forEach(function(obj) {
 

   	     obj={ _id:"538f57ea0bd484802a000002",
                 from:{
                    id:"undefined",
                    name:"undefined",
                    imgpath:"undefined"},
                  to:{ id:obj._id,
                       name:obj.local.name,
                       imgpath:obj.local.imgpath},
                 message:" ",
                 lastPosted:" ",
                 qtd:0}


          if (obj.to.name!='0')
          {

		     html += '   <ul class="nav nav-pills nav-stacked" data-name="'+obj.to.name+'"     > ';
		     html += ' <li  friend=\''+JSON.stringify(obj)+'\'  class="im_dialog_wrap"> ';
		     html += ' <a id="chatperson" name="'+obj.to.name+'" class="im_dialog"  > ';
		     html += ' <div class="im_dialog_meta pull-right text-right"> ';
		     html += ' <div class="im_dialog_date ng-binding" id="hora"> ';
  			 html += '                        <time data-momentjs>'+moment(obj.lastPosted, "MMMM Do YYYY, h:mm:ss a").fromNow();+'</time> ';
		     html += ' </div> ';
		     html += ' </div> ';
		     html += ' <div class="im_dialog_photo pull-left"> ';
		     html += '                       <img ';
		     html += '                          class="im_dialog_photo" ';
		     html += '                          my-load-thumb ';
		     html += '                          thumb="contact.userPhoto" ';
		     if (obj.to.imgpath!=undefined)
		     {
		     	html += ' src="'+obj.to.imgpath+'" ';
		     }
		     else{
			    html += ' src="chat/img/users/UserAvatar4@2x.png" ';
		     }
		     html += '                        /> ';
		     html += '        </div> ';
		     html += '        <div class="im_dialog_message_wrap"> ';
		     html += '          <div class="im_dialog_peer"> ';
		     html += '            <span class="im_dialog_user" ng-bind-html="contact.user.rFullName">'+obj.to.name+'</span> ';
		     html += '          </div> ';
		     html += '          <div class="im_dialog_message"> ';
		     html += '            <span class="im_dialog_message_text">'+obj.message+'</span> ';
		     html += '          </div> ';
		     html += '        </div> ';
		     html += '      </a> ';
		     html += '    </li> ';
		     html += '  </ul> ';    
		     }
		     
		});					


        
           html += '  </div> ';


  				html += '<script type="text/javascript"> ';		
				html += ' document.getElementById("chatrolagem").scrollTop = 0; ';		
				html += '</script> ';	





	    var resposta = {
            html:html
        }   
        res.json(resposta);              		


			  	}); 		
}); 












});		


function nameLeght (passedString) {
	var tailS="";
	if(passedString.length>(7)){
	tailS = '..';
	};
    var theString = passedString.substring(0,7)+tailS;
    return theString;
}

app.get('/messageprivate', function(req, res) {


		

   console.log(req.body);
    res.header("Access-Control-Allow-Origin", "*");
    console.log(req.query._id);


  //  res.send("OK");



       var fromId=req.cookies._id;
	   var toId = req.query.to.id;


   var html = '  <div class="user-head"> ';
     html += ' <div style="text-align: center;"> ';
     html += '<span><a onClick="backUsers();"  class=" chat-tools btn-theme"><i class="fa fa-mail-reply"></i> </a></span> ';
     html += '<span class="centereduser" >'+nameLeght(req.query.to.name)+'</span>  ';
     html += '<img class="im_dialog_photo"  ';
     console.log(req.query.to.imgpath);
     if ((req.query.to.imgpath!=undefined) && (req.query.to.imgpath!="undefined"))
     {
     	html += ' src="'+req.query.to.imgpath+'" ';
     }
     else{
	    html += ' src="chat/img/users/UserAvatar4@2x.png" ';
     }
    html += ' />  ';  
   
    html += '</div> ';  
    html += '</div> ';

    html = ' <div class="msg-container"> ';

    AM.updateQtdEvent(toId, function(e, qtd){});
    AM.updateQtdEvent(fromId, function(e, qtd){});

	AM.findById(toId, function(e, friend){
	    html += '<input type="hidden" id="id-user-friend" value="'+friend._id+'">';
        html += '<input type="hidden" id="nome-usuario-friend" value="'+friend.local.name+'">';
        html += '<input type="hidden" id="to-img-path-friend" value="'+friend.local.imgpath+'"> '; 
	});





    html += '<input type="hidden" id="from-img-path-friend" value="'+req.query.from.imgpath+'"> ';
    


 AM.getAllMessages(fromId,toId, function(e, user_messages){
			user_messages.forEach(function(obj) {
   				html += '<div id="mensagensparticular" class="im_message_wrap clearfix " > ';
                if (fromId==obj.from.id)
                {
                	html += '  <div id="mens" class="im_content_message_wrap ng-scope even"> ';
                }else
                {
					html += '  <div id="mens" class="im_content_message_wrap ng-scope odd"> ';                	
                }
   				html += '    <div class="im_content_message_select_area"> ';
    			html += '      <i class="icon icon-select-tick"></i> ';
			    html += '    </div> ';
    			html += '    <div class="im_message_meta pull-right text-right"> ';
			    html += '     <span class="im_message_date" id="then1" data-date="'+obj.posted+'">  <time data-momentjs>'+moment(obj.posted, "MMMM Do YYYY, h:mm:ss a").fromNow();+'</time> '; 
    			html += '     </span> ';
			    html += '   </div> ';
    			html += '   <div class="im_message_body"> ';
		    	html += '   <a  class="im_message_author ng-scope ng-binding" >'+nameLeght(obj.owner.name)+'</a> ';
			    html += '   <div class="im_message_text ng-scope ng-binding  " >'+obj.text+'</div> ';
    			html += '  </div> ';
			    html += ' </div> ';
    			html += '</div> ';						
           });

  				html += '<script type="text/javascript"> ';		
				html += ' document.getElementById("chatrolagem").scrollTop = 1000000; ';		
				html += '</script> ';		


		console.log(html);
        var resposta = {
            html:html
        }
        console.log(  resposta.html);      
        res.json(resposta);

		

          })




	});		

	
	app.get('/home', function(req, res) {



       var fromId=req.cookies._id;
	   var toId = req.param('x');
	   if (toId==null)
	   {
          toId="000000af1ffd5a0000dab7e2";

	   }

	    if (req.session.email == null){
	// if email is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{


            if (req.param('x')!=null)
               AM.updateQtdEvent(toId, function(e, qtd){});

            AM.getAllPosts(function(e,posts2 ){

            AM.getAllMessages(fromId,toId, function(e, messages){
              	AM.getAllRecordsEvents(fromId, function(e, accountsEvents){


					AM.getAllRecords(fromId,accountsEvents, function(e, accounts){

                        AM.getAllFriends(fromId,accountsEvents, function(e, friends){
							AM.findById(toId, function(e, friend){
								res.render('home', { title : 'Account List',
						 		moment: moment ,	
						 		countries : CT,
					     		accountData : req.session.email,
						 		accts : accounts,
						 		friendsmens:friends,
						 		acctsEvents:accountsEvents,
								user_messages : messages,
							 	userFriend:friend,
							 	posts : posts2 });
							});
					    });
					});
			  	}); 	

            });

			});











	    }
	});






	
	app.post('/home', function(req, res){
		console.log("home2 "+req.param('email'));
		if (req.param('email') != undefined) {
			AM.updateAccount({
				name 		: req.param('name'),
				email 	    : req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.email = o;
			// update the email's login cookies if they exists //
					if (req.cookies.email != undefined && req.cookies.pass != undefined){
						res.cookie('local.email', o.local.email, { maxAge: 900000 });
						res.cookie('local.pass', o.local.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('local.email');
			res.clearCookie('local.pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});


	// logged-in email settings //



	
	app.get('/settings', function(req, res) {
	    if (req.session.email == null){
	// if email is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else{
			res.render('settings', {
				title : 'Control Panel',
				countries : CT,
				accountData : req.session.email
			});
	    }
	});
	
	app.post('/settings', function(req, res){

		console.log("/settings email: " + req.param('email-signup'));
		console.log("/settings name: " + req.param('name-signup'));
		console.log("req.param(img) "+req.param('imagem'));
	

		if (req.param('img') !="")
           imgvalor=req.param('img');
        else 
           imgvalor="";

        console.log("TESTA IMAGEM  "+ req.param('imagem'));
        if (req.param('imagem') !="")  {
        	imgvalor="/uploads/profile/" + req.param('_id');

            console.log("resize")
			/*resize({
			  src: '/uploads/profile/',
			  dest: '/uploads/temp/',
			  width: 50
			});
*/          console.log(" TESTE " +req.files.imagem.path);
        	
			fs.readFile(req.files.imagem.path, function (err, data) {


				var imageName = req.files.imagem.name;
				
				console.log("ENTRA  "+ imageName);

				/// If there's an error
				if(!imageName){

					console.log("There was an error")
					res.redirect("/");
					res.end();

				} else {

				  var newPath = __dirname + "/uploads/profile/" + req.param('_id');
        		  var thumbPath = __dirname + "/uploads/thumbs/" + req.param('_id');
				  /// write file to uploads/fullsize folder
				  
				  //console.log("imgvalor imgvalor imgvalor "+ imgvalor);
                  console.log("Caminho: "+newPath);
                  console.log("Caminho: "+thumbPath);
				 fs.writeFile(newPath, data, function (err) {
				  	 /* var resize = im().resize('200x200').quality(90);
						im(thumbPath)
						  .resize('200x200')
						  .quality(90)
						  .options({
						    'strip': undefined,
						    'gaussian-blur': 0.05,
						    'interlace': 'Plane'
						  }); 
*/
		        
				  	/// let's see it
				  //	res.redirect("/uploads/fullsize/" + imageName);

				  });

				}
			});
		}
		else{

       imgvalor="/chat/img/users/UserAvatar"+randomIntInc(1,8)+"@2x.png";
           
        
		}
        console.log("ZZZZZZZZZ "+ imgvalor);
		if (req.param('email-signup') != undefined) {
			console.log("Entrou aqui:"+ req.param('_id'));
			AM.updateAccount({
				_id 		: req.param('_id'),
    		    local       : {
				name 		: req.param('name-signup'),
				email 	    : req.param('email-signup'),
				pass		: req.param('pass-signup'),
				imgpath     : imgvalor}
			}, function(e, o){
				if (e){
					console.log("ERRO ");
					res.send('error-updating-account', 400);
				}	else{
                   console.log("SALVA ");
					req.session.email = o;
			// update the email's login cookies if they exists //
					if (req.cookies.email != undefined && req.cookies.pass != undefined){
						res.cookie('email', o.email, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					
					res.send('ok', 200);

				}
			});
		}	else if (req.param('settings') == 'true'){
			res.clearCookie('email');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  
			title: 'Signup', 
			countries : CT,
			accountData : newAccount });
	});



         
	app.post('/signup', function(req, res){
    	
        var  imgvalor="/chat/img/users/UserAvatar"+randomIntInc(1,8)+"@2x.png";
		AM.addNewAccount({
    		local        : {
        	name         : req.param('name-signup'),
        	email        : req.param('email-signup'),
        	pass         : req.param('pass-signup'),
        	imgpath      : imgvalor     

    	}}, function(e,o){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
                if (o != null){
					res.cookie('email', o.local.email, { maxAge: 900000 });
					res.cookie('pass', o.local.pass, { maxAge: 900000 });
					res.cookie('_id', o._id, { maxAge: 900000 });                 
                   res.redirect('/home');
                   console.log('Entra home');
                }	else{
                    res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			}
		});
	});

// password reset //

app.get('/lost-password', function(req, res) {
		res.render('lost-password', {  title: 'lost-password', countries : CT });
		/*AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give email feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});		*/
	});
	

	app.post('/lost-password', function(req, res){
	// look up the email's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give email feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});



	app.get('/secure-logout', function(req, res) {
        res.clearCookie('pass');
        res.clearCookie('email');
        res.clearCookie('_id');
      //  delete req.session.email;
	  //  res.render('reset', { title : 'Reset Password' });

	    res.redirect('/');

	});

	app.get('/reset-password', function(req, res) {


		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the email's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {

		var nPass = req.param('pass');
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				//res.send('ok', 200);
				res.redirect('/#section-3');
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){

		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('email');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	// route middleware to ensure user is logged in
	function isLoggedIn(req, res, next) {
		if (req.isAuthenticated())
			return next();

		res.redirect('/');
	}
//	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });


/*
app.get('/chat/:id', function(req, res){

    var ObjectID = require('mongodb').ObjectID;

    var listData = function(err, collection) {

        var chosenId = new ObjectID(req.params.id);
        collection.findOne({'_id' : chosenId} , function(err, results) {
            console.log(results);
            res.render('edit.html', { layout : false , 'title' : 'Monode-crud', 'results' : results });
        });
    }

    var Client = new Db('monode-crud', new Server('127.0.0.1', 27017, {}));
    Client.open(function(err, pClient) {
        Client.collection('users', listData);
        //Client.close();
    });

});*/

/*

io.sockets.on("connection", function (client) {  
	client.emit("message", {message:"Welcome to the chat", user:"Hiver Book"});


    client.on("send", function(name) {
    roomID = null;
    //people[client.id] = {"name" : name, "room" : roomID};
    client.emit("update", "You have connected to the server.");
    //socket.sockets.emit("update", people[client.id].name + " is online.")
    socket.sockets.emit("update-people", people);
    client.emit("roomList", {rooms: rooms});
    clients.push(client); //populate the clients array with the client object
});
});  
*/

};
