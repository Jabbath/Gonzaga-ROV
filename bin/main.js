var five = require('johnny-five');
var nodecontroller = require('node-usbcontroller');
var config = require('./data/attack3.json');
var gui = require('nw.gui');

var newWin = gui.Window.open('./bin/camview.html',{position: 'center',
width: 1300,
height: 1024}); //Open our camera window

var board = new five.Board();
var ready = false;

var lasers = [];

function switchLasers(){
	if(lasers[0] === undefined || lasers[1] === undefined){ //Check if the lasers aren't set yet
		console.log('fired laser event but lasers are not set');
		return false;
	}
	
	function flip(num){//Made into a separate function so that the async callback still has access to the laser number
		lasers[num].query(function(state){
		console.log('pin %d is %d',num,state.value);
			state.value === 1 ? lasers[num].write(0) : lasers[num].write(1);
		});
	}
	
	for(var i=0;i<2;i++){//cycle through each pin, check its state and flip it
		flip(i);
	}
}
/*
############################
#0-left forward thruster   #
#1-right forward thruster  #
#2-top left thruster       #
#3-top right thruster      #
############################
*/

var motors = []; //will contain activation states for all motors
var servos = [];

function motor(pin,nameTag,uniqueId){
	var self = this; //So that inner func. can have access to the this vars
	self.motor = new five.Servo(pin);
	self.active = false;
	self.sliderId = 'motor' + uniqueId; //Ex. motor0
	self.statusId = self.sliderId + 'status';//Ex. motor0status
	
	self.changeStatus = function(){
		self.active = !self.active; //flip the activation state
		
		var id = '#' + self.statusId;
		var classes = $(id).attr('class').split(/\s+/); // Find the classes that are active
		
		if(classes[1] === 'statusDisabled'){
			$(id).removeClass('statusDisabled').addClass('statusEnabled'); //Remove the class responsible for disabled color and add enabled
			$(id).html(nameTag + ' Enabled');
		}
		else if(classes[1] === 'statusEnabled'){
			$(id).removeClass('statusEnabled').addClass('statusDisabled');
			$(id).html(nameTag + ' Disabled');
		}
	};
	
	self.manualChange = function(event,ui){ //if we want to slide with the mouse
		if(self.active) self.motor.to(ui.value);
	};
	
	$('#motorSliderContainer').append('<div class="sliderWrapper"><div id=' + self.sliderId + '></div></div>');
	$('#motorStatusContainer').append('<div class="thrusterStatus statusDisabled" id=' + self.statusId + '>' + nameTag + ' Disabled </div>'); 
	
	$(function(){
		$('#' + self.sliderId).slider({
			max:180,
			value: 90,
			slide: self.manualChange
		});		
	});
}

try{
	var controller = new nodecontroller(1133,49684,config);

	if(controller) $('#controllerStatus').html('Controller Connected').css('background-color','#45F70D');
	var turning = false;
	
	controller.on('y-axis',function(data){//This handles thruster control
		if(turning) return; //We don't want to fire the other motors while turning
		data = 135 - Math.round(data/2.83); //Servo type inputs take a range from 45-135, data has a max of 255
	
		motors.forEach(function(val){ //cycle through each motor, and if they are active move them
			if(val.active){
				val.motor.to(data);
				$('#' + val.sliderId).slider('value',data);
				//console.log(data);
			}
		});
	});
	
	controller.on('x-axis', function(data){
		if(!turning || !ready) return; //We should only run this if we are turning and the arduino is connected
		data = Math.round(data/2.83);
		var left = 45 + data; //Right is always firing the opposite direction of left
		var right = 135 - data;
		
		//console.log('left thruster value: %d, right thruster value: %d',left,right);
		motors[0].motor.to(left);
		$('#' + motors[0].sliderId).slider('value',left);
		motors[1].motor.to(right);
		$('#' + motors[1].sliderId).slider('value',right);
	});
	
	controller.on('trigger',function(data){//controls whether turning capability is enabled
		turning = !turning;
		
		if(!turning){//Change the status icon
			$('#turningStatus').removeClass('statusEnabled').addClass('statusDisabled'); //Turn it red
			$('#turningStatus').html('Not Turning');
		}
		else{
			$('#turningStatus').removeClass('statusDisabled').addClass('statusEnabled'); //Turn it green
			$('#turningStatus').html('Turning');
		}
	});
	
	controller.on('button2',function(data){
		if(!ready) return;
		console.log('button 2 fired, changing state of motor 3');
		motors[3].changeStatus();
	});
	
	controller.on('button3',function(data){
		if(!ready) return;
		console.log('button 3 fired, changing state of motor 2');
		motors[2].changeStatus();
	});

	controller.on('button4',function(data){
		if(!ready) return;
		console.log('button 4 fired, changing state of motor 0');
		motors[0].changeStatus();
	});
	
	controller.on('button5',function(data){
		if(!ready) return;
		console.log('button 5 fired, changing state of motor 1');
		motors[1].changeStatus();
	});
	
	controller.on('lever',function(data){//This handles servo control
		if(!ready) return;
		data = Math.round(data/1.42); //0 is open 180 is closed
		console.log('moving servo to %d',data);
		
		servos.forEach(function(val){
			if(val.active){
				val.motor.to(data);
				$('#' + val.sliderId).slider('value',data);
			}
		});
	});
	
	controller.on('button10',function(data){
		if(!ready) return;
		console.log('button 10 fired, activating servo 0');
		servos[0].changeStatus();
	});
	
	controller.on('button11',function(data){
		if(!ready) return;
		console.log('button 11 fired, activating servo 1');
		servos[1].changeStatus();
	});
	
	controller.on('button6',function(data){
		if(!ready) return;
		console.log('button 6 firing, changing laser status');
		switchLasers();
	});
}
catch(err){
	console.log(err);
	//TODO: If the controller is not connected start polling for it until it is
}

board.on('ready', function(){
	if(ready) return; //If computer goes to sleep this event will refire, this stops that
	console.log('board connected');
	$('#arduinoStatus').html('Arduino Connected').css('background-color','#45F70D');
	
	motors.push(new motor(8,'Left Forward','0'));//Initialize the motors
	motors.push(new motor(9,'Right Forward','1'));
	motors.push(new motor(10,'Left Up','2'));
	motors.push(new motor(11,'Right Up','3'));
	servos.push(new motor(7,'Claw Servo','4')); //Push these to the servos array
	
	if(board.type !== 'UNO'){//The UNO doesn't have pins 22 || 23 so we have to assign diff pins for the lasers
		lasers.push(new five.Pin({pin: 22, type: 'digital'}));//Init our lasers
		lasers.push(new five.Pin({pin: 23, type: 'digital'}));
		console.log('lasers inited', lasers);
	}
	else{
		lasers.push(new five.Pin({pin: 12, type: 'digital'}))
		lasers.push(new five.Pin({pin: 13, type: 'digital'}))
	}
	
	if(motors.length === 4){//Checking length is probably an innefective means of finding connection number
		$('#motorsStatus').html(motors.length + ' Motors Connected').css('background-color','#45F70D');
	}
	else if(motors.length){
		$('#motorsStatus').html(motors.length + ' Motors Connected').css('background-color','#F76F14');
		console.log('warning: not all motors connected');
	}

	ready = true;
	
});  