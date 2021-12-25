
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
		"shown": {
			"default": false,
			"type": Boolean
		},
		"player": {
			"type": Object
		},
		"size": {
			"default": 5,
			"type": Number
		},
		"filterable": {
			"type": Boolean
		},
		"empties": {
			"type": Boolean
		},
		"marking": {
			"type": String
		}
	},
	"computed": {
		"isKnown": function() {
			var entity;

			if(!this.player) {
				return false;
			}
			if(this.player.gm && this.universe.master_info) {
				return true;
			}
			
			entity = this.universe.index.entity[this.player.attribute.playing_as];
			// return !this.player || (!this.player.gm && (!this.player.attribute || !(entity = this.universe.index.entity[this.player.attribute.playing_as]) || !entity.knowledges || (entity.knowledges.indexOf(this.object.must_know) === -1 && (!entity.knowledge_matrix || !entity.knowledge_matrix[this.object.id]))));
			if(typeof(this.object.must_know) === "string") {
				return entity.knowledges && entity.knowledges.indexOf(this.object.must_know) === -1;
			 } else if(typeof(this.object.must_know) === "number") {
				return entity.knowledge_matrix[this.object.id] && this.object.must_know < entity.knowledge_matrix[this.object.id].length;
			 } else {
				 return entity.knowledge_matrix[this.object.id] && entity.knowledge_matrix[this.object.id].length;
			 }
		},
		"fields": function() {
			var fields = [],
				cfields,
				classed,
				field,
				x;

			if(this.object.concealed && this.size <= 150) {
				return fields;
			} else if(this.object.must_know && !this.isKnown) {
				// TODO: Implement "Known" filtering
				return fields;
			}
			
			if(this.object._class) {
				classed = this.universe.index.classes[this.object._class];
				if(classed.attribute && (cfields = classed.attribute["info_" + this.size] || classed.attribute.info_all)) {
					for(x=0; x<cfields.length; x++) {
						field = this.universe.index.fields[cfields[x]];
						if(this.isVisible(field)) {
							fields.push(field);
						}
					}
				} else {
					cfields = classed.fields;
					for(x=0; x<cfields.length; x++) {
						field = this.universe.index.fields[classed.fields[x]];
						if(this.isVisible(field)) {
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
		},
		"filters": function() {
			var filters = this.filtering.split(","),
				i;
			for(i=0; i<filters.length; i++) {
				filters[i] = filters[i].trim().toLowerCase();
			}
			return filters;
		}
	},
	"data": function() {
		var data = {};

		data.filtering = "";
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"info": function(id) {
			rsSystem.EventBus.$emit("display-info", {
				"info": id
			});
		},
		"isVisible": function(field) {
			var filters,
				i;
			if(field && field.attribute && (!field.attribute || !field.attribute.private || this.shown) && field.attribute.displayed !== false && (!field.attribute.display_size || field.attribute.display_size <= this.size)) {
				if(this.filters.length && this.filters[0] !== "") {
					if(field._search) {
						for(i=0; i<this.filters.length; i++) {
							if(field._search.indexOf(this.filters[i]) !== -1) {
								return true;
							}
						}
					} else {
						return false;
					}
				} else {
					return true;
				}
			}
			return false;
			// return field && field.attribute && (!field.attribute || !field.attribute.private || this.shown) && field.attribute.displayed !== false && (!field.attribute.display_size || field.attribute.display_size <= this.size) && (!this.filtering || (field._search && field._search.indexOf(this.filtering) !== -1));
		}
	},
	"template": Vue.templified("components/display/statblock.html")
});
