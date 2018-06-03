function Person(pos,val,arouse,shape) {
	this.valence = val;
	this.arousal = arouse;
	this.physique = shape;
	this.physique.position = pos;

	this.approachspeed = function() {
		var speed;
		if (this.valence > 0) {
			speed = this.valence/1.5;
		} else {
			speed = 3 + 0.2 * this.valence;
		}
		return speed;
	}

	this.perp_perturbations = function(sep,tick) {
		// Anirudh Anil Ojha Phone Uthao
		var perp = sep.rotate(90).multiply((13.5 - this.arousal) * Math.sin(tick * this.arousal/10));
		return perp;
	}

	this.approach = function(person2,tick) {
		var separation = person2.physique.position.subtract(this.physique.position).normalize();
		console.log(this.approachspeed());
		var disp = separation.multiply(this.approachspeed()).add(this.perp_perturbations(separation,tick));
		this.physique.position.x += disp.x;
		this.physique.position.y += disp.y;
	}

	this.repel = function(person2) {
	}

	this.move = function(destination) {
	}
}

var EmotionTable = {
	joy : {
		valence : [5,7],
		arousal : [2,4]
	},
	sadness : {
		valence : [-9,-6],
		arousal : [-5,-3],
	},
	fear : {
		valence : [-8,-6],
		arousal : [5,7]
	},
	anger : {
		valence : [6,8],
		arousal : [7,9]
	}
}
