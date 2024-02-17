/**
 * View/Select days in the specified month
 * @class rsCalendarMonth
 * @constructor
 * @module Components
 * @param {RSCalendar} calendar
 * @param {Object} rendering Anchor point for unified rendering
 * @param {Object} [rendering.time] Optionally specify the time
 * @param {Object} [rendering.year] Optionally specify the year
 * @param {Object} entity
 */
rsSystem.component("rsCalendarMonth", {
	"inherit": true,
	"mixins": [],
	"props": {
		"universe": {
			"requried": true,
			"type": Object
		},
		"calendar": {
			"requried": true,
			"type": Object
		},
		"entity": {
			"requried": true,
			"type": Object
		},
		"rendering": {
			"requried": true,
			"type": Date
		},
		"today": {
			"type": Date
		}
	},
	"computed": {

	},
	"data": function () {
		var data = {};

		data.renderedDays = {};
		data.festivals = [],
		data.month = null;
		data.name = null;
		data.weeks = [];
		data.days = [];
		data.start = 0;
		data.year = 0;
		data.week = 0;
		data.end = 0;

		data.todayMonth = 0;
		data.rendMonth = 0;
		data.todayDay = 0;

		this.rendering.setMinute(0);
		this.rendering.setSecond(0);
		this.rendering.setHour(0);

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.build();
	},
	"methods": {
		"previousMonth": function() {
			this.rendering.setMonth(this.rendering.getMonth() - 1);
			this.build();
		},
		"nextMonth": function() {
			this.rendering.setMonth(this.rendering.getMonth() + 1);
			this.build();
		},
		"renderDate": function() {
			var day = this.rendering.getDate(),
				rendered = {};

			this.renderedDays[day] = rendered;
			this.days.push(rendered);

			rendered.dayOfWeek = this.rendering.getDay();
			rendered.start = this.rendering.getTime();
			this.rendering.setDate(day + 1);
			rendered.end = this.rendering.getTime();
			rendered.classes = [];
			rendered.number = day;
			rendered.events = [];

			if(this.rendMonth === this.todayMonth && rendered.number === this.todayDay) {
				rendered.classes.push("today");
			}

			rendered.classes = rendered.classes.join(" ");
			return rendered;
		},
		"build": function() {
			console.log("Rendering Month: " + this.rendering.getMonth());
			var month = this.rendering.getMonth();
			this.todayMonth = this.today.getMonth();
			this.todayDay = this.today.getDate();
			this.rendMonth = month;
			
			Vue.set(this, "month", this.calendar.getMonth(month));
			Vue.set(this, "name", this.month.name);
			this.rendering.setDate(1);
			this.year = this.rendering.getFullYear();
			this.festivals.splice(0);
			this.update();
		},
		"update": function() {
			this.rendering.setDate(1);
			var month = this.rendering.getMonth(),
				safetyPin = 200,
				week = [],
				i = 0,
				festival,
				day;

			this.weeks.splice(0);
			this.days.splice(0);
			while(this.rendering.getMonth() === month && i++ < safetyPin) { // Protect against Date implementation issues
				day = this.renderDate();
				if(day.dayOfWeek === 0 && week.length) {
					this.weeks.push(week);
					week = [];
				}
				while(week.length < day.dayOfWeek) {
					week.push({});
				}
				week.push(day);
				// this.rendering.setDate(this.rendering.getDate() + 1);
			}
			this.weeks.push(week);
			this.rendering.setDate(this.rendering.getDate() - 1);
			
			// Gather events (2/2)?
			for(i=0; i<this.universe.listing.festival.length; i++) {
				festival = this.universe.listing.festival[i];
				if(rsSystem.utility.isValid(festival) && this.rendMonth === festival.month - 1 && this.renderedDays[festival.day]) {
					this.renderedDays[festival.day].events.push(festival);
				}
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/display/calendar/month.html")
});
