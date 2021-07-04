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
			"default": "text",
			"type": String
		},
		"value": {
		},
		"delay": {
			"type": Number
		},
		"storage": {
			"type": Object
		},
		"name": {
			"type": String
		}
	},
	"computed": {
		
	},
	"data": function () {
		var data = {};

		data.buffer = this.value || "";
		data.timeout = null;
		data.update = 0;
		data.flagged = "";

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"changed": function() {
			this.$emit("input", this.buffer);
			if(this.flagged) {
				Vue.set(this, "flagged", "");
				this.timeout = null;
				this.update = 0;
			}
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
		"press": function() {
			this.update = Date.now();
			if(this.timeout === null && this.delay) {
				this.timeout = setTimeout(this.process, this.delay);
				Vue.set(this, "flagged", "fas fa-spinner fa-pulse");
			}
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/data/input.html")
});