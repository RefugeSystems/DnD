
/**
 *
 *
 * @class DNDMasterScreen
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMasterScreen", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {},
			buffer,
			i;

		data.tracking = {};
		data.tracking.player = {};
		for(i=0; i<this.universe.listing.player.length; i++) {
			data.tracking.player[this.universe.listing.player[i].id] = this.universe.listing.player[i].connections || 0;
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
		this.universe.$on("player-disconnected", this.playerDisconnected);
		this.universe.$on("player-connected", this.playerConnected);
	},
	"methods": {
		"playerDisconnected": function(event) {
			console.log("Disconnect: ", event);
		},
		"playerConnected": function(event) {
			console.log("Connect: ", event);
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/master/screen.html")
});
