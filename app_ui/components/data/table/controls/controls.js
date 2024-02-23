
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
		"additionalHeaders": {
			"type": Array
		},
		"source": {
			"type": Array
		},
		"filtered": {
			"type": Array
		},
		"corpus": {
			"type": Array
		},
		"controls": {
			"type": Array
		},
		"selections": {
			"type": Array
		},
		"search": {
			"type": RSSearch
		},
		"storage": {
			"type": Object
		}
	},
	"computed": {
		"selected": function() {
			if(this.storage && this.storage.selected) {
				var keys = Object.keys(this.storage.selected),
					selected = 0,
					i;

				for(i=0; i<keys.length; i++) {
					if(isNaN(this.storage.selected[keys[i]])) {
						selected++;
					} else {
						selected += this.storage.selected[keys[i]];
					}
				}
				
				return selected;
			}
			return 0;
		},
		"placeholder": function() {
			return "Filter " + (this.label || this.storage.label || "Table Data") + "...";
		},
		"selectedClasses": function() {
			if(this.storage && this.storage.filter === ":selected") {
				return "active";
			}
			return "";
		}
	},
	"watch": {

	},
	"data": function() {
		var data = {};
		data.flip = null;
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
		"configureTable": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "rsTableConfigure",
				"additional": this.additionalHeaders,
				"storage": this.storage,
				"source": this.source
			});
		},
		/**
		 * 
		 * @method exportCorpus
		 */
		"exportCorpus": function() {
			this.$emit("download");
		},
		"toggleSelected": function() {
			if(this.storage.filter === ":selected") {
				Vue.set(this.storage, "filter", this.flip || "");
			} else {
				Vue.set(this, "flip", this.storage.filter);
				Vue.set(this.storage, "filter", ":selected");
			}
		},
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
