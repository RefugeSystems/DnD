
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
				cfields,
				classed,
				field,
				x;

			if(this.object.concealed && this.size < 150) {
				return fields;
			} else if(this.object.must_know) {
				// TODO: Implement "Known" filtering
			}
			
			if(this.object._class) {
				classed = this.universe.index.classes[this.object._class];
				if(classed.attribute && (cfields = classed.attribute["info_" + this.size] || classed.attribute.info_all)) {
					for(x=0; x<cfields.length; x++) {
						field = this.universe.index.fields[cfields[x]];
						if(field) {
							fields.push(field);
						}
					}
				} else {
					cfields = classed.fields;
					for(x=0; x<cfields.length; x++) {
						field = this.universe.index.fields[classed.fields[x]];
						if(field && ((this.size >= 100 && field.attribute.displayed !== false) || (field.attribute.display_size !== undefined && field.attribute.display_size < this.size))) {
							// fields.push(field.id);
							fields.push(field);
						}
					}
				}
			} else {
				field = Object.keys(this.object);
				for(x=0; x<field.length; x++) {
					if(this.universe.index.fields[field[x]] && field[x][0] !== "_" && field[x][0] !== "$" && typeof(field[x]) !== null) {
						fields.push(this.universe.index.fields[field[x]]);
						// fields.push(field[x]);
					}
				}
			}

			fields.sort(rsSystem.utility.sortByID);
			// fields.sort(rsSystem.utility.sortData);
			
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
