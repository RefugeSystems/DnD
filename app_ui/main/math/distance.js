/**
 * 
 * @class distance
 * @namespace rsSystem.math
 * @constructor
 * @static
 */
rsSystem.math = rsSystem.math || {};
rsSystem.math.distance = rsSystem.math.distance || {};

rsSystem.math.distance.pi2 = 2 * Math.PI;

rsSystem.math.distance.points2D = function(a, b, x2, y2) {
	if(x2) {
		return Math.sqrt(Math.pow(x2 - a, 2) + Math.pow(y2 - b, 2));
	} else {
		return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
	}
};


rsSystem.math.distance.points3D = function(a, b) {

};

rsSystem.math.distance.reduceMeters = function(meters) {
	var distanceObject = {},
		x;

	for(x=0; x<rsSystem.math.distance.order.length; x++) {
		distanceObject[rsSystem.math.distance.order[x]] = Math.floor(meters/rsSystem.math.distance.convert[rsSystem.math.distance.order[x]]);
		meters = meters%rsSystem.math.distance.convert[rsSystem.math.distance.order[x]];
	}

	return distanceObject;
};

rsSystem.math.distance.display = function(distance, format, order) {
	order = order || rsSystem.math.distance.order;
	format = format || "";
	var x;

	if(format) {
		for(x=0; x<order.length; x++) {
			format = format.replace("$" + order[x], distance[order[x]] || 0);
		}
	} else {
		for(x=0; x<order.length; x++) {
			if(distance[order[x]]) {
				format += distance[order[x]] + order[x] + " ";
			}
		}
	}

	return format.trim();
};

rsSystem.math.distance.order = ["pc", "ly", "au", "km", "m"];

rsSystem.math.distance.lengths = [{
	"symbol": "nm",
	"value": 1e-9
}, {
	"symbol": "mm",
	"value": .001
}, {
	"symbol": "cm",
	"value": .01
}, {
	"symbol": "in",
	"value": .0254
}, {
	"symbol": "ft",
	"value": .3048
}, {
	"symbol": "yd",
	"value": .9144
}, {
	"symbol": "m",
	"value": 1
}, {
	"symbol": "km",
	"value": 1000
}, {
	"symbol": "mi",
	"value": 1609
}, {
	"symbol": "au",
	"value": 1.495979e11
}, {
	"symbol": "ly",
	"value": 9.460730e15
}, {
	"symbol": "pc",
	"value": 3.085678e16
}];

rsSystem.math.distance.convert = {};

(function() {
	var buffer,
		load,
		x;

	for(x=0; x<rsSystem.math.distance.lengths.length; x++) {
		rsSystem.math.distance.convert[rsSystem.math.distance.lengths[x].symbol] = rsSystem.math.distance.lengths[x].value;
	}
})();
