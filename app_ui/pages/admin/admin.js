/**
 * 
 * 
 * @class RSAdmin
 * @constructor
 * @module Pages
 */
rsSystem.component("RSAdmin", {
	"inherit": true,
	"mixins": [],
	"props": {
		"universe": {
			"type": Object,
			"default": function() {
				return rsSystem.universe;
			}
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"player": {
			"type": Object
		}
	},
	"computed": {
		"results": function() {
			var results = [],
				result;
			if(this.storage.results) {
				for(result in this.storage.results) {
					results.push(this.storage.results[result]);
				}
			}
			results.sort(this.sortByStart);
			return results;
		}
	},
	"data": function() {
		var data = {};

		data.storage = localStorage.getItem("systemadminhistory");
		if(data.storage) {
			data.storage = JSON.parse(data.storage);
		} else {
			data.storage = {};
		}

		data.waiting = false;

		return data;
	},
	"watch": {
		"storage": {
			"deep": true,
			"handler": function(nV, oV) {
				// console.log(_p(nV));
				localStorage.setItem("systemadminhistory", JSON.stringify(this.storage));
			}
		}
	},
	"mounted": function() {
		rsSystem.register(this);
		if(typeof(this.storage.code) !== "string") {
			Vue.set(this.storage, "code", "");
		}
		if(typeof(this.storage.results) !== "object") {
			Vue.set(this.storage, "results", {});
		}

		this.universe.$on("universe:script:result", this.receiveResults);
		this.$refs.container.onkeyup = (event) => {
			if(event.key === "r" && event.ctrlKey) {
				event.stopPropagation();
				event.preventDefault();
				this.sendCommand(this.storage.code);
			}
		};
		this.$refs.container.onkeydown = (event) => {
			if(event.key === "r" && event.ctrlKey) {
				event.stopPropagation();
				event.preventDefault();
			}
		};
		this.$refs.container.onkeypress = (event) => {
			if(event.key === "r" && event.ctrlKey) {
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"sendCommand": function(code) {
			if(!this.waiting) {
				Vue.set(this, "waiting", true);
				this.universe.send("universe:script", {
					"code": code
				});
			}
		},
		"dismissWait": function() {
			Vue.set(this, "waiting", false);
		},
		"receiveResults": function(event) {
			Vue.set(this, "waiting", false);
			Vue.set(this.storage.results, event.start, event);
		},
		"getMessage": function(result) {
			if(typeof(result.returned) === "string") {
				return "Result: " + result.returned;
			} else {
				return result.message;
			}
		},
		"dismissResults": function() {
			for(var time in this.storage.results) {
				Vue.delete(this.storage.results, time);
			}
		},
		/**
		 * 
		 * TODO: This relies on a hack for double clicking. Something is restoring the underlying value ater one click
		 * before the bus event cause the set. Double clicking gets around this. While useful to require a double click,
		 * this relies on really shitty async abuse.
		 * @method restoreResult
		 * @param {Object} result 
		 */
		"restoreResult": function(result) {
			this.storage.code = result.code;
			rsSystem.EventBus.$emit("noun-sync");
		},
		"dismissResult": function(result) {
			Vue.delete(this.storage.results, result.start);
		},
		"sortByStart": function(a, b) {
			if(a.start < b.start) {
				return 1;
			} else if(a.start > b.start) {
				return -1;
			}
			return 0;
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("universe:script:result", this.receiveResults);
	},
	"template": Vue.templified("pages/admin.html")
});
