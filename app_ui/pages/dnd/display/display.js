/**
 * Page designed to respond to Master Control Signals and change displayed data
 * as a general presentation to the players (such as a room display).
 * @class DNDDisplay
 * @constructor
 * @module Pages
 */
rsSystem.component("DNDDisplay", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		}
	},
	"watch": {

	},
	"data": function() {
		var data = {};
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("updated", this.updateReceived);
	},
	"methods": {
		"updateReceived": function(event) {
			if(event && (event._class === "dmrelease" || event._class === "dmtask" || event._class === "setting")) {

			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.updateReceived);
	},
	"template": Vue.templified("pages/release.html")
});