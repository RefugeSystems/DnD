
/**
 *
 *
 * @class pageTerms
 * @constructor
 * @module Pages
 */
rsSystem.component("pageTerms", {
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
	"template": Vue.templified("pages/security/terms.html")
});
