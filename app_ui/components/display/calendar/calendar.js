/**
 *
 *
 * @class rsCalendarDialog
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("rsCalendarDialog", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController,
		rsSystem.components.StorageController
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {

	},
	"data": function () {
		var data = {};

		data.calendar = this.details.calendar;
		data.entity = this.details.entity;
		data.error = null;

		// Create initial rendering data
		data.rendering = new this.details.calendar.RSDate();
		// Create another instance of now for reference that won't be changed
		data.today = new this.details.calendar.RSDate();

		data.view = "month";

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"viewingMonth": function() {
			return this.view === "month";
		},
		"viewingYear": function() {
			return this.view === "year";
		},
		"era": function() {
			return this.view === "era";
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/display/calendar.html")
});