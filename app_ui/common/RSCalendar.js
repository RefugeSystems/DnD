(function() {
	/**
	 * Handle the calendar for a universe.
	 * 
	 * TODO: This should be made to mirror the default `Calendar` object
	 * as far as methods and behaviors to allow easy usage of "normal"
	 * time or other custom calendars where the standard is used as a
	 * reference model.
	 * @class Calendar
	 * @extends EventEmitter
	 * @namespace rsSystem
	 * @param {Universe} universe
	 * @constructor
	 * @static
	 */
	class RSCalendar extends EventEmitter{
		constructor(universe) {
			super();

			var reference = this;

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
			 * @default 7 Days
			 */
			this.CONSTANTS.week = this.CONSTANTS.day * 5;
			/**
			 * Should generally be avoided or used as a guide, but
			 * can be set.
			 * @property CONSTANTS.month
			 * @type Integer
			 */
			this.CONSTANTS.month = this.CONSTANTS.week * 5;
			/**
			 * Updated once the number of days a month and the months
			 * are named.
			 * @property CONSTANTS.year
			 * @type Integer
			 * @default 365 Days
			 */
			this.CONSTANTS.year = this.CONSTANTS.day * 365;

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
			 * 
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
		 * @method setTime
		 * @param {Integer} time 
		 * @param {Integer} [timeline] 
		 */
		setTime(time, timeline) {
			if(time !== null && time !== undefined) {
				if(timeline !== undefined) {
					Vue.set(this, "timeline", timeline);
				}
				Vue.set(this, "time", time);

				Vue.set(this, "second", Math.floor(time%60));
				time = Math.floor(time/60);
				Vue.set(this, "minute", Math.floor(time%60));
				time = Math.floor(time/60);
				Vue.set(this, "hour", Math.floor(time%24));
				time = Math.floor(time/24);
				Vue.set(this, "day", Math.floor(time%(this.daysInMonth[0] || 25)));
				time = Math.floor(time/25);
				Vue.set(this, "month", Math.floor(time%this.monthsOfYear.length));
				Vue.set(this, "year", Math.floor(time/this.monthsOfYear.length));
			}
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
		 * @method setMonths
		 * @param {Array | String} months 
		 */
		nameMonths(months) {
			this.monthsOfYear.splice(0);
			this.monthsOfYear.push.apply(this.monthsOfYear, months);
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
			// var tracking = this.world.time.game || 0;
			Vue.set(into, "second", Math.floor(time%60));
			time = Math.floor(time/60);
			Vue.set(into, "minute", Math.floor(time%60));
			time = Math.floor(time/60);
			Vue.set(into, "hour", Math.floor(time%24));
			time = Math.floor(time/24);
			Vue.set(into, "day", Math.floor(time%(this.daysInMonth[0] || 25)));
			time = Math.floor(time/25);
			Vue.set(into, "month", Math.floor(time%this.monthsOfYear.length));
			Vue.set(into, "year", Math.floor(time/this.monthsOfYear.length));
			return into;
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
					string.push("d ");
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
					string.push("m ");
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
					string.push("y ");
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
			if(time) {
				time = Math.floor(time);
			} else {
				time = this.time;
			}
			var string = "",
				month,
				year,
				day,
				num;
			
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
					day = this.daysOfWeek[time%this.daysOfWeek.length] + " ";
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
	}

	rsSystem.Calendar = RSCalendar;
})();
