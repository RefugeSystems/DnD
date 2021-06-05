
/**
 *
 *
 * @class panelSelect
 * @constructor
 * @module Components
 * @param {Object} summary Provides the list of fields to display and the naming for them.
 * @param {Array} fields Provides an order to the fields to display.
 */
(function() {


	rsSystem.component("panelSelect", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSShowdown
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			},
			"corpus": {
				"required": true,
				"type": Array
			},
			"fields": {
				"type": Array,
				"default": function() {
					return [];
				}
			},
			"placeholder": {
				"type": String,
				"default": "Filter Items..."
			},
			"panel_style": {
				"type": Function,
				"default": function(record) {
					return "";
				}
			},
			"profile": {
				"type": Object
			},
			"limit": {
				"type": Number
			},
			"fmarking": {
				"type": String
			},
			"empties": {
				"type": Boolean
			},
			"descriptionless": {
				"type": Boolean
			},
			"flush": {
				"type": Number
			},
			"image": {
				"type": Boolean
			},
			"current": {
			}
		},
		"computed": {
			"fill": function() {
				var fill = [],
					x;
					
				if(this.flush) {
					for(x=0; x<this.flush; x++) {
						fill.push({});
					}
				}
				return fill;
			}
		},
		"data": function() {
			var data = {};

			data.filtertext = "";
			data.filter = "";
			data.images = {};
			

			return data;
		},
		"watch": {
			"filter": function(text) {
				var filtering = text.toLowerCase();
				if(this.filtertext !== filtering) {
					Vue.set(this, "filtertext", filtering);
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			
		},
		"methods": {
			"panelClass": function(record) {
				if(this.isCurrent(record)) {
					return "panel-current";
				}
				return "";
			},
			"isCurrent": function(record) {
				if(!this.current) {
					return false;
				}
				
				if(this.current instanceof Array) {
					return this.current.indexOf(record) !== -1 || this.current.indexOf(record.id) !== -1;
				}
				
				return this.current == record || this.current.id == record.id || this.current == record.id;
			},
			"isDisplayed": function(record) {
				if(this.isCurrent(record) && (this.filtertext === "current".substring(0,this.filtertext.length) ||
						this.filtertext === "selected".substring(0,this.filtertext.length) ||
						this.filtertext === "mine".substring(0,this.filtertext.length) ||
						this.filtertext === "my".substring(0,this.filtertext.length) ||
						this.filtertext === "active".substring(0,this.filtertext.length))) {
					return true;
				}
				return !this.filtertext || (record._search && record._search.indexOf(this.filtertext) !== -1);
			},
			"selected": function(record) {
				this.$emit("selected", record);
			}
		},
		"beforeDestroy": function() {
			// this.index.$off("indexed", this.update);
		},
		"template": Vue.templified("components/selection/panelselect.html")
	});
})();
