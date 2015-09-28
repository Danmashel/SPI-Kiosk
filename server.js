

//OPTIONS//

var thumbSize = "140"; //size of thumbnails in px to be displayed on the startPage
var port = "1337"; //the port which the server will start on. If port 80 then server must be run as root.

//END OPTIONS//


//****DO NOT EDIT BELOW****//
var express = require('express');
var http = require('http');
var socketIO = require('socket.io');
var process = require('child_process');
var path = require('path');
var fs = require('fs');
var im = require('imagemagick');
var tg = require('./thumbgen.js');
var log = require('./log.js').log;

var app = express();

function getListing(path, callback) {
	process.exec("find '"+path+"' -type d -o -name '*.jpg' -maxdepth 1 | sort -V", function (error, stdout, stderr) {
		var returnData = [], members = [], type = "", hasChild = "", instructions="";
		fs.readFile(path.replace(/\\ /g," ") + "/instructions.txt", 'utf8', function (err,instructions) {
			try {
				if(path !== __dirname+"/www/Photos")
					log("Client requested: " + path.replace(__dirname+"/www/Photos/",""));
				var lsData = stdout.split("\n");
				lsData.splice(0,1);
				lsData.splice(lsData.length-1,1);
				stepNumber = lsData[0].replace(__dirname+"/www/Photos","");
				stepNumber = stepNumber.split("/");
				stepNumber = stepNumber.length -1;
				for(i in lsData){
					var name = lsData[i].split("/");
					var name = name[name.length -1];
					var thumbpath = "null";
					if(name.indexOf(".jpg") > -1)
						var type = "picture";
					else
						var type = "directory";
					path = lsData[i];
					if(type == "picture")
						thumbpath = __dirname+"/www/thumbs/"+name;
					name = name.replace(".jpg","");
					members.push({name:name,path:path,thumbpath:thumbpath});	
				}
				if(instructions == null)
					instructions = "Please see a staff member for help";
				returnData.push({
					step:stepNumber,
					members:members,
					type:type,
					hasChild:"true",
					instructions:instructions,
					thumbSize:thumbSize,
					wwwDir:__dirname+"/www/"
				});
				callback(returnData);
			}
			catch(err){
				log(err);
				returnData.push({
					step:stepNumber,
					members:members,
					type:type,
					hasChild:"false",
					instructions:instructions,
					thumbSize:thumbSize,
					wwwDir:__dirname+"/www/"
				});
				callback(returnData);
			}
	
		});
	});
}


app.use(express.static(path.join(__dirname, "www")));
app.get("/", function(req, res){
	res.sendFile(__dirname, "www/index.html");
});
app.get("/log", function(req, res){
	res.sendFile(__dirname+"/log.txt");
});



var server = http.createServer(app);
var io = socketIO.listen(server, {log: false});

io.sockets.on("connection", function(socket){
	//console.log("A new connection was made");
	
	socket.on('getData', function(path){
		if(path.indexOf("/www/Photos") > -1)
			getListing(path, function(data){socket.emit('returnData', data);})
	});
	socket.on('getPhotosPath', function(){
		socket.emit('returnPhotosPath',__dirname+"/www/Photos");
	});
	
	
});

server.listen(port);
log("Server started and listening on port "+port);
