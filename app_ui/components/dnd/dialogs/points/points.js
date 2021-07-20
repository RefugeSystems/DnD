/**
 *
 *
 * @class dndDialogPoints
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {Object} details
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogPoints", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function () {
				return {};
			}
		}
	},
	"computed": {
	},
	"data": function() {
		var data = {};
		
		

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
	},
	"methods": {
		"givePoints": function(type, amount) {
			this.universe.send("point:give", {
				"entity": this.details.entity.id || this.details.entity,
				"type": type,
				"amount": amount
			});
		}
	},
	"beforeDestroy": function () {
		this.universe.$off("action:status", this.receiveStatus);
		this.universe.$off("roll", this.receiveRoll);
	},
	"template": Vue.templified("components/dnd/dialogs/roll.html")
});
