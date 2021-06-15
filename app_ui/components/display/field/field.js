
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
		"profile": {
			"type": Object
		},
		"empties": {
			"type": Boolean
		},
		"hideInvolved": {
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
			if(this.object.picture === this.object.portrait && (this.field === "picture" || this.field === "portrait")) {
				return false;
			}
			return this.empties || this.fieldData.type === "boolean" || (this.object[this.field] && (typeof(this.object[this.field]) !== "object" || Object.keys(this.object[this.field]).length));
		},
		"image": function() {
			return this.universe.index.image[this.object[this.field]];
		},
		"involved": function() {
			if(this.object._involved && this.object._involved[this.field] && this.object._involved[this.field]) {
				var keys = Object.keys(this.object._involved[this.field]),
					involved = [],
					buffer,
					i;
				for(i=0; i<keys.length; i++) {
					buffer = this.universe.getObject(keys[i]);
					if(buffer) {
						involved.push(buffer);
					} else {
						// TODO: Warning
					}
				}
				if(involved.length) {
					return involved;
				}
			}
			return null;
		}
	},
	"data": function() {
		var data = {};
		
		data.canToggleField = !!this.profile;
		data.viewInvolved = false;
		data.detailInvolved = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"toggleField": function() {
			if(this.profile) {
				if(!this.profile.field_hide) {
					Vue.set(this.profile, "field_hide", {});
				}
				Vue.set(this.profile.field_hide, this.field, !this.profile.field_hide[this.field]);
			}
		},
		"valuesContainerClass": function() {
			if(this.profile) {
				if(!this.profile.field_hide) {
					Vue.set(this.profile, "field_hide", {});
				}
				if(this.profile.field_hide && this.profile.field_hide[this.field]) {
					return "hide";
				}
			}
			return "show";
		},
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
		"hasInvolved": function() {
			if(this.hideInvolved || !this.involved) {
				return false;
			}

			return true;
		},
		"isString": function(value) {
			return typeof(value) === "string";
		},
		"involvesComplex": function(key) {
			if(this.object._involved && this.object._involved[this.field]) {
				if(parseInt(this.object._involved[this.field][key]) == this.object._involved[this.field][key]) {
					return false;
				}
				return true;
			}
			return false;
		},
		"toggleInvolved": function() {
			Vue.set(this, "viewInvolved", !this.viewInvolved);
		},
		"toggleInvolvedDetail": function(key) {
			Vue.set(this.detailInvolved, key, !this.detailInvolved[key]);
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
			
			if(field.displayed_as && field.displayed_as[value] !== undefined) {
				return field.displayed_as[value];
			} else if(typeof(value) === "object") {
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
						} else if(this.fieldData.displayed_as && this.fieldData.displayed_as[this.object[this.field][x]]) {
							value.push(this.fieldData.displayed_as[this.object[this.field][x]]);
						} else if(this.object[this.field][x] !== undefined && this.object[this.field][x] !== null) {
							value.push(this.object[this.field][x]);
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
							"name": this.fieldData.displayed_as?this.fieldData.displayed_as[keys[x]] || keys[x]:keys[x],
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
			} else if(this.fieldData.displayed_as && this.fieldData.displayed_as[value]) {
				return this.fieldData.displayed_as[value];
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
			var value = this.object[this.field];
			if(this.fieldData.displayed_as && this.fieldData.displayed_as[value]) {
				return this.fieldData.displayed_as[value];
			} else if(this.fieldData.inheritable) {
				value = this.universe.getObject(value);
				if(value) {
					return value.name || value.id;
				} else {
					return this.object[this.field];
				}
			} else {
				return value;
			}
		}
	},
	"template": Vue.templified("components/display/field.html")
});
