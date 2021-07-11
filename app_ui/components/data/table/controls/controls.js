
/**
 * 
 * 
 * @class rsTableControls
 * @constructor
 * @module Components
 * @zindex 1
 * @param {Object} storage State storage for controling the table
 * @param {Array} source All records currently being accessed
 * @param {Array} filtered All records matching the current filtering applied to the table
 * @param {Array} corpus The currently visible records
 */

/**
 * 
 * @event info
 * @param {Object} record
 */
rsSystem.component("rsTableControls", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"source": {
			"required": false,
			"type": Array
		},
		"filtered": {
			"required": false,
			"type": Array
		},
		"corpus": {
			"required": false,
			"type": Array
		},
		"controls": {
			"required": false,
			"type": Array
		},
		"storage": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"selected": function() {
			if(this.storage && this.storage.selected) {
				return Object.keys(this.storage.selected).length;
			}
			return 0;
		},
		"placeholder": function() {
			return "Filter " + (this.storage.label || "Table Data") + "...";
		}
	},
	"watch": {

	},
	"data": function() {
		var data = {};
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.storage && !this.storage.selected) {
			Vue.set(this.storage, "selected", {});
		}
		if(this.storage && typeof(this.storage.filter) !== "string") {
			Vue.set(this.storage, "filter", "");
		}
	},
	"methods": {
		"clearSelection": function() {
			var keys = Object.keys(this.storage.selected),
				i;

			for(i=0; i<keys.length; i++) {
				Vue.delete(this.storage.selected, keys[i]);
			}
			this.$emit("deselected");
		},
		"clearFilter": function() {
			Vue.set(this.storage, "filter", "");
		},
		"allSelection": function() {
			for(var i=0; i<this.corpus.length; i++) {
				Vue.set(this.storage.selected, this.corpus[i].id, true);
			}
			this.$emit("selected");
		},
		"infoSelection": function() {
			this.$emit("info", Object.keys(this.storage.selected)[0]);
		}
	},
	"beforeDestroy": function() {

	},
	"template": Vue.templified("components/data/table/controls.html")
});
