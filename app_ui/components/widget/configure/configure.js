
/**
 * 
 * 
 * @class rsWidgetConfigure
 * @constructor
 * @module Components
 */
rsSystem.component("rsWidgetConfigure", {
	"inherit": true,
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"settings": {
			"type": Object
		},
		"contents": {
			"type": Object
		},
		"state": {
			"required": false,
			"type": Object
		}
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"data": function() {
		var data = {};
		
		return data;
	},
	"methods": {

	},
	"template": Vue.templified("components/widget/configure.html")
});
