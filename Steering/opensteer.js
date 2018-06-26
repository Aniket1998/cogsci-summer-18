//Implements the locomotion layer
function Locomotion(params) {
	this.shape = params.shape;
	this.mass = params.mass;
	this.velocity = params.velocity;
	this.speed = params.velocity.length;
	this.boundingRadius = params.boundingRadius;
	this.maxForce = params.maxForce;
	this.maxSpeed = params.maxSpeed;

	this.position = new Point(params.shape.position.x,params.shape.position.y);
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

	this.steer = function(force,dt) {
		//var adjForce = this._adjustForce(force,dt);
		var adjForce = force;
		var acc = adjForce.divide(this.mass);

		if (dt > 0) {
			var smoothRate = clip_value(9 * dt,0.15,0.4); // TUNE : Figure out a good formula, using default as of now
			this._smoothAcc = blend_vec(smoothRate,acc,this._smoothAcc);
		}

		this.velocity = clip_length(this.velocity.add(this._smoothAcc.multiply(dt)),this.maxSpeed);
		this.speed = this.velocity.length;
		this.position = this.position.add(this.velocity.multiply(dt));

		this.basisParallel = this.velocity.normalize();
		this.basisPerpendicular = this.basisParallel.rotate(90);

		var posSmooth = dt * 0.6;
		this._smoothPos = blend_vec(posSmooth,this.position,this._smoothPos);

		this.shape.position.x = this._smoothPos.x;
		this.shape.position.y = this._smoothPos.y;
	}

	this.forward = function() {
		if (this.basisParallel.length > 0) {
			return this.basisParallel;
		} else {
			return new Point(1,0);
		}
	}

	this.up = function() {
		if (this.basisPerpendicular.length > 0) {
			return this.basisPerpendicular;
		} else {
			return new Point(0,-1);
		}
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
		this._wander_side = scalar_random_walk(this._wander_side,speed,-5,+5);
		this._wander_up = scalar_random_walk(this._wander_up,speed,-1,+1);
		console.log(this._wander_side);
		console.log(this._wander_up);
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
		return desire.subtract(this.velocity);
	}

	this.steeringFlee = function(target) {
		var desire = position.subtract(this.target);
		return desire.subtract(this.velocity);
	}

	this.predictNearestApproachTime = function(other) {
		var relative = this.velocity.subtract(other.velocity);
		var relativeSpeed = relative.length;
		if (relative.length == 0) {
			return 0;
		}
		var tanget = relative.normalize();
		var position = this.position.subtract(other.position);
		var projection = tanget.dot(position);
		return projection/relativeSpeed;
	}

	this.predictNearestApproachPosition = function(other,time) {
		var mytravel = this.velocity.multiply(time);
		var othertravel = other.velocity.multiply(time);
		var myfinal = this.position.add(mytravel);
		var otherfinal = other.position.add(othertravel);
		return vector_distance(myfinal,otherfinal);
	}

	this.steeringPursuit = function(quarry,maxPred) {
		if (maxPred == 0) {
			maxPred = 100000;
		}
		var offset = quarry.position.subtract(this.position);
		var distance = offset.length();
		offset = offset.normalize();
		var parallelness = this.forward().dot(quarry.forward());
		var forwardness = this.forward().dot(offset);
		var directTime = distance/this.velocity.length;
		var f = interval_compare(forwardness,-0.707,0.707);
		var p = interval_compare(parallelness,-0.707,0.707);
		var timeFactor = 0;
		switch (f)
    	{
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
    	var et = directTime * timeFactor;
    	var etl = (et > maxPred) ? maxPred : et;
    	var target = quarry.futurePosition(etl);
    	return this.steeringSeek(target);
	}	
}


function PersonGrid(width,height) {
	
}
function interval_compare(x,min,max) {
	if (x < min) {
		return -1;
	}
	if (x > min) {
		return +1;
	}
	return 0;
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
