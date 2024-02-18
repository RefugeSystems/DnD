
/**
 * Handle the calendar for a universe.
 * 
 * TODO: This should be made to mirror the default `Calendar` object
 * as far as methods and behaviors to allow easy usage of "normal"
 * time or other custom calendars where the standard is used as a
 * reference model.
 * @class RSCalendar
 * @extends EventEmitter
 * @param {Universe} universe
 * @constructor
 * @static
 */
class RSCalendar extends EventEmitter {
	constructor(universe) {
		super();

		var reference = this;
		if(!universe) {
			universe = rsSystem.universe;
		}

		class RSDate extends Date {
			constructor(...args) {
				super();
				if(args.length === 1) {
					this.setTime(args[0]);
				} else if(args.length === 0) {
					this.setTime(reference.time);
				} else {
					this.year = args[0];
					this.month = args[1];
					this.day = args[2];
					this.hour = args[3];
					this.minute = args[4];
					this.second = args[5];
					this.update();
				}
			}

			update() {
				this.time = reference.getTime(this);
				this.setTime(this.time); // Get Week & Day of Week
			}

			/* 
				*/
			setTime(time) {
				reference.breakdownGameTime(time, this);

				/*
				 * This is specified as the breakdown method uses Vue.set which is much slower and not the desired case for this class.
				 * Another Date type class may be considered to leverage that to push updates more forcefully but the system is already
				 * fairly heavy in that area and calculations here should be local to drive the greater display objectives.
				var month,
					days,
					i;

				this.second = Math.floor(time%60);
				time = Math.floor(time/60);
				this.minute = Math.floor(time%60);
				time = Math.floor(time/60);
				this.hour = Math.floor(time%24);
				time = Math.floor(time/24);
				this.year = Math.floor(time/reference.CONSTANTS.daysInYear) + 1;
				this.week = Math.floor(time/reference.daysOfWeek.length);
				this.dayOfWeek = Math.floor(time - this.week*reference.daysOfWeek.length);
				time = time%reference.CONSTANTS.daysInYear; // Days remaining
				for(i=0; i<reference.monthsOfYear.length; i++) {
					month = reference.monthsOfYear[i];
					days = month.days || reference.daysInMonth[i] || reference.daysInMonth[0] || 25;
					if(days <= time) {
						time -= days;
					} else {
						this.month = i + 1;
						break;
					}
				}
				this.day = time + 1;
				return this;
				*/
			}

			setYear(year) {
				this.year = year - 1;
				this.update();
			}

			setMonth(month) {
				this.month = month;
				this.update();
			}

			setDate(day) {
				this.day = day - 1;
				this.update();
			}

			setHour(hour) {
				this.hour = hour;
				this.update();
			}

			setMinute(minute) {
				this.minute = minute;
				this.update();
			}

			setSecond(second) {
				this.second = second;
				this.update();
			}

			getTime() {
				return reference.getTime(this);
			}

			getYear() {
				return this.year + 1;
			}

			getFullYear() {
				return this.year + 1;
			}

			getMonth() {
				return this.month;
			}

			getDate() {
				return this.day + 1;
			}

			getDay() {
				return this.dayOfWeek;
			}

			getHour() {
				return this.hour;
			}

			getMinute() {
				return this.minute;
			}

			getSecond() {
				return this.second;
			}

			toString() {
				return this.toDateString() + " " + this.toTimeString();
			}

			toLocaleDateString() {
				var display = [];
				display.push(this.month + 1);
				display.push(this.day + 1);
				display.push(this.year + 1);
				if(display[1] < 10) {
					display[1] = "0" + display[1];
				}
				return display.join("/");
			}

			toDateString() {
				var display;

				display = reference.daysOfWeek[this.dayOfWeek].name + " " + reference.monthsOfYear[this.month].name + " " + (this.day + 1) + ", " + (this.year + 1);

				return display;
			}

			toTimeString() {
				var display = [];
				display.push(this.hour<10?"0" + this.hour:this.hour);
				display.push(this.minute<10?"0" + this.minute:this.minute);
				display.push(this.second<10?"0" + this.second:this.second);
				return display.join(":");
			}
		}

		this.RSDate = RSDate;

		/**
		 * @property universe
		 * @type Universe
		 */
		this.universe = universe;

		this.handler = {};
		this.handler.time = function(event) {
			reference.trackTime(event);
		};

		universe.$on("time:changed", this.handler.time);

		/**
		 * Contains second duration for the named time span.
		 * @property CONSTANTS
		 * @deprecated This should be replaced by a definition object of some kind to allow deeper changes to the way time is used
		 * @type Object
		 */
		this.CONSTANTS = {};
		/**
		 * 
		 * @property CONSTANTS.second
		 * @type Integer
		 */
		this.CONSTANTS.second = 1;
		/**
		 * 
		 * @property CONSTANTS.minute
		 * @type Integer
		 */
		this.CONSTANTS.minute = this.CONSTANTS.second * 60;
		/**
		 * 
		 * @property CONSTANTS.hour
		 * @type Integer
		 */
		this.CONSTANTS.hour = this.CONSTANTS.minute * 60;
		/**
		 * 
		 * @property CONSTANTS.day
		 * @type Integer
		 */
		this.CONSTANTS.day = this.CONSTANTS.hour * 24;
		/**
		 * Upated by a call to nameDays
		 * @property CONSTANTS.week
		 * @type Integer
		 * @default 5 Days
		 */
		this.CONSTANTS.week = this.CONSTANTS.day * 5;
		/**
		 * Should generally be avoided or used as a guide, but
		 * can be set.
		 * @property CONSTANTS.month
		 * @type Integer
		 * @default 5 Weeks
		 */
		this.CONSTANTS.month = this.CONSTANTS.week * 5;
		/**
		 * Updated once the number of days a month and the months
		 * are named.
		 * @property CONSTANTS.year
		 * @type Integer
		 * @default 8 Months
		 */
		this.CONSTANTS.year = this.CONSTANTS.month * 8;
		/**
		 * Updated once the number of days in a year.
		 * @property CONSTANTS.daysInYear
		 * @type Integer
		 * @default 200 Days
		 */
		this.CONSTANTS.daysInYear = this.CONSTANTS.year / this.CONSTANTS.day;

		/**
		 * Lookup for IDs on which this calendar should rebuild.
		 * 
		 * This does not clear between changes and thus _can_ lead to memory issues,
		 * but that would mean a great deal number of calendar shifts.
		 * @property followedIDs
		 * @type Object
		 */
		this.followedIDs = {};

		/**
		 * Names the months in the year and provides a count of the number
		 * of months in a year.
		 * @property monthsOfYear
		 * @type Array | String
		 */
		this.monthsOfYear = [];
		/**
		 * Currently only supports these all being the same count.
		 * @property daysInMonth
		 * @type Array | Integer
		 * @default 25
		 */
		this.daysInMonth = [];
		/**
		 * Direct names or objects describing the day
		 * @property daysOfWeek
		 * @type Array | String
		 */
		this.daysOfWeek = [];
		/**
		 * 
		 * @property weather
		 * @type Object
		 */
		this.weather = null;

		/**
		 * 
		 * @property timeline
		 * @type Integer
		 */
		this.timeline = 0;
		/**
		 * 
		 * @property time
		 * @type Integer
		 */
		this.time = 0;
		/**
		 * 
		 * @property second
		 * @type Integer
		 */
		this.second = 0;
		/**
		 * 
		 * @property minute
		 * @type Integer
		 */
		this.minute = 0;
		/**
		 * 
		 * @property hour
		 * @type Integer
		 */
		this.hour = 0;
		/**
		 * 
		 * @property month
		 * @type Integer
		 */
		this.month = 0;
		/**
		 * 
		 * @property year
		 * @type Integer
		 */
		this.year = 0;
		/**
		 * The week of the year
		 * @property week
		 * @type Integer
		 */
		this.week = 0;
		/**
		 * The day of the month
		 * @property day
		 * @type Integer
		 */
		this.day = 0;
		/**
		 * The day of the year
		 * @property date
		 * @type Integer
		 */
		this.date = 0;
		/**
		 * 
		 * @property dayOfWeek
		 * @type Integer
		 */
		this.dayOfWeek = 0;

		/**
		 * 
		 * @property seasons
		 * @type Array
		 */
		this.seasons = [];

		/**
		 * 
		 * @property festivals
		 * @type Array
		 */
		this.festivals = [];
	}


	isFollowing(object) {
		if(!object) {
			return false;
		}
		return this.followedIDs[object.id || object];
	}

	/**
	 * 
	 * @method setUniverse
	 * @param {Universe} universe 
	 */
	setUniverse(universe) {
		if(this.universe) {
			this.universe.$off(this.handler.time);
		}
		universe.$on("time:changed", this.handler.time);
		this.universe = universe;
	}

	/**
	 * 
	 * @method setCalendar
	 * @param {RSObject} calendar Classes object around which to build
	 */
	setCalendar(calendar) {
		if(!calendar) {
			console.warn("Attempted to set null calendar");
			return null;
		}

		this.id = calendar.id;
		var month = [],
			days = 0,
			loading,
			i;

		this.monthsOfYear.splice(0);
		this.daysInMonth.splice(0);
		this.daysOfWeek.splice(0);
		this.festivals.splice(0);
		this.seasons.splice(0);

		for(i=0; i<calendar.months.length; i++) {
			loading = this.universe.get(calendar.months[i]);
			if(loading) {
				this.followedIDs[loading.id] = true;
				this.monthsOfYear.push(loading);
				days += loading.days;
				month.push(loading.days);
			} else {
				console.error("Failed to find month for calendar: " + calendar.months[i]);
				// TODO: Lots of alerts (x_x)
			}
		}

		for(i=0; i<calendar.week.length; i++) {
			loading = this.universe.get(calendar.week[i]);
			if(loading) {
				this.followedIDs[loading.id] = true;
				this.daysOfWeek.push(loading);
			} else {
				console.error("Failed to find week for calendar: " + calendar.week[i]);
				// TODO: Lots of alerts (x_x)
			}
		}

		for(i=0; i<calendar.festivals.length; i++) {
			loading = this.universe.get(calendar.festivals[i]);
			if(loading) {
				this.followedIDs[loading.id] = true;
				this.festivals.push(loading);
			} else {
				console.warn("Failed to find festival for calendar: " + calendar.festivals[i]);
				// TODO: alerts (x_x)
			}
		}

		for(i=0; i<calendar.seasons.length; i++) {
			loading = this.universe.get(calendar.seasons[i]);
			if(loading) {
				this.followedIDs[loading.id] = true;
				this.seasons.push(loading);
			} else {
				console.warn("Failed to find season for calendar: " + calendar.seasons[i]);
				// TODO: alerts (x_x)
			}
		}

		this.CONSTANTS.second = 1;
		this.CONSTANTS.minute = this.CONSTANTS.second * 60;
		this.CONSTANTS.hour = this.CONSTANTS.minute * 60;
		this.CONSTANTS.day = this.CONSTANTS.hour * 24;
		this.CONSTANTS.week = this.CONSTANTS.day * this.daysOfWeek.length;
		this.CONSTANTS.year = this.CONSTANTS.day * days;
		this.CONSTANTS.daysInYear = days;
		this.CONSTANTS.month = Math.floor(rsSystem.utility.average(month));

		if(this.time) {
			this.setTime(this.time);
		}
	}

	/**
	 * 
	 * @method setTime
	 * @param {Integer} time 
	 * @param {Integer} [timeline] 
	 */
	setTime(time, timeline) {
		if(time !== null && time !== undefined) {
			var month,
				days,
				i;

			Vue.set(this, "time", time);
			if(typeof(timeline) === "number") {
				Vue.set(this, "timeline", timeline);
			}

			this.breakdownGameTime(time, this);

			// Vue.set(this, "second", Math.floor(time%60));
			// time = Math.floor(time/60);
			// Vue.set(this, "minute", Math.floor(time%60));
			// time = Math.floor(time/60);
			// Vue.set(this, "hour", Math.floor(time%24));
			// time = Math.floor(time/24);

			// /* */
			// Vue.set(this, "year", Math.floor(time/this.CONSTANTS.daysInYear));
			// time = time%this.CONSTANTS.daysInYear; // Days remaining
			// Vue.set(this, "week", Math.floor(time/this.CONSTANTS.week));
			// for(i=0; i<this.monthsOfYear.length; i++) {
			// 	month = this.monthsOfYear[i];
			// 	days = month.days || this.daysInMonth[i] || this.daysInMonth[0] || 25;
			// 	if(days <= time) {
			// 		time -= days;
			// 	} else {
			// 		Vue.set(this, "month", i + 1);
			// 	}
			// }
			// Vue.set(this, "day", days);


			/* *
			Vue.set(this, "day", Math.floor(time%(this.daysInMonth[0] || 25)));
			time = Math.floor(time/25);
			Vue.set(this, "month", Math.floor(time%this.monthsOfYear.length));
			Vue.set(this, "year", Math.floor(time/this.monthsOfYear.length));
			*/
		}
	}


	getMonth(index) {
		var month;

		if(index === undefined) {
			index = this.month;
		}

		month = this.monthsOfYear[index];
		if(typeof(month) === "object") {
			return month;
		}

		return {
			"id": "month",
			"name": month,
			"days": this.daysInMonth[index] || this.daysInMonth[0] || 25
		};
	}

	/**
	 * 
	 * @method trackTime
	 * @param {Object} event 
	 */
	trackTime(event) {
		this.setTime(event.time, event.timeline);
	}

	/**
	 * 
	 * @method nameMonths
	 * @param {Array | String} months 
	 */
	nameMonths(months) {
		this.monthsOfYear.splice(0);
		this.monthsOfYear.push.apply(this.monthsOfYear, months.map((name) => {
			return {
				"id": this.monthsOfYear.length,
				"name": name
			};
		}));
		if(this.daysInMonth.length === 1) {
			this.CONSTANTS.year = this.daysInMonth[0] * this.monthsOfYear.length * this.CONSTANTS.day;
		}
	}

	/**
	 * 
	 * @method nameDays
	 * @param {Array | String} days Names for the week; ie. ["Monday", "Tuesday", etc...]
	 */
	nameDays(days) {
		this.daysOfWeek.splice(0);
		this.daysOfWeek.push.apply(this.daysOfWeek, days);
		this.CONSTANTS.week = days.length * this.CONSTANTS.day;
	}

	/**
	 * 
	 * @method setMonths
	 * @param {Array | Integer} days 
	 */
	setDays(days) {
		this.daysInMonth.splice(0);
		this.daysInMonth.push.apply(this.daysInMonth, days);
		if(days.length === 1) {
			this.CONSTANTS.year = days[0] * this.monthsOfYear.length * this.CONSTANTS.day;
		} else {
			var sum = 0,
				i;
			for(i=0; i<days.length; i++) {
				sum += days[i];
			}
			this.CONSTANTS.year = sum * this.CONSTANTS.day;
		}
	}

	/**
	 * Set the current weather to a Weather class object.
	 * @method setWeather
	 * @param {Object} weather 
	 */
	setWeather(weather) {
		Vue.set(this, "weather", weather);
	}

	/**
	 * 
	 * @method breakdownGameTime
	 * @param {Integer} time
	 * @param {Object} [into]
	 * @return {Object} Returns `into` or a new object with the properties set.
	 * 		Uses `Vue.set`.
	 */
	breakdownGameTime(time, into = {}) {
		var month,
			days,
			i;

		Vue.set(into, "second", Math.floor(time%60));
		time = Math.floor(time/60);
		Vue.set(into, "minute", Math.floor(time%60));
		time = Math.floor(time/60);
		Vue.set(into, "hour", Math.floor(time%24));
		time = Math.floor(time/24);


		/* */
		Vue.set(into, "year", Math.floor(time/this.CONSTANTS.daysInYear));
		Vue.set(into, "dayOfWeek", Math.floor(time%this.daysOfWeek.length));
		Vue.set(into, "weekEver", Math.floor(time/this.daysOfWeek.length));
		time = time%this.CONSTANTS.daysInYear;
		Vue.set(into, "week", Math.floor(time/this.daysOfWeek.length));
		for(i=0; i<this.monthsOfYear.length; i++) {
			month = this.monthsOfYear[i];
			days = month.days || this.daysInMonth[i] || this.daysInMonth[0] || 25;
			if(days <= time) {
				time -= days;
			} else {
				Vue.set(into, "month", i);
				break;
			}
		}
		Vue.set(into, "day", time);
		return into;
	}

	/**
	 * 
	 * @method getTime
	 * @param {Object} details 
	 * @param {Integer} details.month
	 * @param {Integer} details.year
	 * @param {Integer} details.day
	 * @param {Integer} details.hour
	 * @param {Integer} details.minute
	 * @param {Integer} details.second
	 * @return {Number} Timestamp for the passed details
	 */
	getTime(details) {
		var time = 0,
			i;

		if(0 < details.month) {
			for(i=0; i<details.month; i++) {
				time += this.monthsOfYear[i%this.monthsOfYear.length].days * this.CONSTANTS.day;
			}
		} else if(details.month < 0) {
			for(i=0; details.month<i; i--) {
				time -= this.monthsOfYear[ (this.monthsOfYear.length + (i%this.monthsOfYear.length)) - 1].days * this.CONSTANTS.day;
			}
		}
		if(details.year) {
			time += (details.year) * this.CONSTANTS.year;
		}
		if(details.day) {
			time += (details.day) * this.CONSTANTS.day;
		}
		if(details.hour) {
			time += (details.hour) * this.CONSTANTS.hour;
		}
		if(details.minute) {
			time += (details.minute) * this.CONSTANTS.minute;
		}
		if(details.second) {
			time += (details.second) * this.CONSTANTS.second;
		}
		return time;
	}

	/**
	 * 
	 * @method displayDuration
	 * @param {Integer} [time] Defaults to current time.
	 * @param {Boolean} [includeTime] Included by default.
	 * @returns {String}
	 */
	displayDuration(duration, includeTime = true, longForm = true) {
		var root = this.breakdownGameTime(duration, {}),
			string = [];

		if(root.day) {
			string.push(root.day);
			if(longForm) {
				if(root.day === 1) {
					string.push(" Day ");
				} else {
					string.push(" Days ");
				}
			} else {
				string.push("D ");
			}
		}
		if(root.month) {
			string.push(root.month);
			if(longForm) {
				if(root.month === 1) {
					string.push(" Month ");
				} else {
					string.push(" Months ");
				}
			} else {
				string.push("M ");
			}
		}
		if(root.year) {
			string.push(root.year);
			if(longForm) {
				if(root.year === 1) {
					string.push(" Year ");
				} else {
					string.push(" Years ");
				}
			} else {
				string.push("Y ");
			}
		}
		if(includeTime) {
			if(root.hour < 10) {
				string.push("0");
			}
			string.push(root.hour + ":");
			if(root.minute < 10) {
				string.push("0");
			}
			string.push(root.minute + ":");
			if(root.second < 10) {
				string.push("0");
			}
			string.push(root.second);
		}
		
		return string.join("");
	}

	/**
	 * 
	 * @method toDisplay
	 * @param {Integer} [time] Defaults to current time.
	 * @param {Boolean} [includeTime] Included by default.
	 * @returns {String}
	 */
	toDisplay(time, includeTime = true, longForm = true, dayOfWeek = true) {
		var display,
			parsed;

		if(time) {
			time = Math.floor(time);
		} else {
			time = this.time;
		}
		parsed = this.breakdownGameTime(time);

		if(longForm) {
			display = this.monthsOfYear[parsed.month].name + " " + (parsed.day + 1) + ", " + (parsed.year + 1);
		} else {
			display = (parsed.month + 1) + "/" + (parsed.day + 1)+ "/" + (parsed.year + 1);
		}

		if(includeTime) {
			parsed.hour = parsed.hour<10?"0" + parsed.hour:parsed.hour;
			parsed.minute = parsed.minute<10?"0" + parsed.minute:parsed.minute;
			parsed.second = parsed.second<10?"0" + parsed.second:parsed.second;
			display += " " + parsed.hour + ":" + parsed.minute + ":" + parsed.second;
		}

		return display;

		var string = "",
			parsed,
			month,
			year,
			day,
			num;
		
		parsed = this.breakdownGameTime(time);
		if(includeTime) {
			string = Math.floor(time%60) + string;
			time = Math.floor(time/60);
			string = Math.floor(time%60) + ":" + string;
			time = Math.floor(time/60);
			string = " " + Math.floor(time%24) + ":" + string;
			time = Math.floor(time/24);
		} else {
			time = Math.floor(time/86400);
		}

		if(longForm) {
			if(dayOfWeek) {
				if(typeof(this.daysOfWeek[time%this.daysOfWeek.length]) === "object") {
					day = this.daysOfWeek[time%this.daysOfWeek.length].name + " ";
				} else {
					day = this.daysOfWeek[time%this.daysOfWeek.length] + " ";
				}
			} else {
				day = "";
			}
			num = Math.floor(time%25) + 1;
			time = Math.floor(time/25);
			month = this.monthsOfYear[Math.floor(time%this.monthsOfYear.length)];
			year = Math.floor(time/this.monthsOfYear.length) + 1;
			return day + month + " " + num + ", " + year + string;
		} else {
			num = Math.floor(time%25) + 1;
			time = Math.floor(time/25);
			month = Math.floor(time%this.monthsOfYear.length);
			year = Math.floor(time/this.monthsOfYear.length) + 1;
			return (month + 1) + "/" + num + "/" + year + string;
		}
	}

	/**
	 * Reapply the current calendar, if any. Otherwise nothing happens.
	 * @method update
	 */
	update() {
		if(this.id) {
			this.setCalendar(this.universe.get(this.id));
		}
	}
}

rsSystem.Calendar = RSCalendar;

/**
 * 
 * @class RSData
 * @namespace RSCalendar
 * @extends Date
 */
