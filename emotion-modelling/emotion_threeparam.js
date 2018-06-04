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
		path.add(this.phys.position);
		for (var i = 0; i < 4; i++) {
			path.add(Point.random());
		}
		path.add(dest);
		if (this.debug) {
			path.strokeColor = 'black';
		}
		path.smooth();
		this.movement.path = path;
	}

	this.moveAlongPath = function(offset,delta) {
		var path = this.movement.path;
		if (offset < path.length) {
			this.phys.position = path.getPointAt(offset);

			var vibrationvec = path.getPointAt(offset).subtract(path.getPointAt(offset + 150 * delta)).normalize();
			vibrationvec = vibrationvec.multiply(4 * Math.random());
			this.phys.position.x += vibrationvec.rotate(90).x;
			this.phys.position.y += vibrationvec.rotate(90).y;
			if (this.debug) {
				console.log(offset);
			}
			return (offset + delta * 150);
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
	}
}