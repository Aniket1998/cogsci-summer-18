paper.install(window);
window.onload = function() {
		paper.setup('experiment');
		var speed = 1;
		var width = view.size.width;
		var height = view.size.height;
		var head = new Path.Circle({
			center : Point.random().multiply(new Point(width,height)).multiply(speed),
			radius : 10,
			fillColor : 'red'
		});
		var follower = new Path.Circle({
			center : view.center,
			radius : 10,
			fillColor : 'blue'
		});
		var update;
		var velocity = Point.random().multiply(2).subtract(1);
		var oldthreshold = 22.5;
		var threshold = oldthreshold;
		var followVelocity;
		var reboundVelocity;
		view.onFrame = function(event) {
			var x = head.position.x + velocity.x;
			var y = head.position.y + velocity.y;
			if (x < 12 || x > width - 12) {
				velocity.x *= -1;
				velocity.angle += Math.random();
			}
			if (y < 12 || y > height - 12) {
				velocity.y *= -1;
				velocity.angle += Math.random();
			}
			head.position.x += velocity.x;
			head.position.y += velocity.y;
			followVelocity = head.position.subtract(follower.position);
			if (followVelocity.length < threshold) {
				update = false;
				threshold = oldthreshold * 5;
			} else {
				threshold = oldthreshold;
				update = true;
				reboundVelocity = followVelocity.multiply(Point.random());
				reboundVelocity = reboundVelocity.normalize();
				reboundVelocity.angle += Math.random() * 90;
				reboundVelocity = reboundVelocity.multiply(3);
			}
			followVelocity = followVelocity.normalize().multiply(speed);
			if (update) {
				x = follower.position.x + followVelocity.x;
				y = follower.position.y + followVelocity.y;
				if (x < 12 || x > width - 12) {
					followVelocity.x *= -1;
					followVelocity.angle += Math.random();
				}
				if (y < 12 || y > height - 12) {
					followVelocity.y *= -1;
					followVelocity.angle += Math.random();
				}
				follower.position = follower.position.add(followVelocity);
			} else {
				x = follower.position.x - reboundVelocity.x;
				y = follower.position.y - reboundVelocity.y;
				if (x < 12 || x > width - 12) {
					reboundVelocity.x *= -1;
					reboundVelocity.angle += Math.random();
				}
				if (y < 12 || y > height - 12) {
					reboundVelocity.y *= -1;
					reboundVelocity.angle += Math.random();
				}
				follower.position = follower.position.subtract(reboundVelocity);
			}
		}
	}
