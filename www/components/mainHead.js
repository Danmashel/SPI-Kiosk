angular.module('mainApp', ['ngAnimate'])
.controller("mainController", function($scope){
	$scope.steps = [];
	$scope.pics = [];
	$scope.favorites = [];
	$scope.thumbSize = function(sizeMultiplier){
		for(i in $scope.pics){
			$scope.pics[i].thumbSize = $scope.pics[i].originalThumbSize * sizeMultiplier;
		}
		$scope.$apply();
	}
	$scope.addFavorite = function(favName, favPath, favThumbSize){
		var indexValue = angular.element(document.getElementById('favoritesNav')).scope().favorites.length;
		angular.element(document.getElementById('favoritesNav')).scope().favorites.push({name:favName,path:favPath,thumbSize:"125",index:indexValue});
		toast('Added '+favName+" to favorites!", 2000)
	}
	$scope.removeFavorite = function(index){
		console.log("removed "+index);
		angular.element(document.getElementById('favoritesNav')).scope().favorites.splice(index,1);
		toast('Removed favorite', 2000);
		for(i in angular.element(document.getElementById('favoritesNav')).scope().favorites){
			angular.element(document.getElementById('favoritesNav')).scope().favorites[i].index = i;		
		}
	}
});

var socket = io();
socket.on("connect", function(){
	console.log("Connected to Server")
});

function getListing(path){	
	socket.emit('getData', path);
}

function deleteHigherSteps(index){
	for(i=index; i<=angular.element(document.getElementById('folderNav')).scope().steps.length+1; i++){
		angular.element(document.getElementById('folderNav')).scope().steps.splice(index,1);
		angular.element(document.getElementById('folderNav')).scope().$apply();
	}
}
function theftModal(){
	var picsLength = angular.element(document.getElementById('pictureNav')).scope().pics.length;
	if(picsLength <= 1){
			console.log(picsLength);
			$('#noStealingModal').openModal({dismissible:false});
		}
	else
		console.log(picsLength);
}
function clearAllFavorites(){
	var yesno = window.confirm("Confirm: This will remove all favorites")
	if(yesno == true){
		angular.element(document.getElementById('favoritesNav')).scope().favorites = [];
		angular.element(document.getElementById('favoritesNav')).scope().$apply();
	}
}

socket.on('returnData', function(returnData){
console.log(returnData[0]);
	if(returnData[0].hasChild == "true" && returnData[0].type == "directory"){
		deleteHigherSteps(returnData[0].step - 1);
		angular.element(document.getElementById('pictureNav')).scope().pics = [];
		//angular.element(document.getElementById('pictureNav')).scope().pics.push({name:"Please follow the steps above to find your pictures",path:"startHere.jpg",thumbSize:"300"});
		angular.element(document.getElementById('folderNav')).scope().steps.push(returnData[0]);
		angular.element(document.getElementById('folderNav')).scope().$apply();
	}
	else if(returnData[0].hasChild == "true" && returnData[0].type == "picture"){
		document.getElementById("folderNavColumn").style.position = "";
		theftModal();	
		angular.element(document.getElementById('pictureNav')).scope().pics = [];
		for(i in returnData[0].members){
			angular.element(document.getElementById('pictureNav')).scope().pics.push({
				name:returnData[0].members[i].name,
				path:returnData[0].members[i].path.replace(returnData[0].wwwDir,""),
				thumbSize:returnData[0].thumbSize,
				originalThumbSize:returnData[0].thumbSize
			});
		}
		angular.element(document.getElementById('pictureNav')).scope().$apply();
		
	}
	else{
		angular.element(document.getElementById('pictureNav')).scope().pics = [];
		angular.element(document.getElementById('pictureNav')).scope().pics.push();
		$('#nothingHereModal').openModal({dismissible:true});
		angular.element(document.getElementById('pictureNav')).scope().$apply();
	}
	$(document).ready(function(){
		$('.materialboxed').materialbox();
	});	
	$(document).ready(function() {
		$('select').material_select();
	});
	$('.tooltipped').tooltip({delay: 50});
	
  });
  socket.on('returnPhotosPath', function(photosPath){
	  console.log(photosPath);
	  getListing(photosPath)
  });
var IDLE_TIMEOUT = 300; //seconds
var _idleSecondsCounter = 0;
document.onclick = function() {
	_idleSecondsCounter = 0;
};
document.onmousemove = function() {
	_idleSecondsCounter = 0;
};
document.onkeypress = function() {
	_idleSecondsCounter = 0;
};
window.setInterval(CheckIdleTime, 1000);

function CheckIdleTime() {
	_idleSecondsCounter++;
	var oPanel = document.getElementById("SecondsUntilExpire");
		if (oPanel)
			oPanel.innerHTML = (IDLE_TIMEOUT - _idleSecondsCounter) + "";
		if (_idleSecondsCounter >= IDLE_TIMEOUT) {
			document.location.reload();
		}
}
