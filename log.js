var fs = require('fs');
var moment = require('moment');

//Clear logs on startup
fs.writeFile('log.txt', '', function(){});

//Write two types, error, and standard log file.
var log = function(message){
	var time = moment().format('MM/DD-h:mm:ssa');
	message = "["+time+"]: "+ message+"\n";
	try{
		fs.appendFile('log.txt', message, function (err) {
			if(err)
				console.log(err);
		});
	}
	catch(err){
		console.log(err);
	}
}

exports.log = log;