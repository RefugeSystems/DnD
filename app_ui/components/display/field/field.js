
/**
 * 
 * 
 * @class rsDisplayField
 * @constructor
 * @module Components
 */
rsSystem.component("rsDisplayField", {
	"inherit": true,
	"mixins": [
		
	],
	"props": {
		/**
		 * ID of the image
		 * @property object
		 * @type Object
		 */
		"object": {
			"required": true,
			"type": Object
		},
		"field": {
			"required": true,
			"type": String
		},
		"universe": {
			"required": true,
			"type": Object
		},
		"empties": {
			"type": Boolean
		},
		"marking": {
			"type": String
		}
	},
	"computed": {
		"fieldData": function() {
			return this.universe.index.fields[this.field];
		},
		"displayed": function() {
			return this.empties || this.fieldData.type === "boolean" || this.object[this.field];
		}
	},
	"data": function() {
		var data = {};
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"getValueDisplay": function(field, value) {
			if(field.attribute.obscures) {
				for(var x=0; x<field.attribute.obscures.length; x++) {
					if(this.object[field.attribute.obscures[x]] !== undefined && this.object[field.attribute.obscures[x]] !== null) {
						value = this.object[field.attribute.obscures[x]];
						if(typeof(value) === "object") {
							return value.name || value.id || value;
						} else {
							return value;
						}
					}
				}
			}
			
			if(typeof(value) === "object") {
				if(field.attribute.display_key) {
					return value[field.attribute.display_key];
				} else {
					return value.name || value.id || value;
				}
			} else {
				return value;
			}
		},
		"getArrayValue": function() {
			if(this.object[this.field]) {
				if(this.fieldData.inheritable) {
					var value = [],
						lookup,
						x;
						
					for(x=0; x<this.object[this.field].length; x++) {
						lookup = this.universe.getObject(this.object[this.field][x]);
						if(lookup) {
							value.push(lookup);
						} else {
							rsSystem.log.warn("Unknown Value? " + this.object[this.field][x]);
						}
					}
					
					return value;
				} else {
					return this.object[this.field];
				}
			} else {
				return "";
			}
		},
		"getValue": function() {
			if(this.fieldData.inheritable) {
				var value = this.universe.getObject(this.object[this.field]);
				if(value) {
					return value.name || value.id;
				}
			} else {
				return this.object[this.field];
			}
		}
	},
	"template": Vue.templified("components/display/field.html")
});
