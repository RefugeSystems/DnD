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
		},
		"rolling": function() {
			var rolling = [],
				roll,
				keys,
				i;

			if(this.details.rolling && this.details.rolling.specs) {
				keys = Object.keys(this.details.rolling.specs);
				for(i=0; i<keys.length; i++) {
					roll = this.universe.getObject(keys[i]);
					if(!roll) {
						roll = keys[i];
					}
					rolling.push({
						"key": roll,
						"formula": this.details.rolling.specs[keys[i]],
						"result": ""
					});
				}
			}

			return rolling;
		},
		/**
		 * 
		 * Event of "dialog-open" with "dndDialogRoll" passed as the component.
		 * @event dialog-open:roll
		 * @param {String} [name] 
		 * @param {Object} [rolling] 
		 * @param {Object} [record] 
		 * @param {Array | Boolean} [target] 
		 */
		"targets": function() {
			var location = this.universe.index.location[this.entity.location],
				party,
				targets = [],
				entity,
				i,
				j;

			// TODO: Type filter on target type
			if(location && location.populace) {
				for(i=0; i<location.populace.length; i++) {
					entity = this.universe.index.entity[location.populace[i]];
					if(entity) {
						targets.push(entity);
					}
				}
			}

			for(i=0; i<this.universe.listing.party.length; i++) {
				party = this.universe.listing.party[i];
				if(party && party.entities && party.entities.indexOf(this.entity.id) !== -1) {
					for(j=0; j<party.entities.length; j++) {
						entity = party.entities[j];
						if(entity) {
							targets.push(entity);
						}
					}
				}
			}

			return targets;
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
				"formula": "1" + dice[i],
				"label": dice[i]
			});
		}
		data.range = {
			"d100": 100,
			"d20": 20,
			"d12": 12,
			"d10": 10,
			"d8": 8,
			"d6": 6,
			"d4": 4
		};
		data.die[6].icon = "fad fa-dice-d10";
		data.tracking = null;
		data.active = null;
		data.target = null;
		data.waiting = {};
		data.seen = [];

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
			if(typeof(this.waiting[event.callback_id]) === "number") {
				event.delay = Date.now() - this.waiting[event.callback_id];
				delete(this.waiting[event.callback_id]);
				this.storage.rolls.unshift(event);
				if(this.storage.rolls.length > 20) {
					this.storage.rolls.splice(20);
				}
				Vue.set(this, "active", event);
				this.$forceUpdate();
			} else if(typeof(this.waiting[event.callback_id]) === "object") {
				Vue.set(this.waiting[event.callback_id], "result", event.computed);
				delete(this.waiting[event.callback_id]);
				this.$forceUpdate();
			}
		},
		"selectTarget": function(target){
			Vue.set(this, "target", target);
		},
		"setTracking": function(roll) {
			Vue.set(this, "tracking", roll);
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
		"autoRoll": function() {
			if(this.rolling.length) {
				var roll,
					cb,
					i;

				for(i=0; i<this.rolling.length; i++) {
					roll = this.rolling[i];
					if(!roll.result) {
						cb = Random.identifier("roll", 10, 32);
						Vue.set(this.waiting, cb, roll);
						this.universe.send("roll:object", {
							"id": this.entity.id,
							"formula": roll.formula,
							"cbid": cb
						});
					}
				}
			}
		},
		"clearRolls": function() {
			if(this.rolling.length) {
				var i;
				for(i=0; i<this.rolling.length; i++) {
					Vue.set(this.rolling[i], "result", "");
				}
			}
		},
		"submitRoll": function() {

		},
		"dismiss": function(index) {
			this.storage.rolls.splice(index, 1);
			if(this.storage.rolls.length) {
				Vue.set(this, "active", this.storage.rolls[0]);
			} else {
				Vue.set(this, "active", null);
			}
		},
		"rollDice": function(die) {
			var rolled = Random.integer(this.range[die.label], 1);
			console.log(" > Roll[" + die + "]: " + rolled, this.tracking, die);
			if(this.tracking) {
				if(this.tracking.result) {
					Vue.set(this.tracking, "result", this.tracking.result + rolled);
				} else {
					Vue.set(this.tracking, "result", rolled);
				}
			} else if(this.active) {
				if(this.active.computed) {
					Vue.set(this.active, "computed", this.active.computed + rolled);
				} else {
					Vue.set(this.active, "computed", rolled);
				}
			} else {
				rolled = {
					"computed": rolled,
					"formula": "",
					"delay": "-",
					"manual": {}
				};
				Vue.set(this, "active", rolled);
				this.storage.rolls.unshift(rolled);
			}
		},
		"clear": function() {

		}
	},
	"beforeDestroy": function () {
		this.universe.$off("roll", this.receiveRoll);
	},
	"template": Vue.templified("components/dnd/dialogs/roll.html")
});
