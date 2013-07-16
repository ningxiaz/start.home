/* 

This file contains the entire ambient display.
The datastructures for both the scene graph 
and the data input is defined,

and a function that builds the processing sketch is
defined and called.

*/



/* ==========================================

    Here we define the scene graph's objects
    Animation vs Drawing:
        For the Bubbles, we separate the ticking of the animation from the drawing,
        For the Clock, we determine exactly where to draw thus causing animation.

        Currently, the main processing.js draw call 

*/

/* 
   ==========================================  
    This is the bubbles
   ========================================== 
*/
function Bubble() {
    this.x = 0;
    this.y = 0;
    this.radius = 100.0;
    this.radiusScaling = 12;
    this.radiusRate = 18;
    this.drawRadius = this.radius;
}

Bubble.prototype.setup = function(ctx) {
    this.x = this.radius + Math.random()*(ctx.width - 2*this.radius);
    this.y = this.radius + Math.random()*(ctx.height - 2*this.radius);
    this.radiusScaling = 5 + Math.random()*2;
    this.radiusRate = 20 + Math.random()*2
}

//draw paints this bubble onto the given Context
Bubble.prototype.draw = function(ctx) {

    ctx.strokeWeight( 10 );
    ctx.fill( 0, 121, 184 );
    ctx.stroke(255); 
    ctx.ellipse(this.x, this.y, this.drawRadius, this.drawRadius);

}

//tick updates the animation OR SIMULATION of the bubble
Bubble.prototype.tick = function(ctx) {
    this.drawRadius = this.radius + this.radiusScaling*Math.sin(ctx.frameCount / this.radiusRate);
}

Bubble.prototype.update = function(c) {
    this.radius = 10+c.energy*7;
}

/* 
   ==========================================  
    This is the analog clock ticking
   ========================================== 
*/
function Clock() {
    //This has no state!
}

Clock.prototype.setup = function(ctx) {
    this.centerX = ctx.width - 100;
    this.centerY = 100;
    this.maxArmLength = 100;
}
Clock.prototype.draw = function(ctx) {
    // determine center and max clock arm length
    var centerX = this.centerX, centerY = this.centerY;

    var maxArmLength = this.maxArmLength;

    ctx.stroke(0);

    function drawArm(position, lengthScale, weight) {      
        ctx.strokeWeight(weight);
        ctx.line(centerX, centerY, 
            centerX + Math.sin(position * 2 * Math.PI) * lengthScale * maxArmLength,
            centerY - Math.cos(position * 2 * Math.PI) * lengthScale * maxArmLength);
    }

    var now = new Date();

    // Moving hours arm by small increments
    var hoursPosition = (now.getHours() % 12 + now.getMinutes() / 60) / 12;
    drawArm(hoursPosition, 0.5, 5);

    // Moving minutes arm by small increments
    var minutesPosition = (now.getMinutes() + now.getSeconds() / 60) / 60;
    drawArm(minutesPosition, 0.80, 3);

    // Moving hour arm by second increments
    var secondsPosition = now.getSeconds() / 60;
    drawArm(secondsPosition, 0.90, 1);    
}
Clock.prototype.tick = function(ctx) {

}



/* ==========================================  */
//Here we define out scene, consisting of a list of objects:

var scene = {
    objects: [],
    uninitializedObjects: [],
}

//Here we construct the static part of our scene:
scene.uninitializedObjects.push(new Clock());

var addCircuitListener = function(c) {
    var bubble = new Bubble();
    bubble.update(c);
    c.visualObject = bubble;
    scene.uninitializedObjects.push(bubble);
}



/* ==========================================

    Here we define the DataManager, which connects data input/output to your objects

    Since there's only ever one of there, I'm using the Revealing Module pattern
    http://addyosmani.com/resources/essentialjsdesignpatterns/book/
*/

DataManager = (function() {
    

    /* First, the initialization */

    var circuits = {};

    var addCircuitListener = undefined;
    var addCircuit = function(c) {
        circuits[c.name] = circuits[c.name] || {};
        circuits[c.name][c.region] = c;
        if (addCircuitListener)
            addCircuitListener(c);

    }
    var addAddCircuitListener = function(f) {
        addCircuitListener = f;
    }

    var modifyCircuit = function(name, region, newEnergy) {

        //The logic here is stupid, because
        //the Circuit objects itself should have
        //update logic that notifies the visual objects. 
        if (circuits[name]) {
            c = circuits[name][region]
            if (c) {
                c.energy = newEnergy;
                if (c.visualObject)
                    c.visualObject.update(c);
            }
        }
        return null;


    }

    //This is where we actually reveal which functions are public.
    return {
        addCircuit: addCircuit,
        addAddCircuitListener: addAddCircuitListener,
        modifyCircuit: modifyCircuit,
    }

})();

DataManager.addAddCircuitListener(addCircuitListener);

//DUMMY DATA INSERTION:
//We use dummy data, but obviously this can be coming from the server.
DataManager.addCircuit({name: "hvac",  region: "bedroom", energy: 5});
DataManager.addCircuit({name: "hvac",  region: "livingr", energy: 12});
DataManager.addCircuit({name: "utils", region: "kitchen", energy: 9});
DataManager.addCircuit({name: "utils", region: "office",  energy: 8});
DataManager.addCircuit({name: "light", region: "outside", energy: 6});

// Entrypoint for constructing the processing.js sketch
var sketchConstructor = function(processing) {

    processing.setup = function() {
        //Set up drawing the full screen size
        var c = document.getElementById("canvas1");
        processing.size(c.clientWidth, c.clientHeight);
        processing.frameRate(15);

    }

    //First we override the draw function,
    //which is periodically called by the Processing subsystem
    processing.draw = function() {
        if (scene.uninitializedObjects.length) {
            for (var i = 0; i < scene.uninitializedObjects.length; i++) {
                var o = scene.uninitializedObjects[i];
                o.setup(processing);
                scene.objects.push(o);
            }              
            scene.uninitializedObjects = [];
        }
        // erase background
        processing.background(224);
        // draw all objects
        for (var i = 0; i < scene.objects.length; i++) {
            scene.objects[i].tick(processing);            
            scene.objects[i].draw(processing);
        }    
    };

}
var canvas = document.getElementById("canvas1");
var sketch = new Processing(canvas, sketchConstructor);
