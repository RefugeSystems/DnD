
/**
 *
 *
 * @class dndChronicleReadoutRoll
 * @constructor
 * @module Components
 */
rsSystem.component("dndChronicleReadoutRoll", {
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

			return "";
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"joinRolls": function(rolls) {
			if(rolls) {
				return rolls.join(", ");
			}
			return "";
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/chronicle/renders/roll.html")
});
