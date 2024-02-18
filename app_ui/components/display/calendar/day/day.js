/**
 * View/Select a list of months in the specified time/date year
 * @class rsCalendarDay
 * @constructor
 * @module Components
 * @param {RSCalendar} calendar
 * @param {Object} rendering Anchor point for unified rendering
 * @param {Object} [rendering.time] Optionally specify the time
 * @param {Object} [rendering.year] Optionally specify the year
 * @param {Object} entity
 */
rsSystem.component("rsCalendarDay", {
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
		"eventReference": {
			"type": Object
		},
		"today": {
			"type": Date
		}
	},
	"computed": {

	},
	"data": function () {
		var data = {};

		data.events = [];
		data.start = 0;
		data.end = 0;

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		rsSystem.EventBus.$on("calendar:update", this.build);
		this.build();
	},
	"methods": {
		"build": function() {
			var year = this.rendering.getFullYear(),
				month = this.rendering.getMonth(),
				day = this.rendering.getDate(),
				reference,
				festival,
				start,
				end,
				i;

			this.rendering.setSecond(0);
			this.rendering.setMinute(0);
			this.rendering.setHour(0);
			start = this.rendering.getTime();
			end = start + this.calendar.CONSTANTS.day;
			this.events.splice(0);

			if(this.eventReference[year] && this.eventReference[year][month] && this.eventReference[year][month][day]) {
				reference = this.eventReference[year][month][day];
				this.events.push.apply(this.events, reference.events);
			}

			month += 1; // Festivals list the month as a "read" number rather than a data number
			for(i=0; i<this.universe.listing.festival.length; i++) {
				festival = this.universe.listing.festival[i];
				if(rsSystem.utility.isValid(festival) && month === festival.month && day === festival.day) {
					this.events.push(festival);
				}
			}
		},
		"info": function(festival) {
			rsSystem.utility.info(festival);
		}
	},
	"beforeDestroy": function () {
		rsSystem.EventBus.$off("calendar:update", this.build);
	},
	"template": Vue.templified("components/display/calendar/day.html")
});