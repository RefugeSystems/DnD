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
		"player": {
			"type": Object
		},
		"eventReference": {
			"type": Object
		},
		"today": {
			"type": Date
		}
	},
	"computed": {

	},
	"watch": {
		"eventReference": {
			"deep": true,
			"handler": function() {
				// console.log(" ! Month Watch Fire");
				this.update();
			}
		}
	},
	"data": function () {
		// console.log("Data: Month");
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
		data.rendYear = 0;
		data.todayDay = 0;

		this.rendering.setMinute(0);
		this.rendering.setSecond(0);
		this.rendering.setHour(0);

		return data;
	},
	"mounted": function () {
		// console.log("Mounted: Month");
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
			rendered.start = this.rendering.getTime();
			this.rendering.setDate(day + 1);
			rendered.end = this.rendering.getTime();
			rendered.month = this.rendMonth;
			rendered.classes = [];
			rendered.number = day;
			rendered.events = [];

			if(this.rendMonth === this.todayMonth && rendered.number === this.todayDay) {
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
			// console.log("Build Month");
			var month = this.rendering.getMonth();
			this.rendYear = this.rendering.getFullYear();
			this.rendMonth = month;
			if(this.today) {
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
			// console.log("Update Month");
			this.rendering.setDate(1);
			var month = this.rendering.getMonth(),
				safetyPin = 200,
				week = [],
				i = 0,
				festival,
				event,
				date,
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
			// console.log(" > Render Complete - Reference: ", _p(this.eventReference));
			
			// Gather events (2/2)?
			for(i=0; i<this.universe.listing.festival.length; i++) {
				festival = this.universe.listing.festival[i];
				if(rsSystem.utility.isValid(festival) && this.rendMonth === festival.month - 1 && this.renderedDays[festival.day]) {
					this.renderedDays[festival.day].events.push(festival);
				}
			}
			for(i=0; i<this.universe.listing.event.length; i++) {
				event = this.universe.listing.event[i];
				if(rsSystem.utility.isValid(event) && ((this.entity && event.associations && event.associations.indexOf(this.entity.id) !== -1) || (this.player && this.player.gm))) {
					date = new this.universe.calendar.RSDate(event.time);
					day = date.getDate();
					if(this.rendYear === date.getFullYear() && this.rendMonth === date.getMonth() && this.renderedDays[day]) {
						if(this.renderedDays[day].events.length < 4) {
							this.renderedDays[day].events.push(event);
						} else {
							this.renderedDays[day].events.push({
								"name": "..."
							});
						}
					}
				}
			}
		},
		"openDay": function(day) {
			this.rendering.setDate(day.number);
			this.$emit("day", this.rendering.getFullYear(), this.rendMonth, day);
		},
		"info": function(festival) {
			rsSystem.utility.info(festival);
		}
	},
	"beforeDestroy": function () {
		rsSystem.EventBus.$off("calendar:update", this.build);
	},
	"template": Vue.templified("components/display/calendar/month.html")
});
