paper.install(window);
window.onLoad = function() {
	paper.setup('canvas');
	console.log("WHAT");
	var RAD = 15;
	var WIDTH = view.size.width;
	var HEIGHT = view.size.height;
	var alcoholic = new Person(true,new Point(0.2 * WIDTH,0.5 * HEIGHT),2,-8,8,new Path.Circle({
		center : view.center,
		radius : RAD,
		fillColor : 'red'
	}));
	var wife = new Person(true,new Point(0.9 * WIDTH,0.1 * HEIGHT),0,0,0,new Path.Circle({
		center : view.center,
		radius : RAD,
		fillColor : 'pink'
	}));
	view.onFrame = function(event) {
	}
}