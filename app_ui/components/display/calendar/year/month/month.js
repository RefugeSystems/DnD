/**
 * View/Select days in the specified month
 * @class rsCalendarYearMonth
 * @constructor
 * @module Components
 * @param {RSCalendar} calendar
 * @param {Object} rendering Anchor point for unified rendering
 * @param {Object} [rendering.time] Optionally specify the time
 * @param {Object} [rendering.year] Optionally specify the year
 * @param {Object} entity
 */
rsSystem.component("rsCalendarYearMonth", {
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
		"eventReference": {
			"type": Object
		},
		"sourceYear": {
			"requried": true,
			"type": Date
		},
		"rendMonth": {
			"requried": true,
			"type": Number
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

		data.todayYear = 0;
		data.todayMonth = 0;
		data.todayDay = 0;

		data.rendYear = this.sourceYear.getFullYear();

		data.rendering = new this.calendar.RSDate();
		data.rendering.setMonth(this.rendMonth);
		data.rendering.setYear(this.sourceYear.getFullYear());
		data.rendering.setMinute(0);
		data.rendering.setSecond(0);
		data.rendering.setHour(0);
		data.rendering.setDate(1);

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.build();
		rsSystem.EventBus.$on("calendar:update", this.build);
	},
	"methods": {
		"renderDate": function() {
			var day = this.rendering.getDate(),
				rendered = {},
				reference;

			this.renderedDays[day] = rendered;
			this.days.push(rendered);

			rendered.dayOfWeek = this.rendering.getDay();
			this.rendering.setDate(day + 1);
			rendered.month = this.rendMonth;
			rendered.year = this.rendYear;
			rendered.classes = [];
			rendered.number = day;

			if(this.rendYear === this.todayYear && this.rendMonth === this.todayMonth && rendered.number === this.todayDay) {
				rendered.classes.push("today");
			}
			if(this.eventReference[this.rendYear] && this.eventReference[this.rendYear][this.rendMonth] && this.eventReference[this.rendYear][this.rendMonth][day]) {
				reference = this.eventReference[this.rendYear][this.rendMonth][day];
				if(reference.skirmish) {
					rendered.classes.push("skirmish");
				} else if(reference.events.length) {
					rendered.classes.push("events");
				}
			}

			rendered.classes = rendered.classes.join(" ");
			return rendered;
		},
		"build": function() {
			var year = this.sourceYear.getFullYear(),
				month = this.rendMonth;
			Vue.set(this, "rendYear", year);
			this.rendering.setYear(year);

			if(this.today) {
				this.todayYear = this.today.getFullYear();
				this.todayMonth = this.today.getMonth();
				this.todayDay = this.today.getDate();
			}
			
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
			}
			this.weeks.push(week);
			this.rendering.setDate(this.rendering.getDate() - 1);
		},
		"openMonth": function() {
			console.log("YearMonth Month: ", this.rendMonth);
			this.$emit("month", this.rendMonth);
		},
		"openDay": function(day) {
			console.log("YearMonth Day: ", this.rendMonth, day);
			this.$emit("day", this.rendMonth, day);
		}
	},
	"beforeDestroy": function () {
		rsSystem.EventBus.$off("calendar:update", this.build);
	},
	"template": Vue.templified("components/display/calendar/year/month.html")
});
