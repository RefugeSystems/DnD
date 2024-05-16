
/**
 *
 *
 * @class dndChronicleReadoutCollection
 * @constructor
 * @module Components
 */
rsSystem.component("dndChronicleReadoutCollection", {
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
		// Note: Index entities and activities and account for entities not having the skill
		"entities": function() {
			var entities = [],
				entity,
				i;

			if(this.occurred.entities && this.occurred.entities.length) {
				for(i=0; i<this.occurred.entities.length; i++) {
					entity = this.universe.get(this.occurred.entities[i]);
					if(entity) {
						entities.push(entity);
					}
				}
			}

			return entities;
		},
		"skill": function() {
			return this.universe.get(this.occurred.skill);
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
		"classResult": function() {
			return this.occurred.total<=this.occurred.range.low?"rs-light-red":(this.occurred.total<=this.occurred.range.med?"rs-light-yellow":"rs-light-green");
		},
		"getBonus": function(entity) {
			if(this.skill) {
				var bonus = entity.skill_check[this.skill.id] || 0;
				if(bonus > 0) {
					return "+" + bonus;
				}
				return bonus;
			}
			return 0;
		},
		"getName": function(id) {
			id = this.universe.get(id);
			if(id) {
				return id.name;
			}
			return "[Unknown]";
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
	"template": Vue.templified("components/dnd/master/chronicle/renders/collection.html")
});
