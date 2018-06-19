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

	this.basisParallel = new Point(0,0);
	this.basisPerpendicular = new Point(0,0);

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

	this.steer = function(force,dt) {
		var adjForce = this._adjustForce(force,dt);
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

		var posSmooth = dt * 0.06;
		this._smoothPos = blend_vec(posSmooth,this.position,this._smoothPos);

		this.shape.position.x = this._smoothPos.x;
		this.shape.position.y = this._smoothPos.y;
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
		vec = vec.normalize().multiply(len);
	} else {
		return vec;
	}
}
