
/**
 * Used to display large text blocks (Like a News Paper) to a dialog
 * for reading.
 * @class rsReader
 * @constructor
 * @module Components
 * @param {RSObject} details
 */
rsSystem.component("rsReader", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"entity": function() {
			return this.universe.get(this.details.entity);
		},
		"masthead": function() {
			if(this.details.source) {
				return this.rsshowdown(this.details.source.print_masthead || this.details.source.masthead, this.entity);
			}
			return "No Source";
		},
		"footer": function() {
			return this.rsshowdown(this.details.source.print_footer || this.details.source.footer, this.entity);
		},
		"columns": function() {
			var source = this.details.source.print_columns || this.details.source.columns,
				columns = [],
				i;

			if(source) {
				for(i=0; i<source.length; i++) {
					columns.push(this.rsshowdown(source[i], this.entity));
				}
			} else if(this.details.source.description) {
				columns.push(this.rsshowdown(this.details.source.description, this.entity));
			}

			return columns;
		}
	},
	"data": function() {
		var data = {};
		data.heading = this.details.source.print_heading || this.details.source.heading;
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		
	},
	"beforeDestroy": function() {
		
	},
	"template": Vue.templified("components/display/reader.html")
});
