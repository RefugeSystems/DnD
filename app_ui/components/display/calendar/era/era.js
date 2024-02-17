/**
 * View/Select a list of years +/- from the specified time/date
 * @class rsCalendarEra
 * @constructor
 * @module Components
 * @param {RSCalendar} calendar
 * @param {Object} rendering Anchor point for unified rendering
 * @param {Object} [rendering.time] Optionally specify the time
 * @param {Object} [rendering.year] Optionally specify the year
 * @param {Object} entity
 */
rsSystem.component("rsCalendarEra", {
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


		return data;
	},
	"mounted": function () {
		rsSystem.register(this);

	},
	"methods": {

	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/display/calendar/era.html")
});