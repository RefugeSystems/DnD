
/**
 *
 *
 * @class dndEntityActions
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityActions", {
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
	"computed": {
		"isVisible": function() {
			var skirmish,
				i;

			if(this.entity.hp <= 0) {
				return false;
			}

			if(this.widget.attribute.show_non_combat) {
				return true;
			}
			
			for(i=0; i<this.universe.listing.skirmish.length; i++) {
				skirmish = this.universe.listing.skirmish[i];
				if(rsSystem.utility.isValid(skirmish) && (skirmish.active || skirmish.is_active)) {
					return true;
				}
			}
			return false;
		}
	},
	"data": function() {
		var data = {};

		data.core = ["main", "movement", "bonus"];
		data.oot = ["reaction"];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {

	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/actions.html")
});
