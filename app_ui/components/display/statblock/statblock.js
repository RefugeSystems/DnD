
/**
 * 
 * 
 * @class rsStatBlock
 * @constructor
 * @module Components
 */
rsSystem.component("rsStatBlock", {
	"inherit": true,
	"mixins": [
		
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"object": {
			"required": true,
			"type": Object
		},
		"size": {
			"default": 5,
			"type": Number
		},
		"empties": {
			"type": Boolean
		},
		"marking": {
			"type": String
		}
	},
	"computed": {
		"fields": function() {
			var fields = [],
				field,
				x;
			
			if(this.object._class) {
				for(x=0; x<this.universe.index.classes[this.object._class].fields.length; x++) {
					field = this.universe.index.fields[this.universe.index.classes[this.object._class].fields[x]];
					if(field && field.attribute.display_size !== undefined && field.attribute.display_size < this.size) {
						fields.push(field.id);
						// fields.push(field);
					}
				}
			} else {
				field = Object.keys(this.object);
				for(x=0; x<field.length; x++) {
					if(this.universe.index.fields[field[x]] && field[x][0] !== "_" && field[x][0] !== "$" && typeof(field[x]) !== null) {
						// fields.push(this.universe.index.fields[field[x]]);
						fields.push(field[x]);
					}
				}
			}
			
			return fields;
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
	},
	"template": Vue.templified("components/display/statblock.html")
});
