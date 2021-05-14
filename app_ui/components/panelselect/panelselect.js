
/**
 *
 *
 * @class rsPanelSelect
 * @constructor
 * @module Components
 * @param {Object} summary Provides the list of fields to display and the naming for them.
 * @param {Array} fields Provides an order to the fields to display.
 */
(function() {


	rsSystem.component("rsPanelSelect", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSShowdown,
			rsSystem.components.RSCore
		],
		"props": {
			"corpus": {
				"required": true,
				"type": Array
			},
			"summary": {
				"type": Object
			},
			"fields": {
				"type": Array
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
			"panelstyle": {
				"type": Function,
				"default": function(record) {
					return "";
				}
			},
			"paneltext": {
			},
			"state": {
				"type": Object
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
				Vue.set(this, "filtertext", text.toLowerCase());
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			this.update();
		},
		"methods": {
			"updateFilter": function(filter) {
				Vue.set(this, "filtertext", filter.toLowerCase());
			},
			"getPanelText": function(record) {
				if(typeof(this.paneltext) === "string") {
					return this.rsshowdown(this.paneltext, record);
				} else if(typeof(this.paneltext) === "function") {
					return this.paneltext(record);
				}

				return "";
			},
			"getStatLabel": function(record, stat) {
				if(stat) {
					if(this.summary[stat]) {
						return this.summary[stat];
					}
					return stat.capitalize();
				}
				return "";
			},
			"getStatValue": function(record, stat) {
				return record[stat];
			},
			"update": function() {
				for(var x=0; x<this.corpus.length; x++) {
					Vue.set(this.images, this.corpus[x].id, this.universe.indexes.image.index[this.corpus[x].profile || this.corpus[x].image]);
				}
				this.$forceUpdate();
			}
		},
		"beforeDestroy": function() {
			// this.index.$off("indexed", this.update);
		},
		"template": Vue.templified("components/panelselect.html")
	});
})();
