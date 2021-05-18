rsSystem.math = rsSystem.math || {};
rsSystem.math.time = rsSystem.math.time || {};

rsSystem.math.time.reference = {
	"s": 1,
	"m": 60,
	"h": 3600,
	"d": 86400,
	"w": 432000,
	"M": 3024000,
	"Y": 31795200
};

rsSystem.math.time.order = ["Y", "M", "w", "d", "h", "m", "s"];

rsSystem.math.time.reduceSeconds = function(seconds) {
	var timeObject = {},
		x;

	for(x=0; x<rsSystem.math.time.order.length; x++) {
		timeObject[rsSystem.math.time.order[x]] = Math.floor(seconds/rsSystem.math.time.reference[rsSystem.math.time.order[x]]);
		seconds = seconds%rsSystem.math.time.reference[rsSystem.math.time.order[x]];
	}

	return timeObject;
};

rsSystem.math.time.display = function(time, format) {
	var buffer,
		x;

	if(format) {
		for(x=0; x<rsSystem.math.time.order.length; x++) {
			buffer = time[rsSystem.math.time.order[x]] || 0;
			format = format.replace("$" + rsSystem.math.time.order[x], buffer);
			if(buffer < 10) {
				buffer = "0" + buffer;
			}
			format = format.replace("#" + rsSystem.math.time.order[x], buffer);
		}
	} else {
		format = "";
		if(time.Y === 1) {
			format += time.Y + "year ";
		} else if(time.Y) {
			format += time.Y + "years ";
		}

		if(time.M === 1) {
			format += time.M + "month ";
		} else if(time.M) {
			format += time.M + "months ";
		}

		if(time.w === 1) {
			format += time.w + "week ";
		} else if(time.w) {
			format += time.w + "weeks ";
		}

		format += time.h + ":";
		if(time.m < 10) {
			format += "0" + time.m;
		} else {
			format += time.m;
		}
		if(time.s < 10) {
			format += ":0" + time.s;
		} else {
			format += ":" + time.s;
		}
	}

	return format .trim();
};
