
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
			"fill": {
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
			"fmarking": {
				"type": String
			},
			"empties": {
				"type": Boolean
			},
			"descriptionless": {
				"type": Boolean
			},
			"image": {
				"type": Boolean
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
