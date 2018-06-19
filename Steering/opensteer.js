//Implements the locomotion layer
function Locomotion(params) {
	this.shape = params.shape;
	this.mass = params.mass;
	this.velocity = params.velocity;
	this.speed = params.speed;
	this.boundingRadius = params.boundingRadius;
	this.maxForce = params.maxForce;
	this.maxSpeed = params.maxSpeed;

	this._smoothPos = new Point(0,0);
	this._smoothAcc = new Point(0,0);

	this.steer = function(force,dt) {
		var adjForce = this._adjustForce(force,dt);
		var acc = adjForce.divide(this.mass);

		if (delta > 0) {
			var smoothRate = clip_value(9 * dt,0.15,0.4); // TUNE : Figure out a good formula, using default as of now
			this._smoothAcc = blend_vec(smoothRate,acc,this._smoothAcc);
		}
		this.velocity = clip_length(this.velocity.add(this._smoothAcc.multiply(dt)),this.maxSpeed);
		this.speed = this.velocity.length;
		this.position = this.position.add(this.velocity.add(dt));

		//TODO: REGENERATE THE LOCAL SPACE, CONFIRM WITH DANDI

		var posSmooth = dt * 0.06;
		this._smoothPos = blend_vec(posSmooth,this.position,this._smoothPos);

		this.shape.position.x = this._smoothPos.x;
		this.shape.position.y = this._smoothPos.y;
	}
}


//Utility functions for various math ops

function scalar_interpolation(x1,x2,t) {
	return x1 + ((x2 - x1) * t);
}

function vector_interpolation(v1,v2,t) {
	var dif = v2.subtract(v1);
	dif = dif.multiply(t);
	return v1.add(dif);
}

function blend_vec(t,new,smooth) {
	return vector_interpolation(smooth,new,clip_value(t,0,1))
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
