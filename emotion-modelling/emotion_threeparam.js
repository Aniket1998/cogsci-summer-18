function Person(shape,pos,focus,energy,eager) {
	this.shape = shape;
	this.shape.position = pos;
	this.focus = focus;
	this.energy = energy;
	this.eager = eager;

	this.approach_speed = function(vec,tick) {

	}

	this.perp_perturbations = function(vec,tick) {

	}

	this.long_perturbations = function(vec,tick) {

	}

	this.approach = function(person2,tick) {

	}

	this.repel = function(person2,tick) {

	}

	this.move = function(dest,base,basep,tick) {
		var vec = dest.subtract(this.shape.position).normalize();
		var dist = Math.abs(vec.dot(basep));
		console.log(dist);
		if (dist < 500) {
			dist = vec.rotate(40 + 40 * Math.random());
		}
		this.shape.position.x += dist.x;
		this.shape.position.y += dist.y;
	}
	this.move2 = function(path,offset) {

	}
}