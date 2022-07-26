/**
 *
 *
 * @class minigameHangman
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {UIProfile} profile
 * @param {Object} details
 */
rsSystem.component("minigameHangman", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {

	},
	"data": function () {
		var data = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.universe.$on("updated", this.updateRendering);
	},
	"methods": {
		"playTile": function(x, y, tile) {

		},
		"updateRendering": function(event) {
			if(event && this.details.minigame.id === event.id) {
				// TODO: Update
			}
		}
	},
	"beforeDestroy": function () {
		this.universe.$off("updated", this.updateRendering);
	},
	"template": Vue.templified("components/minigames/hangman.html")
});
