
/**
 *
 *
 * @class dndChronicleReadoutDamage
 * @constructor
 * @module Components
 */
rsSystem.component("dndChronicleReadoutDamage", {
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"occurred": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"skill": function() {
			return this.universe.index.skill[this.occurred.data.skill];
		},
		"entity": function() {
			return this.universe.index.entity[this.occurred.data.entity];
		},
		"source": function() {
			return this.universe.index.entity[this.occurred.data.source];
		},
		"target": function() {
			return this.universe.index.entity[this.occurred.data.target];
		},
		"channel": function() {
			if(this.occurred.data.channel) {
				return this.universe.getObject(this.occurred.data.channel);
			}
			return null;
		},
		"classing": function() {
			if(this.occurred.data.critical) {
				return "critical success";
			} else if(this.occurred.data.failure) {
				return "critical failure";
			}

			if(this.occurred.data.dice && this.occurred.data.dice.d20) {
				if(this.occurred.data.dice.d20[0] === 1) {
					return "critical failure";
				} else if(this.occurred.data.dice.d20[0] === 20) {
					return "critical success";
				}
			}

			if(this.occurred.data.succeeded === true) {
				return "success";
			} else if(this.occurred.data.succeeded === false) {
				return "failure";
			}

			if(this.occurred.data.attack && this.target) {
				if(!this.target.armor || this.target.armor < this.occurred.data.attack) {
					return "success";
				} else {
					return "failure";
				}
			}

			return "";
		},
		"damages": function() {
			var damages = [],
				keys,
				i;

			if(this.occurred.data.damage) {
				keys = Object.keys(this.occurred.data.damage);
				this.universe.transcribeInto(keys, damages);
			}

			return damages;
		},
		"resists": function() {
			var resists = [],
				keys,
				i;

			if(this.occurred.data.resist) {
				keys = Object.keys(this.occurred.data.resist);
				this.universe.transcribeInto(keys, resists);
			}

			return resists;
		}
	},
	"data": function() {
		var data = {};

		if(this.occurred.data.form) {
			data.fields = Object.keys(this.occurred.data.form);
			data.form = this.occurred.data.form;
		} else {
			data.fields = [];
			data.form = {};
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"getNet": function(damage) {
			if(this.occurred.data.damage) {
				if(this.occurred.data.resist) {
					return Math.max(this.occurred.data.damage[damage.id] - (this.occurred.data.resist[damage.id] || 0), 0);
				}
				return this.occurred.data.damage[damage.id];
			}
			return 0;
		},
		"getKeyedObjectString": function(object) {
			var result = "Damage:",
				keyed,
				key;
			for(key in object) {
				keyed = this.universe.getObject(key);
				if(keyed) {
					result += "\r\n" + keyed.name + ": " + object[key];
				} else {
					result += "\r\n" + key + ": " + object[key];
				}
			}
			return result;
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
			console.log(this);
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/chronicle/renders/damage.html")
});
