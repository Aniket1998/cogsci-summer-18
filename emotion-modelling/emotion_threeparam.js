function Person(debug,pos,eagerness,arousal,focus,shape) {
	this.arousal = arousal;
	this.eagerness = eagerness;
	this.focus = focus;
	this.phys = shape;
	this.debug = debug;

	this.movement = {
		path : 0
	}

	this.emptyPath = function() {
		this.movement.path = new Path();
		if (this.debug) {
			//this.movement.path.strokeColor = 'black';
		}
	}

	this.moveToPoint = function(dest) {
		var path = new Path();
		var start = this.phys.position;
		var vx = dest.subtract(start);
		var dist = vx.length;
		vx = vx.normalize();
		var vy = vx.rotate(90);
		var height = 150 * Math.exp(-this.focus/5.0);
		var n = 4;
		for (var i = 1; i < n; i++) {
			var x = start.add(vx.multiply((dist/n) * i));
			/*var f = -1;
			if(i % 2) {
				f = 1;
			}*/
			var y = vy.multiply(height * (2 * Math.random() - 1));
			path.add(x.add(y));
		}
		path.add(dest);
		path.smooth();
		if (this.debug) {
			//path.strokeColor = 'black';
		}
		path.strokeColor = 'black';
		this.movement.path = path;
	}

	this.fixedPointRetreat = function(point,mindist,maxdist) {
		var retreat = this.phys.position.subtract(point).normalize().multiply(mindist + (maxdist - mindist) * Math.random());
		this.moveToPoint(this.phys.position.add(retreat));
	}

	/*this.followPerson = function(person2) {
		var start = this.phys.position;
		var dest = person2.phys.position;
		var vx = dest.subtract(start);
		var separation = vx.length;
		vx = vx.normalize();
		var vy = vx.rotate(90);
		var n = 4;
		var height = 150 * Math.exp(-this.focus/5.0);
		var dist = separation/(20.0 * n);
		for (var i = 0; i < n; i++) {
			var x = start.add(vx.multiply(dist * i));
			var y = vy.multiply(height * (2 * Math.random() - 1));
			this.movement.path.add(x.add(y));
		}
		this.movement.path.add(start.add(vx.multiply(dist * n)));
		this.movement.path.smooth();
	}*/
	this.initFollow = function() {
		this.movement.path = new Path();
		this.movement.path.add(this.phys.position);
		this.movement.path.strokeColor = 'black';
		console.log(this.movement.path.length)
	}

	this.initRetreat = function() {
		this.movement.path = new Path();
		this.movement.path.add(this.phys.position);
		this.movement.path.strokeColor = 'black';
	}

	this.retreatFromPerson = function(person2,bound) {
		//bound depends on situation - if he is aware of the pursuer or how fast he sees him and reacts
		//numdivs is no. of steps pre-decided : -e,+a
		//stepsize lessens height effect : -e, +a
		//height, here, also represents arousal (like trembling) and not wandering. +a

		var start;
		if (this.movement.path.length === 0) {
			start = this.phys.position;
		} else {
			start = this.movement.path.getPointAt(this.movement.path.length);
			//start is end of path of escapist drawn
		}
		var numdivs = this.eagerness/1.5;
		var stepsize = this.eagerness*3;
		if (this.phys.position.subtract(person2.phys.position).length < bound) {
			var vx = start.subtract(person2.phys.position);
			var dist = vx.length;
			vx = vx.normalize();
			var vy = vx.rotate(90);
			var height = 5 * (this.arousal);
			for (var i = 1; i <= numdivs; i++) {
				var x = start.add(vx.multiply((stepsize * i)));
				var y = vy.multiply(height * (2 * Math.random() - 1));
				this.movement.path.add(x.add(y));
			}
			this.movement.path.smooth();
		}
	}

	this.followPerson = function(person2) {
		var last;
		if (this.movement.path.length === 0) {
			last = this.phys.position;
		} else {
			console.log("Pathlength " + this.movement.path.length);
			last = this.movement.path.getPointAt(this.movement.path.length);
		}
		var speed;
		if (this.eagerness > 0) {
			speed = 40 * this.eagerness;
		} else {
			speed = 20 * (10 + this.eagerness);
		}
		var vx = person2.phys.position.subtract(last);
		var gap = vx.length;
		vx = vx.normalize();
		if (gap < speed/45.0) {
			this.movement.path.add(person2.phys.position);
		} else {
			this.movement.path.add(last.add(vx.multiply(speed/45.0)));
		}
		this.movement.path.smooth();
	}

	this.moveAlongPath = function(offset,delta) {
		var path = this.movement.path;
		var speed;
		var amplitude;
		if (this.eagerness > 0) {
			speed = 40 * this.eagerness;
		} else {
			speed = 20 * (10 + this.eagerness);
		}
		if (this.arousal > 0) {
			amplitude = this.arousal * 1.5;
		}
		if (offset + speed * delta > this.movement.path.length) {
			return offset;
		}
		if (offset < path.length) {
			this.phys.position = path.getPointAt(offset);
			if (this.arousal > 0) {
				var vibrationvec = path.getPointAt(offset).subtract(path.getPointAt(offset + speed * delta)).rotate(30 + 60 * Math.random()).normalize();
				vibrationvec = vibrationvec.multiply(amplitude * Math.random());
				this.phys.position.x += vibrationvec.x;
				this.phys.position.y += vibrationvec.y;
			}
			if (this.debug) {
				//console.log(offset);
			}
			return (offset + delta * speed);
		} else {
			return -1;
		}
	}
}

var EmotionTable = {
	happiness : {
		eagerness : [5,8],
		arousal : [2,4],
		focus : [7,9]
	},
	sadness : {
		eagerness : [-9,-6],
		arousal : [-5,-3],
		focus : [4,6]
	},
	boredom : {
		eagerness : [-4,-2],
		arousal : [-8,-6],
		focus : [1,2]
	},
	fear : {
		eagerness : [-8,-6],
		arousal : [5,7],
		focus : [7,8]
	},
	anger : {
		eagerness : [6,8],
		arousal : [7,9],
		focus : [7,8]
	},
	nervousness : {
		eagerness : [-6,-4],
		arousal : [3,5],
		focus : [6,8]
	}
}
