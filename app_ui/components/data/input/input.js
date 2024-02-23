/**
 *
 *
 * @class rsInput
 * @constructor
 * @module Components
 * @param {String} type
 * @param {Number} delay
 * @param {Object} [storage] To store and recover values
 * @param {String} [name] Required with storage for buffering
 */
rsSystem.component("rsInput", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"type": {
			"default": function() {
				return "";
			},
			"type": String
		},
		"placeholder": {
			"type": String,
			"default": ""
		},
		"value": {
		},
		"delay": {
			"type": Number,
			"default": 300
		},
		"storage": {
			"type": Object
		},
		"search": {
			"type": RSSearch
		},
		"name": {
			"type": String
		}
	},
	"watch": {
		"value": function(nV, oV) {
			// console.log("Input Value Change: ", oV, " -> ", nV);
			Vue.set(this, "buffer", nV);
		}
	},
	"computed": {
		
	},
	"data": function () {
		var data = {};

		data.buffer = this.value || "";
		data.timeout = null;
		data.update = 0;
		data.flagged = "fas fa-search";
		data.errored = "fa-solid fa-exclamation-triangle rs-darkyellow";

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"changed": function() {
			this.$emit("input", this.buffer);
			Vue.set(this, "flagged", "fas fa-search");
			this.timeout = null;
			this.update = 0;
		},
		"clearFilter": function() {
			Vue.set(this, "buffer", "");
			this.$emit("input", this.buffer);
		},
		"process": function() {
			if(this.delay) {
				if(Date.now() > this.update) {
					this.changed();
				} else {
					this.timeout = setTimeout(this.process, this.delay);
				}
			} else {
				this.changed();
			}
		},
		"press": function(event) {
			this.update = Date.now();
			if(event.key === "Enter") {
				if(this.timeout) {
					clearTimeout(this.timeout);
				}
				this.changed();
			} else if(event.key === "Escape") {
				this.clearFilter();
			} else {
				if(this.timeout === null && this.delay) {
					this.timeout = setTimeout(this.process, this.delay);
					Vue.set(this, "flagged", "fas fa-spinner fa-pulse");
				}
			}
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/data/input.html")
});