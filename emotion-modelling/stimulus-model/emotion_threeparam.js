function Person(debug,pos,eagerness,arousal,focus,shape) {
	this.arousal = arousal;
	this.eagerness = eagerness;
	this.focus = focus;
	this.phys = shape;
	this.debug = debug;
	this.phys.position = pos;

	this.movement = {
		temppath : 0,
		path : 0
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
			path.strokeColor = 'black';
		}
		//path.strokeColor = 'black';
		this.movement.path = path;
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

	this.clearPath = function() {
		this.movement.path = new Path();
		this.movement.path.add(this.phys.position);
		if (this.debug) {
			this.movement.path.strokeColor = 'black';
		}
		//console.log(this.movement.path.length)
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
	var y = Point.random()
	var ynext = Point.random()
	var cnt = 0;
	this.followPerson = function(person2) {
		var last;
		if (this.movement.path.length === 0) {
			last = this.phys.position;
		} else {
			//console.log("Pathlength " + this.movement.path.length);
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
		var vy = vx.rotate(90);
		var height = Math.exp(-this.focus/5.0) * 20;
		if (gap < speed/45.0) {
			this.movement.path.add(person2.phys.position);
		} else {
			if(cnt==0){
				ynext = vy.multiply(height * (2*Math.random()-1));
			}
			if(cnt%15==0){
				y = ynext;
				ynext = vy.multiply(height * (2*Math.random()-1));
			}
			y = y.add((ynext.subtract(y)).multiply(1/15))
			//console.log(cnt);
			this.movement.path.add(last.add(vx.multiply(speed/45.0).add(y)));
			cnt++;
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
		if (offset > this.movement.path.length) {
			return -1;
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

/*function Stimulus(person,owner,entity,priority) {
	this.activeStatus = false;
	this.owner = owner;
	this.entity = entity;
	this.priority = priority;
	this.checkActivity = function() {}
	this.actStimulus = function() {}
}*/

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