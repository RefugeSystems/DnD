
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
	"computed": {
		"players": function() {
			var offline = [],
				online = [],
				player,
				i;

			for(i=0; i<this.universe.listing.player.length; i++) {
				player = this.universe.listing.player[i];
				if(player && !player.disabled && !player.is_disabled && !player.is_preview) {
					if(player.connections) {
						online.push(player);
					} else {
						offline.push(player);
					}
				}
			}

			offline.sort(rsSystem.utility.sortByName);
			online.sort(rsSystem.utility.sortByName);

			return online.concat(offline);
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
