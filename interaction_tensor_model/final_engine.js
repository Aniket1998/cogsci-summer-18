//change to be made in wanderspeed

/*
var behavior1 = new Behavior({//normal(happy)
				eagerness : 8,
				arousal : 0,
				focus : 10
			});


var loco1 = {
				behavior : behavior1,
				velocity : new Point(0,0),
				mass : 1,
				boundingRadius : 25,
				maxForce : 400,
				maxSpeed : 100,
				shape : new Path.Circle({
					center : view.center,
					radius : 15,
					fillColor : 'red'
				}),
				point : view.center.add(new Point(-200,-200))

			}

var longterm_goals1 = {
				approach : {
					behavior : behavior1,
					target : loco3.point,
					steer_context : 1,
					avoid_context : 1,
					wander_context : 1,
					flee_context : 0,
					mindist : 30,
				},
				interaction : {
					behavior : behavior4,
					target : loco3.point,
					steer_context : 0,
					avoid_context : 0,
					wander_context : 0,
					flee_context : 0,
					time : 7 * 60
				},
				termination : {
					behavior : behavior4,
					target : null,
					steer_context : 0,
					avoid_context : 0,
					wander_context : 0,
					flee_context : 0,
					time : 7 * 60
				},
				after_behavior : behavior4
			}

var interaction12 = {
				approach : {
					behavior : behavior1,
					target : loco2.shape.position,
					steer_context : 1,
					avoid_context : 0,
					wander_context : 1,
					flee_context : 0,
					mindist : 65,
				},
				interaction : {
					behavior : behavior2,
					target : null,
					steer_context : 0,
					avoid_context : 0,
					wander_context : 0,
					flee_context : 0,
					time : 3 * 60
				},
				termination : {
					behavior : behavior2,
					target : null,
					steer_context : 0,
					avoid_context : 0,
					wander_context : 0,
					flee_context : 0,
					time : 60
				},
				after_behavior : behavior4
			}			

var person1 = new Person(1,{
				locomotion_params : loco1,
				longterm_goal : longterm_goals1
			});

parray.push(person4.loco);

			interactions = new Array(4);
			for (var i = interactions.length - 1; i >= 0; i--) {
				interactions[i] = new Array(4);
				for (var j = interactions[i].length - 1; j >= 0; j--) {
					interactions[i][j] = null;
				}
			}
			interactions[0][1] = new LocalInteraction(new Interaction(interaction12),null,person2.loco);
			interactions[1][0] = new LocalInteraction(new Interaction(interaction21),null,person1.loco);
			interactions[2][0] = new LocalInteraction(new Interaction(interaction31),null,person1.loco);
			interactions[3][1] = new LocalInteraction(new Interaction(interaction42),null,person2.loco);
			/*person1.setparray(entities);
			person2.setparray(entities);
			person3.setparray(entities);
			person4.setparray(entities);

			view.onFrame = function(event) {
				person1.run(event);			
*/

var parray = [];
var interactions = null;
var parray = []
function Behavior(params) {
	this.eagerness = params.eagerness;
	this.arousal = params.arousal;
	this.focus = params.focus;

	this.vibrate = function(basis,mean,count) {
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
		return (25* dt);
	}

	this.wanderMagnitude = function() {
		return 20 * this.focus;
	}

	this.visionAngle = function() {
		return 100;
	}

	this.minDistance = function() {
		return 30;
	}

	this.threat = function() {
		return false;
	}

	this.pspace = function() {
		return 45;
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
		return 5 * (10 - this.focus);
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

	this.basisParallel = new Point(1,0); 
	this.basisPerpendicular = new Point(0,-1);

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
		this.shape.position = this.mean.add(this.behavior.vibrate(this.getBasisPerpendicular(),this.mean,count));
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

	this.steerToAvoidCollisions = function() {
		if(parray.length) {
			var minSeparation = this.behavior.minDistance(); //PARAMETERISE
			for(var i=0; i<parray.length; i++) {
				if(parray[i]!=this){
					if(this.checkInCone(parray[i])) {
						var dist = this.position.subtract(parray[i].shape.position);
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
function Interaction(params) {
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
			/*if (this.status == 3) {
				this.person.setBehavior(this.params.after_behavior);
			}*/
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
		/*if (this.params[section].time == 0) {
			//console.log("End "+this.status);
			this.status++;
			this.loco.velocity = new Point(0,0);
			if (this.status < 3) {
				this.person.setBehavior(this.params[this.sections[this.status]].behavior);
			}
			return new Point(0,0);
		}
		this.params[section].time--;*/
		var netForce = new Point(0,0);
		if (this.params[section].target != null) {
			var c1 = this.params[section].steer_context;
			var b1 = this.person.behavior.getSeekCoefficient();
			//console.log("b1" + b1);
			//console.log("c1" + c1);
			netForce = netForce.add(this.loco.steeringSeek(this.params[section].target).multiply(c1 * b1));
			var c4 = this.params[section].flee_context;
			var b4 = this.person.behavior.getFleeCoefficient();
			//console.log("b4" + b4);
			//console.log("c4" + c4);
			netForce = netForce.add(this.loco.steeringFlee(this.params[section].target).multiply(c4 * b4));
		}
		var c2 = this.params[section].avoid_context;
		var b2 = this.person.behavior.getAvoidCoefficient();
		//console.log("c2 " + c2);
		//console.log("b2" + b2);
		if (parray != null) {
			var f = this.loco.steerToAvoidCollisions().multiply(c2 * b2);
		//	console.log("FOrce" + f);
			netForce = netForce.add(f);
		}
		var c3 = this.params[section].wander_context;
		var b3 = this.person.behavior.getWanderCoefficient();
		//console.log("c3" + c3);
		//console.log("c4" + c4);
		netForce = netForce.add(this.loco.steeringWander(dt).multiply(c3 * b3));
		return netForce;
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
//Only testing a single long term interaction right now
function Person(pid,params) {
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
			for (var i = 1; i < actions.length; i++) {
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
			// console.log(force);
			this.loco.steer(force,event.delta,event.count);
		}
	}
}

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