
var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'hiverbook';
var BSON = require('mongodb').BSONPure;

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});
var accounts = db.collection('accounts');
var messages = db.collection('messages');
var events = db.collection('events');
var posts = db.collection('posts');

/* login validation methods */

exports.autoLogin = function(email, pass, callback)
{
	accounts.findOne({'local.email':email}, function(e, o) {
		if (o){
			o.local.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(email, pass, callback)
{
	accounts.findOne({'local.email':email}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.local.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

exports.validaLogin = function(email, callback)
{
	accounts.findOne({'local.email':email},function(e, o){
		if (o == null){
			callback('user-not-found');
		}	else{
			callback(null, o);
		}
	});
}
/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
    console.log("addNewAccount pass: " + newData.local.pass);
	accounts.findOne({'local.email':newData.local.email}, function(e, o) {
		if (o){
			callback('email-taken');
		}	else{
			accounts.findOne({'local.email':newData.local.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.local.pass, function(hash){
						newData.local.pass = hash;
					// append date stamp when record was created //
						newData.local.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, function(err){

								 if (err) callback(err);
					             else callback(null, newData);

                        });

					});
				}
			});
		}
	});
}


exports.addNewMessage = function(newData, callback)
{

    console.log("addNewMessage");
	newData.posted = moment().format('MMMM Do YYYY, h:mm:ss a');
	console.log("accounts.save: " + newData.posted);
	messages.insert(newData, {safe: true}, function(err) {
		console.log(err);
		console.log(newData);
		if (err) callback(err);
		else callback(null, newData);
	});

}


exports.updateAccount = function(newData, callback)
{

	var o_id = BSON.ObjectID.createFromHexString(newData._id);
	accounts.findOne({_id:o_id}, function(e, o){
		o.local.name 		= newData.local.name;
		o.local.email 	    = newData.local.email;
		o.local.imgpath     = newData.local.imgpath;
		if (newData.local.pass == ''){
			console.log("xxx updateAccount pass: " + newData.local.pass);
			accounts.save(o, {safe: true}, function(err) {
				console.log("accounts.save ");


				if (err) callback(err);
				else callback(null, o);
			});
		}	else{
			console.log("o.local.pass: " + newData.local.pass);
			saltAndHash(newData.local.pass, function(hash){
				o.local.pass = hash;
				console.log("accounts.save: " + o.local.name);
				accounts.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			});
		}
	});
}


exports.updatePassword = function(email, newPass, callback)
{
	console.log("updatePassword pass: " + newPass);
	accounts.findOne({'local.email':email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.local.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({'local.email':email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{'local.email':email, 'local.pass':passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(id,accountsEvents,callback)
{
	console.log("############################ ID "+id);
	try {

		accounts.find(
			
			{ $nor:[{_id:getObjectId(id)}]  }
			).toArray(
			function(e, res) {

				res.forEach(function(obj) {

					accountsEvents.forEach(function(obj2) {

						if (obj.local.name==obj2.to.name)
						{
							obj.local.name='0';
						}
						else
						{



						}
					});
				});

				if (e) callback(e)
					else callback(null, res)
			});

		} catch (err) {
			console.log("ID "+id+"  Error:", err)
		}	
};


function deleteFromArray(array, indexToDelete){
  var remain = new Array();
  for(var i in array){
    if(array[i] == indexToDelete){
      continue;
    }
    remain.push(array[i]);
  }
  return remain;
}







exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

exports.findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


exports.getAllMessages = function(fromId,toId, callback)
{     
    
	messages.find({ 

		           $or : [
		                 {$and :[{"from.id": fromId,"to.id": toId}]},
		                 {$and :[{"from.id": toId,"to.id": fromId}]}
		                 ]
		           }
                       
		).toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};





var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}





exports.updateEvent = function(newData, callback)
{
	//{'to.id': newData.to.id}
//newData.to.id
	events.findOne({

		           $or : [
		                 {$and :[{"from.id": newData.from.id,"to.id": newData.to.id}]},
		                 {$and :[{"from.id": newData.to.id,"to.id": newData.from.id}]}
		                 ]
		           }


      , function(e, eventsreturn) {

        
		if (eventsreturn) {
			eventsreturn.from.id=newData.from.id;
			eventsreturn.from.name=newData.from.name;
			eventsreturn.from.imgpath=newData.from.imgpath;
			eventsreturn.to.id=newData.to.id;
			eventsreturn.to.name=newData.to.name;
			eventsreturn.to.imgpath=newData.to.imgpath;
			eventsreturn.message=newData.message;         
			eventsreturn.lastPosted  = moment().format('MMMM Do YYYY, h:mm:ss a');
			eventsreturn.qtd+=1;


			events.save(eventsreturn,function(err) {
        		if (err) callback(err);
        		else callback(null, newData);
			});
               
        } else {
        	 console.log("###insert "+newData);


        	
        	newData.lastPosted = moment().format('MMMM Do YYYY, h:mm:ss a');
        	newData.qtd=1;
        	events.insert(newData, function(err) {
        		console.log(err);
        		console.log(newData);
        		if (err) callback(err);
        		else callback(null, newData);
        	});


        }
        if (e) callback(e)
		else callback(null, eventsreturn)

    });       

}



exports.updateQtdEvent = function(fromId, callback)
{

	events.findOne({'to.id': fromId}, function(e, eventsreturn) {

        
		if (eventsreturn) {

			eventsreturn.qtd=0;


			events.save(eventsreturn,function(err) {
        		if (err) callback(err);
        		else callback(null, eventsreturn);
			});
               
        } 
        if (e) callback(e)
		else callback(null, eventsreturn)

    });       

}

exports.getAllRecordsEvents = function(fromId,callback)
{ 

try {
	events.find(

                  {$or :[{"from.id": fromId},{"to.id": fromId}]}

		).sort( { "lastPosted": -1 } 
    ).toArray(

	function(e, res) {



            res.forEach(function(obj) {

             if (obj.from.id==fromId)
             {

             	//delete res[obj.from.name];

            } else   if (obj.to.id==fromId) // USUÁRIO LOGADO RECEBE A MENSSAGEM
             {
             	obj.to.name=obj.from.name;
             	obj.to.id=obj.from.id;
             	obj.to.imgpath=obj.from.imgpath;

            }
            });
		if (e) callback(e)
		else callback(null, res)
	});
} catch (err) {
    console.log("Error:", err)
}

};




exports.getAllFriends = function(id,accountsEvents,callback)
{

try {

	accounts.find(
		
		{ $nor:[{ _id:getObjectId(id) }]  }
		).toArray(
		function(e, res) {


        var arr = [];
        

		res.forEach(function(obj) {

		   
			accountsEvents.forEach(function(obj2) {


             
             if (obj.local.name==obj2.to.name)
             {

				var objarr={
					name:obj2.to.name,
					message:obj2.message,
					data:obj2.lastPosted,
					imgpath:obj2.to.imgpath


				};
				arr.push(objarr);

                //res.splice(obj2.to.name,1);
                //delete res[obj2.to.name];
              // delete obj.local.name;

             	}
             	else if (obj.local.name==obj2.from.name)
             	{
				var  objarr={
					name:obj2.to.name,
					message:obj2.message,
					data:obj2.lastPosted,
					imgpath:obj2.from.imgpath


				};
				arr.push(objarr);
               

             	}
			//console.log('Result: '+obj.to.id);

			});




        });




		if (e) callback(e)
		else callback(null, arr)
	});

} catch (err) {
    console.log("Error:", err)
}		
};



exports.addNewPost = function(newData, callback)
{

    console.log("addNewPost");
	newData.posted = moment().format('MMMM Do YYYY, h:mm:ss a');
	console.log("accounts.save: " + newData.posted);
	posts.insert(newData, {safe: true}, function(err) {
		console.log(err);
		console.log(newData);
		if (err) callback(err);
		else callback(null, newData);
	});

}

exports.getAllPosts = function(callback)
{     
    console.log("getAllPosts"); 
	posts.find().sort( { "posted": -1 }).toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};
