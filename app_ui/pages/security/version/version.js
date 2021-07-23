
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
		data.version = rsSystem.version;
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
	},
	"methods": {
		
	},
	"template": Vue.templified("pages/security/version.html")
});
