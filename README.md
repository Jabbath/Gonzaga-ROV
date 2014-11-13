Gonzaga-ROV
===========

The control center for the Gonzaga ROV team.

##Building

You will need to have <code>node.js</code> installed and in the path first. 
Make sure you have <code>Python 2.7.x</code> installed and in the path. You will also need 
Visual Studio 2012 Express (2013 should work too). See [here for more details](https://github.com/rogerwang/nw-gyp#installation).
Next, clone this repo.
Then, in the programs directory, run:

```
npm install -g node-pre-gyp nw-gyp
npm install johnny-five --runtime=node-webkit --target=0.8.6
npm install node-usbcontroller
```

Now, cd to <code>/node_modules/node-usbcontroller/node_modules/node-hid</code> and run:

```
nw-gyp rebuild --target=0.8.6
```

Now, [download node-webkit version 0.8.6](https://github.com/rogerwang/node-webkit#downloads). Extract it, and place 
all the files into the projects root directory.
The arduino that is to be used must be [running firmata](http://www.firmata.org/wiki/Main_Page). 

##Usage
Some notes on usage, the controller must be connected before launching the application and must not be disconnected during runtime. If this happens you will have
to restart the application. Secondly, the arduino should not be disconnected during runtime or you will have to restart the application.

```
Controls:
	Y-axis: move activated motors
	Button 2: activate upward right thruster
	Button 3: activate upward left thruster
	Button 4: activate forward left thruster
	Button 5: activate forward right thruster
```


##License
MIT. See license.txt
