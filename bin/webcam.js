/* 
Info: http://www.kirupa.com/html5/accessing_your_webcam_in_html5.htm
http://www.purplesquirrels.com.au/2013/08/webcam-to-canvas-or-data-uri-with-html5-and-javascript/
http://cl.ly/code/303S1R1o332n#
*/

var recording = false; //Determines whether clicks are actually used

var video = document.querySelector('#video'); //Get a fix on out container
var src;

MediaStreamTrack.getSources(gotSources); //This is async so be careful

/*
input: Array
output: none
Looks through media sources to find the dazzle
*/
function gotSources(sources){
	for(var i=0;i<sources.length;i++){
		if(sources[i].label === "Dazzle DVC100 Video (2304:021a)"){
			src = sources[i].id;
		}
	}
	
	console.log('found source',src);
	initStream();
}

function initStream(){
	var option = { video: {optional: [{sourceId: src}]}};
	navigator.webkitGetUserMedia(option, handleVideo, videoError); //Ask for permission
}

function videoError(err){
	console.log('video error', err);
}

function handleVideo(stream){
  video.src = webkitURL.createObjectURL(stream);
}

$('#videoCanvas').click(canvasClick);

var references = [];
var points = [];

function startRecording(){
	recording = !recording;
	$('#messageBox').html('Select two reference points');
	references = [];//reset our points
	points = [];
}

/*
input: [Int,Int],[Int,Int]
output: [Int,Int]
Returns the delta between two coordinates 
*/
function delta(coord1,coord2){
	deltax = Math.abs(coord1[0]-coord2[0]);
	deltay = Math.abs(coord1[1]-coord2[1]);
	return [deltax,deltay];
}

function hyp(coord){
	return Math.sqrt(Math.pow(coord[0],2) + Math.pow(coord[1],2));
}

function processData(){
	var refDelta = delta(references[0],references[1]);//Get our px/cm
	var refPX = hyp(refDelta);
	var refDist =  parseInt($('#referDist').val())
	
	if(isNaN(refDist)){//If a number is not entered
		$('#messageBox').html('Fill in the reference distance and restart');
		return false;
	}
	
	var PXperm = refPX/refDist;
	console.log('px per m', PXperm);
	
	var pointsDelta = delta(points[0],points[1]);//Get distance between points
	var pointsPX = hyp(pointsDelta);
	
	var distance = pointsPX / PXperm;
	console.log('Distance is %d',distance);
	$('#messageBox').html('Distance is ' + distance + 'm');
	recording = false;
}

/*
input: Object
output: none
Processes the clicks on the canvas
*/
function canvasClick(event){
	var x = event.offsetX;
	var y = event.offsetY;
	console.log('x: %d y: %d',x,y);
	if(!recording) return; //we only need to continue if we are measuring
	
	if(references.length < 2){
		references.push([x,y]);
	}
	else if(references.length === 2 && points.length < 2){
		$('#messageBox').html('Select two points');
		points.push([x,y]);
	}
	
	if(references.length === 2 && points.length === 2){
		console.log('here');
		processData();
	}
}

$(document).ready(function(){
	var canvas = document.getElementById('videoCanvas');
	console.log($('#videoContainer').width())
	canvas.width = $('#videoContainer').width();
	canvas.height = $('#videoContainer').height();
});