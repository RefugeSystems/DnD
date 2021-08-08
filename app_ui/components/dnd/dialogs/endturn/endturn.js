/**
 * 
 * @class dndEndTurn
 * @constructor
 * @module Components
 * @param {Universe} universe
 * @param {Player} player
 * @param {Configuraiton} configuration
 * @param {UIProfile} profile
 * @param {Object} details
 * @param {String | Object} details.entity Source of the giving. Optional if the player is a Game Master.
 * @param {Function} details.finish Receives an Object that is the selected target if one is chosen
 */
rsSystem.component("dndEndTurn", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"entity": function() {
			if(typeof(this.details.entity) === "string") {
				return this.universe.index.entity[this.details.entity];
			}
			return this.details.entity;
		},
		"skirmish": function() {
			if(typeof(this.details.skirmish) === "string") {
				return this.universe.index.skirmish[this.details.skirmish];
			}
			return this.details.skirmish;
		},
		"remaining": function() {
			var remaining = [];
			if(this.entity.action_count.main) {
				remaining.push({
					"name": "Action",
					"count": this.entity.action_count.main
				});
			}
			if(this.entity.action_count.bonus) {
				remaining.push({
					"name": "Bonus Action",
					"count": this.entity.action_count.bonus
				});
			}
			if(this.entity.action_count.movement) {
				remaining.push({
					"name": "Movement",
					"count": this.entity.action_count.movement
				});
			}
			return remaining;
		}
	},
	"data": function () {
		var data = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"endTurn": function(entity) {
			if(this.entity && this.skirmish) {
				this.universe.send("skimish:turn:end", {
					"skirmish": this.skirmish.id,
					"entity": this.entity.id
				});
				this.closeDialog();
			} else {
				console.warn("Missing data to end turn: ", this);
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/endturn.html")
});