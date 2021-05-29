
/**
 *
 *
 * @class pagePrivacy
 * @constructor
 * @module Pages
 */
rsSystem.component("pagePrivacy", {
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
	"template": Vue.templified("pages/security/privacy.html")
});
