/**
 * View/Select a list of months in the specified time/date year
 * @class rsCalendarYear
 * @constructor
 * @module Components
 * @param {RSCalendar} calendar
 * @param {Object} rendering Anchor point for unified rendering
 * @param {Object} [rendering.time] Optionally specify the time
 * @param {Object} [rendering.year] Optionally specify the year
 * @param {Object} entity
 */
rsSystem.component("rsCalendarYear", {
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

		data.months = [];
		data.rendYear = 0;

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		rsSystem.EventBus.$on("calendar:update", this.build);
		this.build();
	},
	"methods": {
		"openDay": function(month, day) {
			console.log("Year Day: ", this.rendYear, month, day);
			this.rendering.setMonth(month);
			this.rendering.setDate(day);
			this.$emit("day", this.rendYear, month, day);
		},
		"openMonth": function(month) {
			this.rendering.setMonth(month);
			console.log("Year Month: ", this.rendYear, month);
			this.$emit("month", this.rendYear, month);
		},
		"build": function() {
			var month;
			this.rendYear = this.rendering.getFullYear();
			this.rendering.setMonth(0);
			this.months.splice(0);
			while(this.rendering.getFullYear() === this.rendYear) {
				this.months.push(month = this.rendering.getMonth());
				this.rendering.setMonth(month + 1);
			}
			this.rendering.setMonth(-1); // Back to our year
		}
	},
	"beforeDestroy": function () {
		rsSystem.EventBus.$off("calendar:update", this.build);
	},
	"template": Vue.templified("components/display/calendar/year.html")
});