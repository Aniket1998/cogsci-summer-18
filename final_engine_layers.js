var parray = [];
var interactions = null;
function Behavior(params) {
	this.eagerness = params.eagerness;
	this.arousal = params.arousal;
	this.focus = params.focus;

	this.vibrate = function(basis,mean,count) {
		if(basis.length == 0) {
			var ran = new Point.random();
			basis = ran;
		}
		if (this.arousal > 0 && ((2 * count) % 3)) {
			var	vibrationvec = basis.multiply(Math.cos(mean.length) * this.vibrationAmplitude());
			return vibrationvec;
		} else {
			return new Point(0,0);
		}
	}

	this.vibrationAmplitude = function() {
		return this.arousal;
	}

	this.wanderSpeed = function(dt) {
		return 0.5 * Math.pow((10 - this.focus),2) * (60*dt);
	}

	this.wanderMagnitude = function() {
		return 100;
	}

	this.visionAngle = function() {
		return 15 * this.focus;
	}

	this.minDistance = function() {
		return 30;
	}

	this.threat = function() {
		return false;
	}

	this.pspace = function() {
		return 30;
	}

	this.minInteractionDistance = function() {
		return 100;
	}

	this.minTimeUntilCollision = function() {
		return 40;
	}

	this.getSeekCoefficient = function() {
		var seekCoeff;
		if(this.eagerness > 0){			
			seekCoeff = Math.pow(this.eagerness, 1.75)/30;
		} else {
			seekCoeff = Math.pow((10+this.eagerness)/10, 1.75)/30;
		}
		return seekCoeff;
	}


	this.getFleeCoefficient = function()  {
		var fleeCoeff;
		if(this.eagerness > 0){
			fleeCoeff = Math.pow(this.eagerness, 1.75)/30;
		} else {
			fleeCoeff = Math.pow((10+this.eagerness)/10, 1.75)/30;
		}
		return fleeCoeff;
	}

	this.getAvoidCoefficient = function() {
		return 0.03 * this.focus;
	}

	this.getWanderCoefficient = function() {
		return 8 * (10 - this.focus);
	}

}

function Locomotion(params) {
	this.behavior = params.behavior;

	this.shape = params.shape;
	this.mass = params.mass;
	this.velocity = params.velocity;
	this.speed = params.velocity.length;
	this.maxForce = params.maxForce;
	this.maxSpeed = params.maxSpeed;
	this.shape.position = new Point(params.point.x,params.point.y);
	this.position = this.shape.position;
	this.mean = new Point(this.position.x,this.position.y);
	this._wander_side = 0;
	this._wander_up = 0;

	this.basisParallel = this.velocity.normalize(); 
	this.basisPerpendicular = this.basisParallel.rotate(90);

	this._adjustForce = function(force,dt) {
		var maxAdjSpeed = this.maxSpeed * 0.2;
		if (this.velocity.length > maxAdjSpeed || force.length == 0) {
			return force;
		} else {
			var range = this.velocity.length/maxAdjSpeed;
			var cosine = scalar_interpolation(1.0,-1.0,Math.pow(range,20));
			return limit_max_deviation(force,cosine,this.basisParallel);
		}
	}

	this.steer = function(force,dt,count) {
		var acc = force.divide(this.mass);

		this.velocity = clip_length(this.velocity.add(acc.multiply(dt)),this.maxSpeed);
		this.speed = this.velocity.length;
		this.position = this.position.add(this.velocity.multiply(dt));

		this.basisParallel = this.velocity.normalize();
		this.basisPerpendicular = this.basisParallel.rotate(90);

		this.mean.x = this.position.x;
		this.mean.y = this.position.y;
		this.shape.position = this.mean.add(this.behavior.vibrate(this.velocity,this.mean,count));
	}

	this.getBasisPerpendicular = function() {
		if (this.basisPerpendicular.length < 1) {
			return new Point(0,-1);
		} else {
			return this.basisPerpendicular;
		}
	}

	this.getBasisParallel = function() {
		if (this.basisParallel.length < 1) {
			return new Point(1,0);
		} else {
			return this.basisParallel;
		}
	}

	this.futurePosition = function(time) {
		return this.position.add(this.velocity.multiply(time));
	}

	this.steeringWander = function(dt) {
		var wanderRate = this.behavior.wanderSpeed(dt);
		if(this.velocity.length < 1)
			wanderRate = wanderRate * this.velocity.length;
		var wanderStrength = this.behavior.wanderMagnitude();
		var displacement = random_vector(wanderRate);
		var wander = this.basisParallel.multiply(wanderStrength);
		wander = wander.add(displacement);
		return wander;
	}

	this.steeringSeek = function(target) {
		var desire = target.subtract(this.position);
		return (desire.subtract(this.velocity)).normalize().multiply(this.maxForce);
	}

	this.steeringFlee = function(target) {
		var desire = this.position.subtract(this.target);
		return (desire.subtract(this.velocity)).normalize().multiply(this.maxForce);
	}


	this.predictNearestApproachTime = function(other) {		
		var relative = other.velocity.subtract(this.velocity);
		var relativeSpeed = relative.length;
		if(relativeSpeed == 0){
			return 0;
		}
		var tanget = relative.normalize();
		var pos = this.position.subtract(other.position);
		var projection = tanget.dot(pos);
		return projection/relativeSpeed;
	}

	this.predictNearestApproachPosition = function(other,time) {
		var mytravel = this.velocity.multiply(time);
		var othertravel = other.velocity.multiply(time);
		var myfinal = this.position.add(mytravel);
		var otherfinal = other.shape.position.add(othertravel);
		return vector_distance(myfinal, otherfinal);
	}

	this.predictsloworfast = function(other,time) {
		var mytravel = this.velocity.multiply(time);
		var othertravel = other.velocity.multiply(time);
		var myfinal = this.position.add(mytravel);
		var otherfinal = other.shape.position.add(othertravel);
		fast = ((this.velocity.dot(myfinal.subtract(otherfinal)))>=0) ? 1:-1;
		return fast;
	}

	this.checkInCone = function(object) {
		var degToRad = 3.14/180;
		var halfangle = this.behavior.visionAngle() * degToRad; // PARAMETERISE
		var cus = Math.cos(halfangle);
		var line = object.shape.position.subtract(this.position);
		var direction = this.velocity.normalize;
		var ang = line.dot(direction);
		return (ang > cus);
	}

	this.steeringEvasion = function(other,maxpred) {
		var offset = this.position.subtract(other.position);
		var distance = offset.length;
		var roughtime = distance/other.speed;
		var predtime = roughtime;
		if (predtime > maxpred) {
			predtime = maxpred;
		}
		var target = other.futurePosition(predtime);
		return this.steeringFlee(target);
	}

	this.steeringPursuit = function(other,maxpred) {
		var offset = other.position.subtract(this.position);
		var distance = offset.length;
		var unitOffset = offset.normalize();
		var parallelness = this.basisParallel.dot(other.basisParallel);
		var forwardness = this.basisParallel.dot(unitOffset);
		var directTravelTime = distance/this.speed;
		var f = intervalComparison(forwardness,-0.707,+0.707);
		var p = intervalComparison(parallelness,-0.707,+0.707);
		var timeFactor = 0;
		switch (f)	{
    		case +1:
        		switch (p)
        		{
        			case +1:          // ahead, parallel
            			timeFactor = 4;
            			break;
        			case 0:           // ahead, perpendicular
            			timeFactor = 1.8;
            			break;
        			case -1:          // ahead, anti-parallel
            			timeFactor = 0.85;
            			break;
        		}
        		break;
    		case 0:
        		switch (p)
        		{
        			case +1:          // aside, parallel
            			timeFactor = 1;
            			break;
        			case 0:           // aside, perpendicular
            			timeFactor = 0.8;
            			break;
        			case -1:          // aside, anti-parallel
            			timeFactor = 4;
            			break;
        		}
        		break;
    		case -1:
        		switch (p)
        		{
        			case +1:          // behind, parallel
            			timeFactor = 0.5;
            			break;
        			case 0:           // behind, perpendicular
            			timeFactor = 2;
            			break;
        			case -1:          // behind, anti-parallel
            			timeFactor = 2;
            			break;
        		}
        	break;
    	}
    	var et = directTravelTime * timeFactor;
    	var etl = et;
    	if (etl > maxpred) {
    		etl = maxpred;
    	}
    	var target = other.futurePosition(etl);
    	return this.steeringSeek(target);
	}

	this.steerToAvoidCollisions = function() {
		if(parray.length) {
			var minSeparation = this.behavior.minDistance(); //PARAMETERISE
			for(var i=0; i<parray.length; i++) {
				if(parray[i]!=this){
					if(this.checkInCone(parray[i])) {
						var dist = this.shape.position.subtract(parray[i].shape.position);
						if(dist.length < minSeparation) {
							var vy = this.basisPerpendicular;
							var projn = dist.dot(vy);
							projn = (projn >= 0) ? 1:-1;
							return (vy.normalize()).multiply(20*projn*this.maxForce).add(this.velocity.normalize().multiply(-10*this.maxForce));
						}
					}
				}
			}

			var threat = this.behavior.threat();
			var pspace = this.behavior.pspace();
			var mintimeuntilcollision = this.behavior.minTimeUntilCollision();			//tune these

			var time, mintime = mintimeuntilcollision;
			var index = 0;
			for(var i=0; i<parray.length; i++) {
				if(parray[i]!=this){
				if(this.checkInCone(parray[i])) {
				time = this.predictNearestApproachTime(parray[i]);
				if(time >= 0 && time < mintime) {
					var mindist = this.predictNearestApproachPosition(parray[i], time);
					
					if(mindist < pspace) {
						console.log("Three close");
						mintime = time;
						threat = true;
						index = i;
					}
				}
				}
			}
			} 
			if(threat) {
				var obstacle = parray[index];
				var mindist = this.predictNearestApproachPosition(obstacle, mintime);
				var dist =(obstacle.position.subtract(this.position)).length
				var obs_future = obstacle.position.add(obstacle.velocity.multiply(mintime));
				var my_future = this.position.add(this.velocity.multiply(mintime));
				var my_unit = this.velocity.normalize();
				var my_side = my_unit.rotate(90);
				var obs_unit = obstacle.velocity.normalize();
				var parallelness = my_unit.dot(obs_unit);
        		var angle = 0.707, steer = 0;
        		if (parallelness < -1*angle)
        		{
            		var offset = obs_future.subtract(this.position);
            		var sideDot = offset.dot(my_side);
            	//	console.log(this.velocity);
            	//	console.log(obstacle.velocity);
            		steer = (sideDot >= 0) ? -3:3;
        		}
        		else
        		{
            		if (parallelness > angle)
            		{
                		offset = obstacle.position.subtract(this.position);
            			sideDot = offset.dot(my_side);
            			steer = (sideDot >= 0) ? -1 : 1;
            		}
            		else
            		{
                		if (obstacle.velocity.length <= this.velocity.length)
		                {	
                    		sideDot = my_side.dot(obstacle.velocity);
                    		steer = (sideDot >= 0) ? -1 : 1;
 
                		}
            		}
        		}
        		var fast = this.predictsloworfast(obstacle,mintime);
               	return(((my_side.multiply(steer)).multiply(5*this.maxForce)).add(this.velocity.normalize().multiply(fast*this.maxForce))).normalize().multiply(10*this.maxForce);

			} else {
				return new Point(0,0);
			}
		} else {
			return new Point(0,0);
		}
	}

	//Make externally sure that boid is never equal to this
	this.inBoidNeighborhood = function(boid,mindist,maxdist,maxcos) {
		if (boid == this) {
			return false;
		}
		var offset = boid.position.subtract(this.position);
		var dist = offset.length;
		//offset = offset.normalize();
		if (dist < mindist) {
			return true;
		} 
		if (dist > maxdist) {
			return false;
		}
		offset = offset.normalize();
		forwardness = this.basisParallel.dot(offset);
		return forwardness > maxcos;
	}

	this.steeringSeparation = function(mindist,maxdist,maxcos) {
		var steering = new Point(0,0);
		var offset,distsq;
		for (var i = parray.length - 1; i >= 0; i--) {
			if(parray[i] !== this && this.inBoidNeighborhood(parray[i],mindist,maxdist,maxcos)) {
				offset = this.position.subtract(parray[i].position);
				distsq = offset.dot(offset);
				steering = steering.add(offset.divide(distsq));
			}
		}
		return steering.normalize();
	}

	this.steeringAlignment = function(mindist,maxdist,maxcos) {
		var steering = new Point(0,0);
		var boids = 0;
		for (var i = parray.length - 1; i >= 0; i--) {
			if(parray[i] !== this && this.inBoidNeighborhood(parray[i],mindist,maxdist,maxcos)) {
				steering = steering.add(parray[i].basisParallel);
				boids++;
			}
		}
		if (boids > 0) {
			steering = steering.divide(boids);
			steering = steering.subtract(this.basisParallel);
			steering = steering.normalize();
		}
		return steering;
	}

	this.steeringCohesion = function(mindist,maxdist,maxcos) {
		var steering = new Point(0,0);
		var boids = 0;
		for (var i = parray.length - 1; i >= 0; i--) {
			if(parray[i] !== this && this.inBoidNeighborhood(parray[i],mindist,maxdist,maxcos)) {
				steering = steering.add(parray[i].position);
				boids++;
			}
		}
		if (boids > 0) {
			steering = steering.divide(boids);
			steering = steering.subtract(this.position);
			steering = steering.normalize();
		}
		return steering;
	}

	this.getAveragePoint(mindist,maxdist,maxcos) {
		var pt = new Point(0,0);
		var boids = 0;
		for (var i = parray.length - 1; i >= 0; i--) {
			if(parray[i] !== this && this.inBoidNeighborhood(parray[i],mindist,maxdist,maxcos)) {
				pt = pt.add(parray[i].position);
				boids++;
			}
		}
		if (boids > 0) {
			pt = pt.divide(boids);
		}
		return steering;
	}
}
//Appproach Time
//Interaction Time
//Termination Time

//Interaction can also serve the purpose of a longterm goal
/*
params = {
	approach : {
		behavior : new Behavior() 
		target : Point.random(),
		steer_context : 
		wander_context :
		avoid_context :
		flee_context :
		time : 
	} and similar for interaction

}
*/
function Interaction(after_behavior,priority) {
	var self = this;
	this.loco = null;
	this.person = null;
	this.layers = [];
	this.currentLayer = 0;
	this.after_behavior = after_behavior;
	this.priority = priority;

	this.setPerson = function(person) {
		this.person = person;
		this.loco = person.loco;
	}

	this.Layer = function(params) {
		this.behavior = params.behavior;
		if ('mindist' in params) {
			this.type = 'distance';
			this.mindist = params.mindist;
		} else if ('time' in  params) {
			this.type = 'time';
			this.time = params.time;
		}
		if('avoid_context' in params)
			this.avoid_context = params.avoid_context;
		if('seek_context' in params)
			this.seek_context = params.seek_context;
		if('flee_context' in params)
			this.flee_context = params.flee_context;
		if('wander_context' in params)	
			this.wander_context = params.wander_context;
		if ('target' in params) {
			this.target = params.target;
			if ('moving' in params) {
				this.moving = params.moving;
				this.predictTime = params.predictTime;
			} else {
				this.moving = false;
			}
		} else {
			this.target = null;
		}

		this.runLayer = function(dt) {
			if (this.type === 'distance') {
				if (this.target != null) {
					var dist;
					if (this.moving == false) {
						dist =  self.loco.position.subtract(this.target).length;	
					} else {
						dist = self.loco.position.subtract(this.target.position).length;
					}
					if (dist <= this.mindist) {
						self.updateLayer();
						return new Point(0,0);
					}
				} else {
					self.updateLayer();
					return new Point(0,0);
				}
			} else {
				if (this.time == 0) {
					self.updateLayer();
					return new Point(0,0);
				}
				this.time--;
			}
			var netForce = new Point(0,0);
			if (this.target != null && this.seek_context != null && this.seek_context != 0) {
				var b1 = self.person.behavior.getSeekCoefficient();
				var seekForce;
				if (this.moving == false) {
					seekForce = self.loco.steeringSeek(this.target).multiply(b1 * this.seek_context);
				} else {
					seekForce = self.loco.steeringPursuit(this.target,this.predictTime).multiply(b1 * this.seek_context);
				}
				netForce = netForce.add(seekForce);
			}
			if (this.target != null && this.flee_context != null && this.flee_context != 0) {
				var b2 = self.person.behavior.getSeekCoefficient();
				var fleeForce;
				if (this.moving == false) {
					fleeForce = self.loco.steeringFlee(this.target).multiply(b2 * this.flee_context);
				} else {
					fleeForce = self.loco.steeringEvasion(this.target,this.predictTime).multiply(b2 * this.flee_context);
				}
				netForce = netForce.add(fleeForce);
			}
			if (parray != null && parray.length > 0 && this.avoid_context != null && this.avoid_context != 0) {
				var b3 = self.person.behavior.getAvoidCoefficient();
				var avoidForce = self.loco.steerToAvoidCollisions().multiply(b3 * this.avoid_context);
				netForce = netForce.add(avoidForce);
			}
			if (this.wander_context != null && this.wander_context != 0) {
				var b4 = self.person.behavior.getWanderCoefficient();
				var wanderForce = self.loco.steeringWander(dt).multiply(b4 * this.wander_context);
				netForce = netForce.add(wanderForce);
			}
			return netForce;
		}
	}

	this.updateLayer = function() {
		this.currentLayer++;
		if (this.person.pid == 1) {
			console.log("Currentlayer is now " + this.currentLayer);
		}
		this.loco.velocity = new Point(0,0);
		if (this.active()) {
			this.person.setBehavior(this.layers[this.currentLayer].behavior);
		} else if (this.currentLayer == this.layers.length) {
			console.log("layers over "+this.currentLayer)
			if (this.after_behavior != null) {
				this.person.setBehavior(this.after_behavior);
			}
		}
	}

	this.addLayer = function(params) {
		this.layers.push(new this.Layer(params));
	}

	this.active = function() {
		return (this.currentLayer < this.layers.length);
	}

	this.run = function(dt) {
		if (this.active()) {
			return ((this.layers[this.currentLayer]).runLayer(dt));
		}
	}
} 

function LocalInteraction(interaction,point,loco) {
	this.interaction = interaction;
	this.point = point;
	this.loco = loco;
	this.getpoint = function() {
		if (this.point != null) {
			return this.point;
		} else {
			return this.loco.position;
		}
	}
}
function Person(pid,params) {
	this.loco = params.loco;
	this.behavior = this.loco.behavior;
	this.longterm_goal = params.longterm_goal;
	this.longterm_goal.setPerson(this);
	this.pid = pid;

	this.setBehavior = function(behavior) {
		this.loco.behavior = behavior;
		this.behavior = behavior;
	}
	
	this.action_select = function(event) {
		if (interactions == null) {
			return this.longterm_goal;
		} else {
			console.log("At least checking");
			var actions = [];
			for (var i = interactions[this.pid-1].length - 1; i >= 0; i--) {
				var act = interactions[this.pid-1][i];
				if (act != null && act.interaction.active()) {
					actions.push(act);
				} else if(act != null && act.interaction.active() == false) {
					interactions[this.pid-1][i] = null;
				}
			}

			var min = 0;
			if (actions[min] == null) {
				return this.longterm_goal;
			}

			var interactionDist = this.behavior.minInteractionDistance();
			var dist;
			for (var i = 1; i < actions.length; i++) {
				dist = this.loco.position.subtract(actions[i].getpoint()).length;
				if (actions[i]!=this && actions[i].interaction.priority > actions[min].interaction.priority && dist <= interactionDist && actions[i].interaction.active()) {
					min = i;
				} else if (actions[i]!=this && actions[i].interaction.priority == actions[min].interaction.priority && dist <= interactionDist && dist < this.loco.position.subtract(actions[min].getpoint()).length  && actions[i].interaction.active()) {
					min = i;
				}
			}
			if (actions[min] == null) {
				return this.longterm_goal;
			}
			dist = this.loco.position.subtract(actions[min].getpoint()).length;
			var checkr = actions[min].getpoint();
			if(this.pid == 1) console.log(checkr+" dist "+this.loco.position + " "+ dist);
			if (dist > interactionDist) {
				return this.longterm_goal;
			} 

			if (actions[min].interaction.priority > this.longterm_goal.priority && actions[min].interaction.active()) {
				actions[min].interaction.setPerson(this);
				var layer = actions[min].interaction.currentLayer;
				var behavior = actions[min].interaction.layers[layer].behavior;
				//console.log(behavior);
				this.setBehavior(behavior);
				//this.loco.velocity = new Point(0,0);
				actions[min].interaction.setPerson(this);
				console.log("SUcc")
				return actions[min].interaction;
			} else {
				return this.longterm_goal;
			}
		}

	/*this.action_select = function(event) {
		if (interactions == null) {
			if (this.pid == 1) {
				//console.log("Using longterm goal because interactions is null");
			}
			return this.longterm_goal;
		} else {
			var actions = [];
			for (var i = interactions[this.pid-1].length - 1; i >= 0; i--) {
				var act = interactions[this.pid-1][i];
				if (act != null && act.interaction.active()) {
					actions.push(act);
				} else if(act != null && act.interaction.active() == false) {
					interactions[this.pid-1][i] = null;
				}
			}
			var min = 0;
			if (actions[min] == null) {
				if (this.pid == 1) {
					//console.log("Using longterm goal because actions[min] is null");
				}
				return this.longterm_goal;
			}
			var mindist = this.loco.position.subtract(actions[min].getpoint()).length;
			for (var i = 1;i < actions.length;i++) {
				var dist = this.loco.position.subtract(actions[i].getpoint()).length;
				if (dist < mindist) {
					min = i;
					mindist = dist;
				}
			}
			if (actions[min] != null && actions[min].interaction.active() && mindist <= this.behavior.minInteractionDistance()) {
				actions[min].interaction.setPerson(this);
				var layer = actions[min].interaction.currentLayer;
				var behavior = actions[min].interaction.layers[layer].behavior;
				//console.log(behavior);
				this.setBehavior(behavior);
				this.loco.velocity = new Point(0,0);
				actions[min].interaction.setPerson(this);
				console.log("Following short term interaction " + actions[min].interaction.currentLayer);
				return actions[min].interaction;
			} else {
				if (this.pid == 1) {
					//console.log("Using longterm goal because");
				}
				return this.longterm_goal;
			}
		}*/
	}

	this.run = function(event) {
		var goal = this.action_select(event);
		if (goal.active()) {
			var force = goal.run(event.delta);
			//console.log(force);
			this.loco.steer(force,event.delta,event.count);
		}
	}
}
/*function Interaction(params) {
	this.loco = null;
	this.person = null;
	this.params = params;
	this.status = 0;

	this.sections = ['approach','interaction','termination'];

	this.setPerson = function(person) {
		this.person = person;
		this.loco = this.person.loco;
	}
	
	this.run = function(dt) {
		if (this.status < 3) {
			var force = this.getSteer(this.sections[this.status],dt);
			return force;
		} else {
			console.log("Action is complete already. Returning undefined force to cause error");
		}
	}

	this.getSteer = function(section,dt) {
		if (section === 'approach') {
			var target = this.params[section].target;
			if (target != null) {
				var dist = (target.subtract(this.person.loco.position)).length;
				if(dist < this.params[section].mindist) {
					this.status++;
					this.loco.velocity = new Point(0,0);
					if (this.status < 3) {
						this.person.setBehavior(this.params[this.sections[this.status]].behavior);
					} else if (this.status == 3) {
						this.person.setBehavior(this.params.after_behavior);
					}
					return new Point(0,0);
				}
			} else {
				this.status++;
				this.loco.velocity = new Point(0,0);
				if (this.status < 3) {
					this.person.setBehavior(this.params[this.sections[this.status]].behavior);
				} else if (this.status == 3) {
					this.person.setBehavior(this.params.after_behavior);
				}
				return new Point(0,0)
			}
		} else {
			if (this.params[section].time == 0) {
				this.status++;
				this.loco.velocity = new Point(0,0);
				if (this.status < 3) {
					this.person.setBehavior(this.params[this.sections[this.status]].behavior);
				} else if (this.status == 3) {
					this.person.setBehavior(this.params.after_behavior);
				}
				return new Point(0,0);
			}
			this.params[section].time--;
		}
		var netForce = new Point(0,0);
		if (this.params[section].target != null) {
			var c1 = this.params[section].steer_context;
			var b1 = this.person.behavior.getSeekCoefficient();
			netForce = netForce.add(this.loco.steeringSeek(this.params[section].target).multiply(c1 * b1));
			var c4 = this.params[section].flee_context;
			var b4 = this.person.behavior.getFleeCoefficient();
			netForce = netForce.add(this.loco.steeringFlee(this.params[section].target).multiply(c4 * b4));
		}
		var c2 = this.params[section].avoid_context;
		var b2 = this.person.behavior.getAvoidCoefficient();
		if (parray != null) {
			var f = this.loco.steerToAvoidCollisions().multiply(c2 * b2);
			netForce = netForce.add(f);
		}
		var c3 = this.params[section].wander_context;
		var b3 = this.person.behavior.getWanderCoefficient();
		netForce = netForce.add(this.loco.steeringWander(dt).multiply(c3 * b3));
		return netForce;
	}
}*/
//Only testing a single long term interaction right now
/*function Person(pid,params) {
	this.loco = new Locomotion(params.locomotion_params);
	this.behavior = this.loco.behavior;
	this.longterm_goal = new Interaction(params.longterm_goal,null);
	this.longterm_goal.setPerson(this);
	this.pid = pid;

	this.setBehavior = function(behavior) {
		this.loco.behavior = behavior;
		this.behavior = behavior;
	}

	this.action_select = function(event) {
		if (interactions == null) {
			return this.longterm_goal;
		} else {
			var ids = [];
			var actions = [];
			for (var i = interactions[this.pid-1].length - 1; i >= 0; i--) {
				var act = interactions[this.pid-1][i];
				if (act != null && act.interaction.status < 3) {
					ids.push(i);
					actions.push(act);
				} else if(act != null && act.interaction.status >= 3) {
					interactions[this.pid-1][i] = null;
				}
			}
			var min = 0;
			if (actions[min] == null) {
				return this.longterm_goal;
			}
			var mindist = this.loco.position.subtract(actions[min].getpoint()).length;
			for (var i = 1;i < actions.length;i++) {
				var dist = this.loco.position.subtract(actions[i].getpoint()).length;
				if (dist < mindist) {
					min = i;
					mindist = dist;
				}
			}
			if (actions[min] != null && actions[min].interaction.status < 3 && mindist <= this.behavior.minInteractionDistance()) {
				actions[min].interaction.setPerson(this);
				var status = actions[min].interaction.status;
				var phase = actions[min].interaction.sections[status];
				var behavior = actions[min].interaction.params[phase].behavior;
				console.log(behavior);
				this.setBehavior(behavior);
				actions[min].interaction.setPerson(this);
				return actions[min].interaction;
			} else {
				return this.longterm_goal;
			}
		}
	}

	this.run = function(event) {
		var goal = this.action_select(event);
		if (this.longterm_goal.status < 3) {
			var force = goal.run(event.delta);
			console.log(force);
			this.loco.steer(force,event.delta,event.count);
		}
	}
}*/

function random_vector(mag) {
	var randomx = Math.random();
	var randomy = Math.random();
	var maxAngle = 2 * Math.PI;
	var dx = Math.cos(randomx * maxAngle);
	var dy = Math.cos(randomy * maxAngle);
	var rand_vec = new Point(dx,dy);
	rand_vec = rand_vec.normalize();
	return rand_vec.multiply(mag);	
}

function vector_distance(vec1,vec2) {
	var res = vec1.subtract(vec2);
	return res.length;
}

function scalar_random_walk(initial,walkspeed,min,max) {
	var next = initial + rand_range(-1*walkspeed,walkspeed);
	if (next < min) {
		return min;
	}
	if (next > max) {
		return max;
	}
	return next;
}

//Utility functions for various math ops
function limit_max_deviation(force,conecos,basis) {
	if (force.length == 0) {
		return force;
	}
	var sourcecos = basis.dot(force.normalize());
	if (sourcecos >= conecos) {
		return force;
	}
	var perp = force.subtract(basis.multiply(basis.dot(force)));
	var unitperp = perp.normalize();
	var perpDist = Math.sqrt(1 - (conecos * conecos));
	var c0 = basis.multiply(conecos);
	var c1 = unitperp.multiply(perpDist);
	return c0.add(c1).multiply(force.length);
}

function scalar_interpolation(x1,x2,t) {
	return x1 + ((x2 - x1) * t);
}

function vector_interpolation(v1,v2,t) {
	var dif = v2.subtract(v1);
	dif = dif.multiply(t);
	return v1.add(dif);
}

function blend_vec(t,newvec,smooth) {
	return vector_interpolation(smooth,newvec,clip_value(t,0,1))
}

function clip_value(val,min,max) {
	if (val < min) {
		return min;
	} else if (val > max) {
		return max;
	} else {
		return val;
	}
}

function  rand_range(min,max) {
	return min + Math.random() * (max - min);
}

function clip_length(vec,len) {
	if (vec.length > len) {
		return vec.normalize().multiply(len);
	} else {
		return vec;
	}
}

function intervalComparison(x,lower,upper) {
	if (x < lower) {
		return -1;
	}
	if (x > upper) {
		return 1;
	}
	return 0;
}