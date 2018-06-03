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
			speed = 3 + 0.25 * this.valence;
		}
		return speed;
	}

	this.perp_perturbations = function(sep,tick) {
		var perp;
		if (this.arousal > 0) {
			if (this.valence < 0) {
				perp = sep.rotate(90).multiply((this.arousal * 2 + this.valence) * Math.sin(tick * this.arousal/9));
			} else {
				perp = sep.rotate(90).multiply((10 - this.valence) * Math.sin(tick * this.arousal/9));
			}
		} else {
			if (this.valence < 0) {
				perp = sep.rotate(90).multiply(0.2 * (this.arousal  + this.valence) * Math.exp(-tick/100) * Math.sin(tick * this.arousal/60));
			} else {
				perp = sep.rotate(90).multiply(2 * (this.arousal - this.valence) * Math.sin(tick * this.arousal/60));
			}
		}
		return perp;
	}

	this.long_perturbations = function(sep,tick) {
		var pert;
		if (this.valence > -4 || this.valence < 4) {
			pert = sep.rotate((2 * Math.random() - 1) * (this.arousal));
		}
		return pert;
	}

	this.approach = function(person2,tick) {
		var separation = person2.physique.position.subtract(this.physique.position).normalize();
		console.log(this.approachspeed());
		var disp = separation.multiply(this.approachspeed()).add(this.perp_perturbations(separation,tick)).add(this.long_perturbations(separation,tick));
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
		valence : [5,7], //6
		arousal : [2,4] // 3
	},
	sadness : {
		valence : [-9,-6], // -7.5
		arousal : [-5,-3], // -4
	},
	boredom : {
		valence : [-4,-2], // -3
		arousal : [-8,-6] // -7
	},
	fear : {
		valence : [-8,-6], // -7
		arousal : [5,7] // 6
	},
	anger : {
		valence : [6,8],
		arousal : [7,9]
	}
}
