
/**
 * 
 * These seem to persist for the info statblock and merely switch objects, resulting in
 * minor descrepencies. The most notable is that the rsSystem.lookup only works when
 * the page loads. Subsequent changes destroy the initially mapped object and since they
 * don't get remounted, they never get new hooks. Great for memory in a way, so leaving,
 * but needs noted. Will likely investiage a way for statblock to track the references
 * for debugging purposes later. Or a debug mode that exposes a button.
 * @class rsDisplayField
 * @constructor
 * @module Components
 */
rsSystem.component("rsDisplayField", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSShowdown
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
		"hasFormula": function() {
			return (this.object._formula && this.fieldData && this.fieldData.type === "calculated" && this.object._formula[this.field] !== undefined && this.object._formula[this.field] !== null && isNaN(this.object._formula[this.field])) ||
					(this.object._formula && this.fieldData && this.object._formula[this.field] !== undefined && this.object._formula[this.field] !== null && isNaN(this.object._formula[this.field]));
		},
		"displayed": function() {
			if(this.object.picture === this.object.portrait && (this.field === "picture" || this.field === "portrait")) {
				return false;
			}
			if(this.fieldData.attribute.hide_when_not_set && !this.object[this.field]) {
				return false;
			}
			return this.empties || this.fieldData.type === "boolean" || (this.object[this.field] && (typeof(this.object[this.field]) !== "object" || Object.keys(this.object[this.field]).length));
		},
		"realType": function() {
			return typeof(this.object[this.field]);
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
	"watch": {
		"object": function() {
			this.update();
		},
		"field": function() {
			this.update();
		}
	},
	"data": function() {
		var data = {};
		
		data.canToggleField = !!this.profile;
		data.viewInvolved = false;
		data.viewFormula = false;
		data.detailInvolved = {};
		data.viewFormulaKey = {};
		data.objectKeys = [];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.update();
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
			var id = record.id || record;
			if(this.$route.query.info !== id) {
				rsSystem.manipulateQuery({
					"info": id
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
		"isActive": function(value) {
			if(value && value.id) {
				return !!(value.active || value.is_active);
			}
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
		"toggleFormula": function() {
			Vue.set(this, "viewFormula", !this.viewFormula);
		},
		"toggleFormulaKey": function(key) {
			Vue.set(this.viewFormulaKey, key, !this.viewFormulaKey[key]);
		},
		"getCellCount": function() {
			var value = this.object[this.field];
			if(typeof(this.fieldData.attribute.cell_size) === "number" && typeof(value) === "number") {
				return " (" + (value / this.fieldData.attribute.cell_size).toFixed(0) + " Cells)";
			}
			return "";
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
			console.warn("Deprecated");
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
			} else if(this.fieldData.attribute && this.fieldData.attribute.display_format) {
				switch(this.fieldData.attribute.display_format) {
					case "duration":
						return Math.floor(value/6) + " Rounds (" + this.universe.calendar.displayDuration(value) + ")";
					default:
						console.warn("Unknown Display Format: " + this.fieldData.attribute.display_format, this);
						return value;
				}
				return this.fieldData.displayed_as[value];
			} else if(this.fieldData.inheritable) {
				value = this.universe.getObject(value);
				if(value) {
					return value.name || value.id;
				} else {
					return this.object[this.field];
				}
			} else {
				switch(this.fieldData.type) {
					case "gametime":
						return this.universe.calendar.toDisplay(value, !!this.fieldData.attribute.include_time);
					case "date":
						return new Date(value).toLocaleString();
					default:
						return value;
				}
			}
		},
		"update": function() {
			var keys,
				load,
				x;
			
			this.objectKeys.splice(0);
			if(this.realType === "object" && this.object[this.field]) {
				keys = Object.keys(this.object[this.field]);
				if(this.fieldData.attribute.inherited_key && this.fieldData.attribute.displayed !== false) {
					for(x=0; x<keys.length; x++) {
						if(load = this.universe.getObject(keys[x])) {
							this.objectKeys.push(load);
						}
					}
				} else {
					for(x=0; x<keys.length; x++) {
						this.objectKeys.push({
							"name": this.fieldData.displayed_as?this.fieldData.displayed_as[keys[x]] || keys[x]:keys[x],
							"id": keys[x],
							"faux": true
						});
					}
				}
			}
		}
	},
	"template": Vue.templified("components/display/field.html")
});
