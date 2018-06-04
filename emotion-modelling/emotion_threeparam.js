function Person(debug,pos,shape) {
	this.shape = shape;
	this.shape.position = pos;
	this.debug = debug;

	this.moveAlongPath = function(path,offset,delta) {
		if (offset < path.length) {
			this.shape.position = path.getPointAt(offset);
			if (this.debug) {
				console.log(offset);
			}
			return (offset + delta * 150);
		} else {
			return -1;
		}
	}
}