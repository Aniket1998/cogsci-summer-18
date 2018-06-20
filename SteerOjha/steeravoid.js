//Implements the locomotion layer
function Locomotion(params) {
	this.shape = params.shape;
	this.mass = params.mass;
	this.velocity = params.velocity;
	this.speed = params.velocity.length;
	this.boundingRadius = params.boundingRadius;
	this.maxForce = params.maxForce;
	this.maxSpeed = params.maxSpeed;
	this.shape.position = this.shape.position.add(params.point);
	this.position = this.shape.position;
	this._smoothPos = this.shape.position;
	this._smoothAcc = new Point(0,0);

	this.basisParallel = this.velocity.normalize();
	this.basisPerpendicular = this.basisParallel.rotate(90);

	//
	this._adjustForce = function(force,dt) {
		var maxAdjSpeed = this.maxSpeed * 0.2;
		if (this.speed > maxAdjSpeed || force.length == 0) {
			return force;
		} else {
			var range = this.speed/maxAdjSpeed;
			var cosine = scalar_interpolation(1.0,-1.0,Math.pow(range,20));
			return limit_max_deviation(force,cosine,this.basisParallel);
		}
	}

	this.steer = function(force, dt, parray) {

		var close = 0, steer = 0;
		console.log(parray.length);
		//parray marks return of the grid
	if(parray.length) {
			
			var minimumsep = 2.5 * 15;
			//check if anyone is too close
			for(var i=0; i<parray.length; i++) {

				var offset = this.position.subtract(parray[i].position);
				if(offset.length < minimumsep) {
					console.log("Oh so close");
					close = 1;
					this.shape.position = this.shape.position.add(this.basisPerpendicular.multiply(10 * this.basisPerpendicular.dot(offset)));
				}
			}

			//there exist obstacles within normal danger limits
			var threat = 0;
			var pspace = 6 * 15;
			var mintimeuntilcollision = 15;			//tune these

			var time, mintime = mintimeuntilcollision;
			var index = 0;
			var vrel = parray[0].velocity.subtract(this.velocity);
			var relspeed = vrel.length;
			var unitvrel = vrel.normalize();
			var dist = parray[0].shape.position.subtract(this.shape.position);
			var projection = Math.abs(dist.dot(unitvrel));
			var my_future = this.shape.position.add(this.velocity.multiply(mintime));
			var obs_future = parray[0].shape.position.add(parray[0].velocity.multiply(mintime));
			var mindist = my_future.subtract(obs_future).length;

					if (vrel.dot(dist) <= 0 && mindist < pspace) {
						time = projection/relspeed;
						if(time < mintime) {
							mintime = time;
							threat = 1;
						}    		
					}

					for(var i=1; i<parray.length; i++) {
						
						var vrel = parray[i].velocity.subtract(this.velocity);					
						var relspeed = vrel.length;
						var unitvrel = vrel.normalize();
						var dist = parray[i].shape.position.subtract(this.shape.position);
						var projection = Math.abs(dist.dot(unitvrel));
						time =  projection/relspeed;
						if(time >= 0 && time < mintime && vrel.dot(dist) <= 0) {
							my_future = this.shape.position.add(this.velocity.multiply(time));
							obs_future = parray[i].shape.position.add(parray[i].velocity.multiply(time));
							mindist = my_future.subtract(obs_future).length;
							if(mindist < pspace) {
								mintime = time;
								threat = 2;
								index = i;
							}
						}
					}
									console.log(threat + " is threat");
									console.log(mintime+" is mintime");


			if(threat != 0) {
					var obstacle = parray[index];		//has minimum estimated time of collision
					
					my_future = this.shape.position.add(this.velocity.multiply(mintime));
					obs_future = obstacle.shape.position.add(obstacle.velocity.multiply(mintime));
					mindist = my_future.subtract(obs_future).length;
					var sep = this.position.subtract(obstacle.position).length;

					var parallelness = this.basisParallel.dot(obstacle.basisParallel);
    		    	var angle = 0.707;
    		    	var offset, sideDot;
    		    	var vy = this.basisPerpendicular;

        		if (parallelness < -angle) {
        			console.log("anti-parallel");
            		// anti-parallel "head on" paths:
            		// steer away from future threat position
            		offset = obs_future.subtract(this.shape.position);

            		sideDot = offset.dot(vy);
            		steer = (sideDot > 0) ? -1.0 : 1.0;
        		} else {
            		if (parallelness > angle) {	
        				console.log("parallel");
	                	// parallel paths: steer away from threat
    	            	offset = obs_future.subtract(this.shape.position);

        	        	sideDot = offset.dot(vy);
            	    	steer = (sideDot > 0) ? -1.0 : 1.0;
            		} else {
                		// perpendicular paths: steer behind threat
	                	// (only the slower of the two does this)
    	            	if (1) {
		        			console.log("perpendicular");
                    		sideDot = vy.dot(obstacle.velocity);
                    		steer = (sideDot > 0) ? -1 : 1;
                		}
            		}
            	}
            	        console.log(steer + " is steer");

            }
            		//steer is direction of swaying - add it to force or velocity?
            		
		}
		var adjForce = this._adjustForce(force,dt);
		var acc = adjForce.divide(this.mass);

		if (dt > 0) {
			var smoothRate = clip_value(9 * dt,0.15,0.4); // TUNE : Figure out a good formula, using default as of now
			this._smoothAcc = blend_vec(smoothRate,acc,this._smoothAcc);
		}

		this.velocity = this.velocity.add(this.basisPerpendicular.multiply(4 * steer));
		this.velocity = clip_length(this.velocity.add(this._smoothAcc.multiply(dt)),this.maxSpeed);
		this.speed = this.velocity.length;
		this.position = this.position.add(this.velocity.add(dt)); 		// why add dt? del x = v.dt?


//equivalent to this.vec and vy resp
		this.basisParallel = this.velocity.normalize();
		this.basisPerpendicular = this.basisParallel.rotate(90);

		var posSmooth = dt * 0.06;

		//._smoothPos + posSmooth * (this.position - this._smoothPos)
		this._smoothPos = blend_vec(posSmooth,this.position,this._smoothPos);

		this.shape.position.x = this._smoothPos.x;
		this.shape.position.y = this._smoothPos.y;
	}


//ignore for now
	this.futurePosition = function(time) {
		/*This could also be this.shape.position (both are different because of the linear interpolation)
		TODO: If this gives poor results change to this.shape.position
		Could also use quadratic approximation term 1/2at^2, is it necessary?*/
		return this.position.add(this.velocity.multiply(time));
	}
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
	var perp = force.subtract(basis.multiply(basis.dot(force)));	//perpendicular component
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

//smooth + t * (newvec - smooth)
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
		vec = vec.normalize().multiply(len);
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

