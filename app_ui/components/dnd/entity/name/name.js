
/**
 *
 *
 * @class dndEntityName
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityName", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore,
		rsSystem.components.DNDCombatUtility
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
	"computed": {
		"combat": function() {
			return this.skirmish && this.skirmish.combat_turn === this.entity.id;
		},
		"leveling": function() {
			return this.entity.point_pool && this.entity.point_pool.level;
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
		"getLevelClasses": function() {
			var classes = "";

			if(this.leveling) {
				classes += "available ";
			}
			if(this.combat) {
				classes += "combat ";
			}

			return classes;
		},
		"name": function() {

		},
		"progressState": function() {
			if(this.combat) {
				this.endTurn();
			} else if(this.leveling) {
				this.levelUp();
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/name.html")
});
