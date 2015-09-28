var INotifyWait = require('inotifywait');
var im = require('imagemagick');
var fs = require('fs');
var process = require('child_process');
var async = require('async');
var log = require('./log.js').log;

//Generate thumbnails with asyc. Sleeps for 100ms before next batch of 1
function genThumb(openPath, callback){
	var names = openPath.split("/");
	var filename = names[names.length -1];
	try{
		im.convert([openPath, '-resize', '140', __dirname+"/www/thumbs/"+filename], //thumbsize width 140
			function(err, stdout){
				if (err)
				console.log('stdout: '+stdout);
			}
		);	
		log("Generated Thumbnail: " +filename);
	}
	catch(error){
		log(error);
	}
	//set time out before next batch process
	setTimeout(function(){callback();},250);	
}

//initialze thumbnail queue. Batch size max of 10
var thumbnailQueue = async.queue(genThumb, 10);

//Start up process: Makes sure thumbnails are up-to-date
process.exec("find "+__dirname+"/www/Photos -name '*.jpg'", function (error, stdout, stderr) {
	var names = stdout.split('\n');
	for(i in names){
		var files = names[i].split("/");
		if(fs.existsSync(__dirname + "/www/thumbs/"+files[files.length -1]) == false){
			thumbnailQueue.push(names[i]);
		}
	}
});

//initialize watcher on working directory
var watcher = new INotifyWait( __dirname + '/www/Photos', { recursive: true });

//set watcher to listen for watcher "create" event and generate thumbnail
watcher.on('add', function (filename) {
	thumbnailQueue.push(filename);
});

//Listen for "delete" event and remove thumbnail
watcher.on('unlink', function (filename) {
	var names = filename.split('/');
	var thumbPath = __dirname + "/www/thumbs/" + names[names.length -1];
	try{
		fs.unlinkSync(thumbPath);
		log("Deleted thumbnail: "+names[names.length -1]);
	}
	catch(error){
		log(error);
	}
});
 