
/**
 *
 *
 * @class pageLicense
 * @constructor
 * @module Pages
 */
rsSystem.component("pageLicense", {
	"inherit": true,
	"mixins": [],
	"props": {},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
	},
	"methods": {
		
	},
	"template": Vue.templified("pages/security/license.html")
});
