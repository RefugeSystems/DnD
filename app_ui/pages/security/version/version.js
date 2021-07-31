
/**
 *
 *
 * @class pageLicense
 * @constructor
 * @module Pages
 */
rsSystem.component("pageVersion", {
	"inherit": true,
	"mixins": [],
	"props": {},
	"data": function() {
		var data = {};
		data.updateClasses = "fas fa-download";
		data.version = rsSystem.version;
		data.current = [];
		data.previous = [];
		data.status = 10;
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"update": function() {
			Vue.set(this, "updateClasses", "fas fa-sync fa-spin");
			rsSystem.EventBus.$emit("app-update");
		}
	},
	"template": Vue.templified("pages/security/version.html")
});
