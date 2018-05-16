var rad = 14;
var scale = 75;
var followscale = 100;
var threshold = 10;

var path = new Path.Circle({
	center: view.size * Math.random(),
	radius: rad,
	fillColor: 'red'
});
var follow = new Path.Circle({
	center: path.center,
	radius: rad,
	fillColor: 'blue'
});

follow.position = path.position + Point.random() * view.size;

var dest = Point.random() * view.size;
function onFrame(event) {
	var vec = dest - path.position;
	path.position += vec/scale;

	var separation = path.position - follow.position;
	follow.position += separation/followscale;

    if (path.bounds.left > view.size.width) {
        path.position.x = -path.bounds.width;
    }
    if (path.bounds.right < 0) {
        path.position.x = +view.size.width;
    }
    if (path.bounds.bottom < 0) {
        path.position.y = +view.size.height;
    }
    if (path.bounds.top > view.size.height) {
        path.position.y = -path.bounds.height;
    }
    if (path.bounds.left > view.size.width) {
        path.position.x = -path.bounds.width;
    }
    if (path.bounds.right < 0) {
        path.position.x = +view.size.width;
    }
    if (path.bounds.bottom < 0) {
        path.position.y = +view.size.height;
    }
    if (path.bounds.top > view.size.height) {
        path.position.y = -path.bounds.height;
    }
/*	if (path.bounds.left > view.size.width || path.bounds.right < 0) {
		path.position.x -= vec.x/scale;
	}
	if (follow.bounds.left > view.size.width follow.bounds.right < 0) {
		follow.position.x -= separation.x/scale;
	}
	if (path.bounds.top > view.size.height || path.bounds.bottom < 0) {
		path.position.y -= vec.y/scale;
	}
	if (follow.bounds.top > view.size.height || follow.bounds.bottom < 0) {
		follow.position.y -= separation.y/scale;
	}*/

	if (vec.length < threshold) {
		dest = Point.random() * view.size;
	}
}