//Implements the locomotion layer
function Locomotion(params) {
	this.shape = params.shape;
	this.mass = params.mass;
	this.velocity = params.velocity;
	this.speed = params.velocity.length;
	this.boundingRadius = params.boundingRadius;
	this.maxForce = params.maxForce;
	this.maxSpeed = params.maxSpeed;
	this.shape.position = new Point(params.point.x,params.point.y);
	this.position = this.shape.position;
	this.mean = this.shape.position;
	this._smoothPos = new Point(params.shape.position.x,params.shape.position.y);
	this._smoothAcc = new Point(0,0);
	this._wander_side = 0;
	this._wander_up = 0;

	/*BASIS VECTORS INITIALISED TO RIGHT AND TOP TO MAKE SURE WANDER GIVES SOMETHING RIGHT FROM THE START*/
	this.basisParallel = new Point(1,0); 
	this.basisPerpendicular = new Point(0,-1);

	/* MESSING UP BADLY, TRY TO FIGURE OUT BUG OR ALTERNATIVE */
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

	this.steer = function(force,dt,event) {

		var adjForce = force;
		////console.log(this.steerToAvoidCollisions(parray).length/this.maxForce + " is ratio");
		//adjForce = adjForce.add(this.steerToAvoidCollisions(parray));
		var acc = adjForce.divide(this.mass);
		if (dt > 0) {
			var smoothRate = clip_value(20 * dt,0.15,0.4); // TUNE : Figure out a good formula, using default as of now
			this._smoothAcc = blend_vec(smoothRate,acc,this._smoothAcc);
		}
		this.velocity = clip_length(this.velocity.add(this._smoothAcc.multiply(dt)),this.maxSpeed);
		this.speed = this.velocity.length;
		this.position = this.position.add(this.velocity.multiply(dt));
		


		this.basisParallel = this.velocity.normalize();
		this.basisPerpendicular = this.basisParallel.rotate(90);



		var posSmooth = dt * 0.75;
		this._smoothPos = blend_vec(posSmooth,this.position,this._smoothPos);
		this.shape.position = this._smoothPos;
		this.mean.x = this._smoothPos.x;
		this.mean.y = this._smoothPos.y;

		var arousal = 8;		//property of a perosn later

		/*if (arousal > 0 && event.count%1.5) {

				var amplitude = arousal * 1.2;
				var	vibrationvec = this.velocity.normalize().rotate(90);
	 			vibrationvec = vibrationvec.multiply(Math.cos(this.mean.length) * amplitude);

				this.shape.position = this.mean.add(vibrationvec);
				//this.shape.position.y += Math.cos(this.mean.length) * amplitude;

				//console.log("AROUSED " + event);
		}*/
	}

	this.futurePosition = function(time) {
		/*This could also be this.shape.position (both are different because of the linear interpolation)
		TODO: If this gives poor results change to this.shape.position
		Could also use quadratic approximation term 1/2at^2, is it necessary?*/
		return this.position.add(this.velocity.multiply(time));
	}

	/* PROBLEM : WITHOUT SOME INITIAL VELOCITY THIS CAN NEVER WORK BECAUSE THE PARALLEL AND PERPENDICULAR
	VECTORS ARE VELOCITY DEPENDENT AND INITIALISED TO 0*/
	this.steeringWander = function(dt) {
		var speed = 12 * dt; //TODO : Tune with this
		this._wander_side = scalar_random_walk(this._wander_side,speed,-1,+1);
		this._wander_up = scalar_random_walk(this._wander_up,speed,-1,+1);
		////console.log(this._wander_side);
		//console.log(this._wander_up);
		var vx = this.basisParallel;
		var vy = this.basisPerpendicular;
		if (this.basisParallel.length == 0) {
			vx = new Point(1,0);
		} 
		if (this.basisPerpendicular.length == 0) {
			vy = new Point(0,-1);
		}
		var sideDist = vx.multiply(this._wander_side);
		var perpDist = vy.multiply(this._wander_up);
		return sideDist.add(perpDist);
	}

	this.steeringSeek = function(target) {
		var desire = target.subtract(this.position);
		return (desire.subtract(this.velocity)).normalize().multiply(this.maxForce);
	}

	this.steeringFlee = function(target) {
		var desire = position.subtract(this.target);
		return (desire.subtract(this.velocity)).normalize().multiply(this.maxForce);
	}


// (1)
	this.predictNearestApproachTime = function(other) {
		//console.log(this.velocity + " is this.vel");
		//console.log(other.velocity + " is obs.vel");
		
		var relative = other.velocity.subtract(this.velocity);
		var relativeSpeed = relative.length;
		
		if(relativeSpeed == 0){
			return 0;
		}
		var tanget = relative.normalize();

		var pos = this.position.subtract(other.shape.position);
		//console.log(tanget + "  " + pos);
		// if (position.length <= 2 * 15) {
		// 	return 0;
		// }
		var projection = tanget.dot(pos);
		//console.log(projection + " is projection");

		return projection/relativeSpeed;
	}

// (2)
	this.predictNearestApproachPosition = function(other,time) {
		var mytravel = this.velocity.multiply(time);
		var othertravel = other.velocity.multiply(time);
		var myfinal = this.position.add(mytravel);
		var otherfinal = other.shape.position.add(othertravel);


		return vector_distance(myfinal, otherfinal);
	}
	this.predictsloworfast = function(other,time) {
		//slow down or speed up
		var mytravel = this.velocity.multiply(time);
		var othertravel = other.velocity.multiply(time);
		var myfinal = this.position.add(mytravel);
		var otherfinal = other.shape.position.add(othertravel);

		fast = ((this.velocity.dot(myfinal.subtract(otherfinal)))>=0) ? 1:-1;
		return fast;
	}

	this.checkInCone = function(object) {
		var degToRad = 3.14/180;
		var halfangle = 100 * degToRad;
		var cus = Math.cos(halfangle);
		//console.log(cus);

		var line = object.shape.position.subtract(this.position);
		var direction = this.velocity.normalize;
		var ang = line.dot(direction);	//cosine of angle between obstacle and mover

		//angle should be less than halfangle, so ang > cus should do
		if(ang > cus) {
			return 1;
		} else {
			return 0;
		}

	}

	this.steerToAvoidCollisions = function(parray) {
		//console.log(parray.length + " is array size");
		if(parray.length) {
			//first see if any immediate threat
			var minSeparation = 2* 15;
			for(var i=0; i<parray.length; i++) {
				if(parray[i]!=this){
				if(this.checkInCone(parray[i])) {
				var dist = this.position.subtract(parray[i].shape.position);
				if(dist.length < minSeparation) {
					console.log(dist.length)
					console.log("Oh so close");
					var vy = this.velocity.rotate(90).normalize();
					var projn = dist.dot(vy);
					projn = (projn >= 0) ? 1:-1;
					 //console.log(vy.multiply(-4000) + " projn");
					 return (vy.normalize()).multiply(20*projn*this.maxForce).add(this.velocity.normalize().multiply(-10*this.maxForce));
					
					}
				}
			}
			}


			//to avoid obstacles, moving AND stationary
			var threat = false;
			var pspace = 3* 15;
			var mintimeuntilcollision = 40;			//tune these

			var time, mintime = mintimeuntilcollision;
			var index = 0;
			for(var i=0; i<parray.length; i++) {
				if(parray[i]!=this){
				if(this.checkInCone(parray[i])) {
				time = this.predictNearestApproachTime(parray[i]);
				//onsole.log(time)
				//console.log(time +" TIME");
				//if it collides soon enough -
				if(time >= 0 && time < mintime) {

					//if it collides close enough
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
			//console.log(mintime + " is mintime.")
			if(threat) {
				var obstacle = parray[index];
				var mindist = this.predictNearestApproachPosition(obstacle, mintime);
				var dist =(obstacle.position.subtract(this.position)).length
				// Del pos = v * t for now
				var obs_future = obstacle.position.add(obstacle.velocity.multiply(mintime));
				var my_future = this.position.add(this.velocity.multiply(mintime));
				var my_unit = this.velocity.normalize();
				var my_side = my_unit.rotate(90);
				var obs_unit = obstacle.velocity.normalize();
				var parallelness = my_unit.dot(obs_unit);
				//console.log(parallelness)
        		var angle = 0.707, steer = 0;
        		////console.log(this.velocity + " pll" + obstacle.velocity);
        		if (parallelness < -1*angle)
        		{
            		// anti-parallel "head on" paths:
		            // steer away from future threat position
            		console.log("anti-parallel");
            		var offset = obs_future.subtract(this.position);
            		var sideDot = offset.dot(my_side);
            		console.log(this.velocity);
            		console.log(obstacle.velocity);
            		steer = (sideDot >= 0) ? -3:3;
        		}
        		else
        		{
            		if (parallelness > angle)
            		{
                		// parallel paths: steer away from threat
                		//console.log("parallel");
                		offset = obstacle.position.subtract(this.position);
            			sideDot = offset.dot(my_side);
            			steer = (sideDot >= 0) ? -1 : 1;
            		}
            		else
            		{
                		// perpendicular paths: steer behind threat
	                	// (only the slower of the two does this)
                		if (obstacle.velocity.length <= this.velocity.length)
		                {	
                			//console.log("perpendicular");
                    		sideDot = my_side.dot(obstacle.velocity);
                    		steer = (sideDot >= 0) ? -1 : 1;
 
                		}
            		}
        		}
        		var fast = this.predictsloworfast(obstacle,mintime);
               	return(((my_side.multiply(steer)).multiply(5*this.maxForce)).add(this.velocity.multiply(fast*this.maxForce).normalize())).normalize().multiply(10*this.maxForce);
        		//return(((my_side.multiply(steer)).multiply(this.maxForce))).normalize().multiply(10*this.maxForce);
        		//(my_side.multiply(30000 * steer).add(this.velocity.multiply(-12000))).normalize().multiply(this.maxForce)
        		//offset = this.shaposition.subtract(obstacle.position);
        		////console.log(my_side.multiply(4000 * steer).add(this.velocity.multiply(-4000)) + " is force");

			} else {
				//nothing to avoid
				return new Point(0,0);
			}
		} else {
			//nothing in sight
			return new Point(0,0);
		}
	}

}

function vector_distance(vec1,vec2) {
	var res = vec1.subtract(vec2);
	return res.length;
}

function scalar_random_walk(initial,walkspeed,min,max) {
	var next = initial + rand_range(-walkspeed,walkspeed);
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