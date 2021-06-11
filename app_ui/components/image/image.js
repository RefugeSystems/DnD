
/**
 * 
 * 
 * @class rsRenderImage
 * @constructor
 * @module Components
 */
(function() {
	
	
	rsSystem.component("rsRenderImage", {
		"inherit": true,
		"mixins": [
			
		],
		"props": {
			"image": {
				"required": true,
				"type": Object
			},
			"modes": {
				"default": "general",
				"type": String
			},
			"cacheSuffix": {
				default: ""
			},
			"linked": {
				"type": Object
			}
		},
		"computed": {
			/**
			 * 
			 * @property location
			 * @type Object
			 */
			"url": function() {
				if(this.cacheSuffix) {
					return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + this.location.id + "?ctrl=" + this.cacheSuffix;
				}
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + this.location.id;
			}
		},
		"data": function() {
			var data = {};
			
			data.link = null;
			data.uri = null;
			
			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
		},
		"methods": {
			"follow": function() {

			},
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
		"template": Vue.templified("components/image.html")
	});
})();