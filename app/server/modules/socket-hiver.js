var AM = require('./account-manager');
module.exports = function(app) {

	var io = require("socket.io").listen(app.listen(app.get('port')), function(){
		console.log("Server listening on port " + app.get('port'));
	})

	var usuarios = {};
	io.sockets.on("connection", function(socket){
		socket.emit("conectado");
		
		socket.on("register",function(data){
			usuarios[data.idMongo] = socket.id;
			console.log("Registrando usuário, idMongo: "+data.idMongo + " socketId: " + socket.id);
		});

		// socket.on("privmessage", function(data){
		//     var to = usuarios[data.toId];
		//     io.sockets.socket(to).emit(data);
		// });

		//	socket.emit("message", {message:" ", user:"Hiver Book"});
		socket.on("send", function(data){
	 		//socket.broadcast.emit("message", data);
	 		var to = usuarios[data.toId];
	 		io.sockets.socket(to).emit("message",data);
			AM.addNewMessage({
				owner: {id:data._id,name:data.user},
				from: {id:data.fromId,name:data.fromNameuser},
				to: {id:data.toId,name:data.toNameuser},
				text : data.message }, function(e,o){
				if (e){
					//res.send(e, 400);
					console.log(e);
				}	else{
					//res.send('ok', 200);

					console.log("ok");
			       
				}
			});
			AM.updateEvent({
				from: {id:data.fromId,name:data.fromNameuser,imgpath:data.fromImgPath},
				to: {id:data.toId,name:data.toNameuser,imgpath:data.toImgPath},
				message : data.message }, function(e,o){
				if (e){
					//res.send(e, 400);
					console.log(e);
				}	else{
					//res.send('ok', 200);

					console.log("######EVENTO REGISTRADO#################");
			       
				}
			});

		    console.log("Server teste: "+data.message);
	        console.log("xxxxxxxxxxx  "+data.message);
	
		});
	    socket.on('update_chatter_count', function(data){
	        io.sockets.emit('count_chatters', data);
	        console.log('update_chatter_count');
	    });

		//socket.emit("message",data);
		socket.on('message', function (message) {
			console.log(message);
		});
	});

}