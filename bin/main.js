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

function motor(pin){
	this.motor = new five.Servo(pin);
	this.active = false;
	this.sliderId = 'motor' + motors.length;
	var sliderId = this.sliderId; //So the jquery function can access it
	$('#motorSliderContainer').append('<div id=' + this.sliderId + '></div>');
	
	$(function(){
		$('#' + sliderId).slider({
			max:180,
			value: 90 
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
		motors[0].active = !motors[0].active;
	});
	
	controller.on('button3',function(data){
		if(!ready) return;
		motors[1].active = !motors[1].active;
	});

	controller.on('button4',function(data){
		if(!ready) return;
		motors[2].active = !motors[2].active;
	});
	
	controller.on('button5',function(data){
		if(!ready) return;
		motors[3].active = !motors[3].active;
	});
}
catch(err){
	console.log(err);
}

board.on('ready', function(){
	console.log('board connected');
	$('#arduinoStatus').html('Arduino Connected').css('background-color','#45F70D');
	
	motors.push(new motor(3));
	motors.push(new motor(4));
	motors.push(new motor(5));
	motors.push(new motor(6));
	
	if(motors.length === 4){//Checking length is probably an innefective means of finding connection number
		$('#motorsStatus').html(motors.length + ' Motors Connected').css('background-color','#45F70D');
	}
	else if(motors.length){
		$('#motorsStatus').html(motors.length + ' Motors Connected').css('background-color','#F76F14');
		console.log('warning: not all motors connected');
	}

	ready = true;
});  

function changeSpeed(event, ui){
	servo.to(ui.value);
	console.log('servo moving to %d',ui.value);
}  