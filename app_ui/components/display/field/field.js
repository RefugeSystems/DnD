
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
			return this.empties || this.fieldData.type === "boolean" || (this.object[this.field] && (typeof(this.object[this.field]) !== "object" || Object.keys(this.object[this.field]).length));
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
		"fieldInfo": function() {
			rsSystem.EventBus.$emit("display-info", {
				"info": "fields:" + this.field
			});
		},
		"info": function(record) {
			if(this.$route.query.info !== record.id) {
				rsSystem.manipulateQuery({
					"info": record.id
				});
			} else {
				rsSystem.manipulateQuery({
					"info": null
				});
			}
		},
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
		"getValueClass": function() {
			return !!this.object[this.field]?"fas fa-check":"fas fa-times";
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
		"getObjectKeys": function() {
			var oKeys = [],
				keys,
				load,
				x;
			
			if(this.object[this.field]) {
				keys = Object.keys(this.object[this.field]);
				if(this.fieldData.attribute.inherited_key && this.fieldData.attribute.displayed !== false) {
					for(x=0; x<keys.length; x++) {
						if(load = this.universe.getObject(keys[x])) {
							oKeys.push(load);
						}
					}
				} else {
					for(x=0; x<keys.length; x++) {
						oKeys.push({
							"name": keys[x],
							"id": keys[x],
							"faux": true
						});
					}
				}
			}
			
			return oKeys;
		},
		"getObjectValue": function(key) {
			var value = this.object[this.field][key.id],
				load,
				x;
			
			if(this.fieldData.attribute.inherited_value) {
				if(load = this.universe.getObject(value)) {
					return load.name;
				} else {
					return value;
				}
			} else if(typeof(value) === "number") {
				// return value > 0?value:value;
				return value;
			// } else if(typeof(value) === "string") {
			// 	return value;
			} else {
				return value;
			}
		},
		"getValue": function() {
			if(this.fieldData.inheritable) {
				var value = this.universe.getObject(this.object[this.field]);
				if(value) {
					return value.name || value.id;
				} else {
					return this.object[this.field];
				}
			} else {
				return this.object[this.field];
			}
		}
	},
	"template": Vue.templified("components/display/field.html")
});
