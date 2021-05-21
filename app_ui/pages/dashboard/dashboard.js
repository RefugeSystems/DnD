
/**
 *
 *
 * @class RSDashboard
 * @constructor
 * @module Pages
 */
rsSystem.component("RSDashboard", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};



		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
	},
	"template": Vue.templified("pages/dashboard.html")
});
