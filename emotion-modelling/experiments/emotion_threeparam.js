function Person(debug,pos,eagerness,arousal,focus,shape) {
	this.arousal = arousal;
	this.eagerness = eagerness;
	this.focus = focus;
	this.phys = shape;
	this.debug = debug;
	this.phys.position = pos;
	this.stimuli = [];
	this.movement = {
		temppath : 0,
		path : 0
	}

	this.addStimulus = function(stimulus) {
		this.stimuli.push(stimulus);
		this.stimuli.sort(function(stimulus1,stimulus2) {
			return (stimulus2.priority - stimulus1.priority);
		});
	}

	this.actStimuli = function(event) {
		for (var i = 0; i < this.stimuli.length; i++) {
			this.stimuli[i].checkActivity(event);
			if (this.stimuli[i].activeStatus) {
				console.log("Executing stimulus : " + this.stimuli[i].name);
				this.stimuli[i].actStimulus(event);
				return;
			}
		}
	}

	this.moveToPoint = function(dest) {
		var path = new Path();
		var start = this.phys.position;
		var vx = dest.subtract(start);
		path.add(start);
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
		cnt=0;
		if (this.debug) {
			this.movement.path.strokeColor = 'black';
		}
		//console.log(this.movement.path.length)
	}

		this.stand =function() {
		if (this.arousal > 0) {
			amplitude = this.arousal * 1.5;
		}
		if (this.arousal > 0) {
				var vibrationvec = new Point(2*Math.random()-1,2*Math.random()-1);
				vibrationvec = vibrationvec.multiply(amplitude * Math.random());
				this.phys.position.x += vibrationvec.x;
				this.phys.position.y += vibrationvec.y;
			}

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

	this.followPerson = function(person2, parray) {
		var last;
		console.log(parray.length);

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
		//vector from end of path (last) to goal
		var vx = person2.phys.position.subtract(last);

		var gap = vx.length;
		vx = vx.normalize();

		//perpendicular to vx
		var vy = vx.rotate(90);

		var height = Math.exp(-this.focus/5.0) * 20;
		if (gap < speed/45.0) {
			this.movement.path.add(person2.phys.position);
		} else {
			if (cnt==0) {
				ynext = vy.multiply(height * (2*Math.random()-1));
			}
			if(cnt%15 == 0){
				y = ynext;
				ynext = vy.multiply(height * (2*Math.random()-1));
			}
			y = y.add((ynext.subtract(y)).multiply(1/15))
			if(parray.length === 2){
			var jump;
			var vision = last.add(vx.multiply(10));
			var prox1 = (parray[0]).phys.position.subtract(vision);
			var prox2 = (parray[1]).phys.position.subtract(vision);
			var pspace = 4 * 15;

			if(prox1.length < pspace){
				console.log("Too close to 1");
				jump = vy.multiply(2000/(prox1.length*prox1.length));
				if(prox1.dot(vy)<0){
					this.movement.path.add(last.add(vx.multiply(speed/45.0).add(jump)));
				} else {
					jump = jump.multiply(-1);
					this.movement.path.add(last.add(vx.multiply(speed/45.0).add(jump)));
				}
			} else if(prox2.length <  pspace) {
				console.log("Too close to 2");
				//console.log(dist.length - pspace);
				jump = vy.multiply(2000/(prox2.length*prox2.length));
				if(prox2.dot(vy)<0){
					this.movement.path.add(last.add(vx.multiply(speed/45.0).add(jump)));
				} else {
					jump = jump.multiply(-1);
					this.movement.path.add(last.add(vx.multiply(speed/45.0).add(jump)));
				}
			}	else {
			this.movement.path.add(last.add(vx.multiply(speed/45.0).add(y)));
			}
		}else {
			this.movement.path.add(last.add(vx.multiply(speed/45.0).add(y)));
		}

			cnt++;
		}
		this.movement.path.smooth();
	}

	this.moveAlongPath = function(offset,delta) {
		var path = this.movement.path;
		var speed;
		var amplitude;
		if (this.eagerness > 0) {
			speed = 30 * this.eagerness;
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
				console.log(vibrationvec.length);
				this.phys.position.x += vibrationvec.x;
				this.phys.position.y += vibrationvec.y;
			}
			if (this.debug) {
				//console.log(offset);
			}
			//console.log("DELTA is "+delta);
			return (offset + delta * speed);
		} else {
			return -1;
		}
	}
}

function Stimulus(owner,entity,priority) {
	this.activeStatus = false;
	this.owner = owner;
	this.entity = entity;
	this.priority = priority;
	this.checkActivity = function(event) {}
	this.actStimulus = function(event) {}
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
function PersonGrid(width,height) {
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
		if (prevx >= 0 && prevy >= 0 && nextx >= 0 && nexty >= 0) {
			this.grid[prevx][prevy] = null;
			this.grid[nextx][nexty] = person;
		}
	}

	this.set = function(pos,person) {
		var x = Math.floor(pos.x);
		var y = Math.floor(pos.y);
		if (x >= 0 && y >= 0) {
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
