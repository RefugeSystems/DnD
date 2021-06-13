/**
 *
 *
 * @class dndDialogRoll
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogRoll", {
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
		"entity": function() {
			var entity = this.universe.index.entity[this.details.entity];
			return entity || {};
		}
	},
	"data": function() {
		var data = {},
			dice = [],
			i;
		
		dice = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
		data.die = [];
		for(i=0; i<dice.length; i++) {
			data.die.push({
				"id": dice[i],
				"name": dice[i],
				"icon": "fas fa-dice-" + dice[i],
				"formula": "1" + dice[i]
			});
		}
		data.die[6].icon = "fad fa-dice-d10";
		data.seen = [];
		data.active = null;
		data.waiting = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("roll", this.receiveRoll);
		if(this.profile.auto_roll) {
			
		}
		if(!this.storage.rolls) {
			this.storage.rolls = [];
		}
	},
	"methods": {
		"receiveRoll": function(event) {
			console.log("Received Roll: ", _p(event));
			if(this.waiting[event.callback_id]) {
				event.delay = Date.now() - this.waiting[event.callback_id];
				delete(this.waiting[event.callback_id]);
				this.storage.rolls.push(event);
				if(this.storage.rolls.length > 20) {
					this.storage.rolls.splice(20);
				}
				this.$forceUpdate();
			}
		},
		"roll": function(input) {
			var cb = Random.identifier("cb", 10, 32);
			Vue.set(this.waiting, cb, Date.now());

			this.universe.send("roll:object", {
				"id": this.entity.id,
				"formula": input,
				"cbid": cb
			});
		},
		"dismiss": function(index) {
			this.storage.rolls.splice(index, 1);
		},
		"rollDice": function() {
			
		},
		"clear": function() {

		}
	},
	"beforeDestroy": function () {
		this.universe.$off("roll", this.receiveRoll);
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/roll.html")
});
