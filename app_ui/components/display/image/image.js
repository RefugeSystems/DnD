
/**
 * 
 * 
 * @class rsImage
 * @constructor
 * @module Components
 * @param {String | Object} image Object or ID for the object
 * @param {String} [cacheSuffix] 
 * @param {Object} [linked]
 */
(function() {
	
	
	rsSystem.component("rsImage", {
		"inherit": true,
		"mixins": [
			
		],
		"props": {
			"image": {
				"required": true
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
			 * @property url
			 * @type String
			 */
			"url": function() {
				/*
				if(this.cacheSuffix) {
					return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + (this.image.id || this.image) + "?ctrl=" + this.cacheSuffix;
				}
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + (this.image.id || this.image);
				*/
				if(this.cacheSuffix) {
					return location.protocol + "//" + rsSystem.universe.connection.url.host + "/api/v1/image/" + (this.image.id || this.image) + "?ctrl=" + this.cacheSuffix;
				}
				return location.protocol + "//" + rsSystem.universe.connection.url.host + "/api/v1/image/" + (this.image.id || this.image);
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
				var classes = "";
				
				if(this.linked) {
					classes += " linked";
				}
				
				return classes;
			}
		},
		"template": Vue.templified("components/display/image.html")
	});
})();