
/**
 * 
 * 
 * @class RSAbout
 * @constructor
 * @module Pages
 */
rsSystem.component("RSAbout", {
	"inherit": true,
	"mixins": [],
	"mounted": function() {
		rsSystem.register(this);
	},
	"data": function() {
		var data = {};
		return data;
	},
	"methods": {
	},
	"template": Vue.templified("pages/about.html")
});
