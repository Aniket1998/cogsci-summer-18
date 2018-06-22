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

	this.steer = function(force,dt, parray) {

		var adjForce = force;
		//console.log(this.steerToAvoidCollisions(parray).length/this.maxForce + " is ratio");
		//adjForce = adjForce.add(this.steerToAvoidCollisions(parray));
		var acc = adjForce.divide(this.mass);

		if (dt > 0) {
			var smoothRate = clip_value(9 * dt,0.15,0.4); // TUNE : Figure out a good formula, using default as of now
			this._smoothAcc = blend_vec(smoothRate,acc,this._smoothAcc);
		}

		this.velocity = clip_length(this.velocity.add(this._smoothAcc.multiply(dt)),this.maxSpeed);
		this.speed = this.velocity.length;
		this.position = this.position.add(this.velocity.add(dt));

		this.basisParallel = this.velocity.normalize();
		this.basisPerpendicular = this.basisParallel.rotate(90);

		var posSmooth = dt * 0.6;
		this._smoothPos = blend_vec(posSmooth,this.position,this._smoothPos);

		this.shape.position.x = this._smoothPos.x;
		this.shape.position.y = this._smoothPos.y;
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


// (1)
	this.predictNearestApproachTime = function(other) {
		console.log(this.shape.position+" is this.vel");
		console.log(other.shape.position+" is obs.vel");
		
		var relative = other.velocity.subtract(this.velocity);
		var relativeSpeed = relative.length;
		
		if(relativeSpeed == 0){
			return 0;
		}
		var tanget = relative.normalize();

		var pos = this.shape.position.subtract(other.shape.position);
		console.log(tanget + "  " + pos);
		// if (position.length <= 2 * 15) {
		// 	return 0;
		// }
		var projection = tanget.dot(pos);
		console.log(projection + " is projection");

		return projection/relativeSpeed;
	}

// (2)
	this.predictNearestApproachPosition = function(other,time) {
		var mytravel = this.velocity.multiply(time);
		var othertravel = other.velocity.multiply(time);
		var myfinal = this.shape.position.add(mytravel);
		var otherfinal = other.shape.position.add(othertravel);
		return vector_distance(myfinal,otherfinal);
	}

	this.checkInCone = function(object) {
		var degToRad = 3.14/180;
		var halfangle = 100 * degToRad;
		var cus = Math.cos(halfangle);
		console.log(cus);

		var line = object.shape.position.subtract(this.shape.position);
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
		//onsole.log(parray.length + " is array size");
		if(parray.length) {

			//first see if any immediate threat
			var minSeparation = 3 * 15;
			for(var i=0; i<parray.length; i++) {
				if(this.checkInCone(parray[i])) {
				var dist = this.shape.position.subtract(parray[i].shape.position);
				if(dist.length < minSeparation) {
					console.log("Oh so close");
					var vy = this.velocity.rotate(90);
					// var projn = dist.dot(this.velocity);
					 console.log(vy.multiply(-4000) + " projn");
					// if(projn>0) {
					 	return vy.multiply(-400000).add(this.velocity.multiply(-1000000));
					// }
					// else {
					// 	return vy.multiply(4000);
					// }
				}
				}
			}

			//to avoid obstacles, moving AND stationary
			var threat = false;
			var pspace = 40 * 15;
			var mintimeuntilcollision = 40;			//tune these

			var time, mintime = mintimeuntilcollision;
			var index = 0;
			for(var i=0; i<parray.length; i++) {
				if(this.checkInCone(parray[i])) {

				time = this.predictNearestApproachTime(parray[i]);
				console.log(time +" TIME");
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
			console.log(mintime + " is mintime.")
			if(threat) {
				var obstacle = parray[index];
				// Del pos = v * t for now
				var obs_future = obstacle.shape.position.add(obstacle.velocity.multiply(mintime));
				var my_future = this.shape.position.add(this.shape.position.multiply(mintime));
				var my_unit = this.velocity.normalize();
				var my_side = my_unit.rotate(90);
				var obs_unit = obstacle.velocity.normalize();
				var parallelness = my_unit.dot(obs_unit);
        		var angle = 0.707;
        		//console.log(this.velocity + " pll" + obstacle.velocity);
        		if (parallelness < -angle)
        		{
            		// anti-parallel "head on" paths:
		            // steer away from future threat position
            		console.log("anti-parallel");
            		var offset = obs_future.subtract(this.shape.position);
            		var sideDot = offset.dot(my_side);
            		steer = (sideDot > 0) ? -1 : 1;
        		}
        		else
        		{
            		if (parallelness > angle)
            		{
                		// parallel paths: steer away from threat
                		console.log("parallel");
                		offset = obstacle.shape.position.subtract(this.shape.position);
            			sideDot = offset.dot(my_side);
            			steer = (sideDot > 0) ? -1 : 1;
            		}
            		else
            		{
                		// perpendicular paths: steer behind threat
	                	// (only the slower of the two does this)
                		if (obstacle.velocity.length <= this.velocity.length)
		                {	
                			console.log("perpendicular");
                    		sideDot = my_side.dot(obstacle.velocity);
                    		steer = (sideDot > 0) ? -1 : 1;
                		}
            		}
        		}
        		//offset = this.shaposition.subtract(obstacle.position);
        		//console.log(my_side.multiply(4000 * steer).add(this.velocity.multiply(-4000)) + " is force");
        		return my_side.multiply(50000 * steer).add(this.velocity.multiply(-20000));

			} else {
				//nothing to avoid
				return new Point(0,0);
			}
		} else {
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

function PersonGrid(width,height) {
	this.width = width;
	this.height = height;
	this.grid = new Array(width);
	for (var i = this.grid.length - 1; i >= 0; i--) {
		this.grid[i] = new Array(height);
		for (var j = this.grid[i].length - 1; j >= 0; j--) {
			this.grid[i][j] = null;
		}
	}

	this.update = function(prev,next,person) {
		var prevx = Math.floor(prev.x);
		var prevy = Math.floor(prev.y);
		var nextx = Math.floor(next.x);
		var nexty = Math.floor(next.y);
		if (prevx < 0) {
			prevx = 0;
		}
		if (nextx < 0) {
			nextx = 0;
		}
		if (prevy < 0) {
			prevy = 0;
		}
		if (nexty < 0) {
		 	nexty = 0;
		}
		if (prevx >= this.width) {
			prevx = this.width - 1;
		}
		if (nextx >= this.width) {
			nextx = this.width - 1;
		}
		if (prevy >= this.height) {
			prevy = this.height - 1;
		}
		if (nexty >= this.height) {
			nexty = this.height - 1;
		}
	}

	this.set = function(pos,person) {
		var x = Math.floor(pos.x);
		var y = Math.floor(pos.y);
		if (x >= 0 && y >= 0) {
			if(x>959) x = 959;
			if(y>959) y = 959;
			this.grid[x][y] = person;
		}
	}

	this.localSearch = function (startx,endx,starty,endy,except) {
		startx = Math.floor(startx);
		endx = Math.floor(endx);
		starty = Math.floor(starty);
		endy = Math.floor(endy);
		if(startx<0) startx = 0;
		if(starty<0) starty = 0;
		if(endx<0) endx = 0;
		if(endy<0) endy = 0;

		if(startx>=960) startx = 959;
		if(starty>=960) starty = 959;
		if(endx>=960) endx = 959;
		if(endy>=960) endy = 959;

		var persons = [];
		for (var i = startx; i < endx; i++) {
			for (var j = starty; j < endy; j++) {
				if (this.grid[i][j] !== null && this.grid[i][j] !== except) {
					persons.push(this.grid[i][j]);
				}
			}
		}
		return persons;
	}
}