
/**
 * 
 * 
 * @class RSWindow
 * @constructor
 * @module Pages
 */
rsSystem.component("RSWindow", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSCorePage
	],
	"template": Vue.templified("pages/window.html")
});
