
/**
 *
 *
 * @class dndMasterPlayerList
 * @constructor
 * @module Components
 */
rsSystem.component("dndMasterPlayers", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"object": {
			"requried": true,
			"type": Object
		},
		"tracking": {
			"required": true,
			"type": Object
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
		"displayed": function(player) {
			if(player.id.indexOf(":preview:") === -1) {
				return true;
			}
			return false;
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/players.html")
});
