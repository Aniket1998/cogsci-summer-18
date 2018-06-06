function Person(debug,pos,eagerness,arousal,focus,shape) {
	this.arousal = arousal;
	this.eagerness = eagerness;
	this.focus = focus;
	this.phys = shape;
	this.debug = debug;

	this.movement = {
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
		//path.strokeColor = 'black';
		this.movement.path = path;
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
		if (offset < path.length) {
			this.phys.position = path.getPointAt(offset);
			if (this.arousal > 0) {
				var vibrationvec = path.getPointAt(offset).subtract(path.getPointAt(offset + speed * delta)).rotate(90).normalize();
				vibrationvec = vibrationvec.multiply(amplitude * Math.random());
				this.phys.position.x += vibrationvec.x;
				this.phys.position.y += vibrationvec.y;
			}
			if (this.debug) {
				console.log(offset);
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