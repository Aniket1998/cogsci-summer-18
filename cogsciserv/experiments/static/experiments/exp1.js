var rad = 14;
var scale = 50;
var followscale = 60;
var threshold = 1;

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

	if (vec.length < threshold) {
		dest = Point.random() * view.size;
	}
}