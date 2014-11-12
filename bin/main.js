var five = require('johnny-five');
var nodecontroller = require('node-usbcontroller');
var config = require('./data/attack3.json');

var board = new five.Board();
var ready = false;

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

function motor(pin,nameTag){
	var self = this; //So that inner func. can have access to the this vars
	self.motor = new five.Servo(pin);
	self.active = false;
	self.sliderId = 'motor' + motors.length; //Ex. motor0
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

	controller.on('y-axis',function(data){
		data = Math.round(data/1.42); //Servo type inputs take a range from 0-180, data has a max of 255
	
		motors.forEach(function(val){ //cycle through each motor, and if they are active move them
			if(val.active){
				val.motor.to(data);
				$('#' + val.sliderId).slider('value',data);
			}
		});
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
}
catch(err){
	console.log(err);
	//TODO: If the controller is not connected start polling for it until it is
}

board.on('ready', function(){
	console.log('board connected');
	$('#arduinoStatus').html('Arduino Connected').css('background-color','#45F70D');
	
	motors.push(new motor(3,'Left Forward'));//Initialize the motors
	motors.push(new motor(4,'Right Forward'));
	motors.push(new motor(5,'Left Up'));
	motors.push(new motor(6,'Right Up'));
	//motors.push(new motor(7,'Claw Servo')); //Push these to the servos array
	//motors.push(new motor(8,'Rudder Servo'));
	
	
	
	if(motors.length === 4){//Checking length is probably an innefective means of finding connection number
		$('#motorsStatus').html(motors.length + ' Motors Connected').css('background-color','#45F70D');
	}
	else if(motors.length){
		$('#motorsStatus').html(motors.length + ' Motors Connected').css('background-color','#F76F14');
		console.log('warning: not all motors connected');
	}

	ready = true;
});  