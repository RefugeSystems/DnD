
/**
 * 
 * 
 * @class rsImage
 * @constructor
 * @module Components
 */
rsSystem.component("rsImage", {
	"inherit": true,
	"mixins": [
		
	],
	"props": {
		/**
		 * ID of the image
		 * @property image
		 * @type String
		 */
		"image": {
			"required": true,
			"type": String
		},
		"modes": {
			"default": "general",
			"type": String
		},
		"universe": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};
		data.uri = this.universe.connection.address.replace("ws://", "http://").replace("wss://", "https://") + "/api/v1/image/" + this.image;
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"classes": function() {
			var classes;
			
			if(this.modes) {
				classes = this.modes;
			} else {
				classes = "general";
			}
			
			if(this.linked) {
				classes += " linked";
			}
			
			return classes;
		}
	},
	"template": Vue.templified("components/display/image.html")
});
