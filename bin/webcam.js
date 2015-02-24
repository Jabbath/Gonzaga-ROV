/* 
Info: http://www.kirupa.com/html5/accessing_your_webcam_in_html5.htm
http://www.purplesquirrels.com.au/2013/08/webcam-to-canvas-or-data-uri-with-html5-and-javascript/
http://cl.ly/code/303S1R1o332n#
*/

var video = document.querySelector('#videoContainer'); //Get a fix on out container
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
