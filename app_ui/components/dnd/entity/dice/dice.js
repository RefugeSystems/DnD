
/**
 *
 *
 * @class dndEntityDice
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityDice", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"data": function() {
		var data = {};

		data.rollable = [{
			"icon": "fas fa-dice-d4",
			"multiple": 1,
			"range": 4
		}, {
			"icon": "fas fa-dice-d6",
			"multiple": 1,
			"range": 6
		}, {
			"icon": "fas fa-dice-d8",
			"multiple": 1,
			"range": 8
		}, {
			"icon": "fas fa-dice-d10",
			"multiple": 1,
			"range": 10
		}, {
			"icon": "fas fa-dice-d12",
			"multiple": 1,
			"range": 12
		}, {
			"icon": "fas fa-dice-d20",
			"multiple": 1,
			"range": 20
		}, {
			"icon": "fad fa-dice-d10",
			"multiple": 1,
			"range": 100
		}];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(!this.storage.sum) {
			Vue.set(this.storage, "sum", 0);
		}
		if(!this.storage.results) {
			Vue.set(this.storage, "results", []);
		}
		if(!this.storage.count) {
			Vue.set(this.storage, "count", {});
		}
	},
	"methods": {
		"roll": function(roll) {
			var result = {};
			result.value = Random.integer(roll.range, 1) * roll.multiple;
			result.date = (new Date()).toString();
			result.time = Date.now();
			result.dice = roll.icon;
			Vue.set(this.storage, "sum", (this.storage.sum || 0) + result.value);
			Vue.set(this.storage.count, roll.icon, (this.storage.count[roll.icon] || 0) + 1);
			if(!this.storage.results) {
				Vue.set(this.storage, "results", []);
			}
			this.storage.results.unshift(result);
		},
		"dismiss": function(index, result) {
			if(this.storage.results) {
				Vue.set(this.storage, "sum", this.storage.sum - (this.storage.results[index].value || 0));
				Vue.set(this.storage.count, result.dice, (this.storage.count[result.dice] || 0) - 1);
				this.storage.results.splice(index, 1);
			}
		},
		"clear": function() {
			if(this.storage.results) {
				Vue.set(this.storage, "count", {});
				Vue.set(this.storage, "sum", 0);
				this.storage.results.splice(0);
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/dice.html")
});
