function Person(debug,pos,shape) {
	this.shape = shape;
	this.shape.position = pos;
	this.debug = debug;

	this.moveAlongPath = function(path,offset,delta) {
		if (offset < path.length) {
			this.shape.position = path.getPointAt(offset);
			var vibrationvec = path.getPointAt(offset).subtract(path.getPointAt(offset + 150)).rotate(90).normalize();
			vibrationvec = vibrationvec.multiply(5 * Math.random());
			this.shape.position.x += vibrationvec.x;
			this.shape.position.y += vibrationvec.y;
			if (this.debug) {
				console.log(offset);
			}
			return (offset + delta * 150);
		} else {
			return -1;
		}
	}


}