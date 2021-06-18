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
		"rolling": function() {
			var rolling = [],
				roll,
				keys,
				i;

			if(this.details.rolling && this.details.rolling) {
				keys = Object.keys(this.details.rolling);
				for(i=0; i<keys.length; i++) {
					roll = this.universe.getObject(keys[i]);
					if(!roll) {
						roll = keys[i];
					}
					rolling.push({
						"key": roll,
						"formula": this.details.rolling[keys[i]],
						"computed": ""
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
						targets.uniquely(entity);
					}
				}
			}

			for(i=0; i<this.universe.listing.party.length; i++) {
				party = this.universe.listing.party[i];
				if(party && party.entities && party.entities.indexOf(this.entity.id) !== -1) {
					for(j=0; j<party.entities.length; j++) {
						entity = this.universe.index.entity[party.entities[j]];
						if(entity) {
							targets.uniquely(entity);
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
			skill,
			roll,
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
		data.suffixed = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th"];
		data.die[6].icon = "fad fa-dice-d10";
		data.statusResponse = null;
		data.spellLevel = null;
		data.tracking = null;
		data.active = null;
		data.target = null;
		data.check = null;
		data.skillCheck = {};
		data.waiting = {};
		data.seen = [];
		data.warn = 0;

		if(typeof(this.details.entity) === "string") {
			data.entity = this.universe.index.entity[this.details.entity];
		} else if(typeof(this.details.entity) === "object") {
			data.entity = this.details.entity;
		} else {
			data.entity = null;
		}

		data.skills = [];
		if(this.details.skill) {
			roll = {
				"computed": "",
				"formula": "1d20",
				"dice_rolls": {},
				"skill": this.details.skill,
				"key": this.details.skill
			};
			if(data.entity) {
				roll.formula += " + " + data.entity.skill_check[roll.skill.id];
			}
			data.skills.push(roll);
		} else if(this.details.action && this.details.action.skills && this.details.action.skills.length) {
			for(i=0; i<this.details.action.skills.length; i++) {
				skill = this.universe.index.skill[this.details.action.skills[i]];
				if(skill) {
					roll = {
						"computed": "",
						"formula": "1d20",
						"dice_rolls": {},
						"skill": skill,
						"key": skill
					};
					if(data.entity && data.entity.skill_check[roll.skill.id]) {
						roll.formula += " + " + data.entity.skill_check[roll.skill.id];
					}
					data.skills.push(roll);
				} else {
					console.warn("Unknown Skill: ", this.details.action.skill[i]);
				}
			}
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("action:status", this.receiveStatus);
		this.universe.$on("roll", this.receiveRoll);
		if(this.profile.auto_roll) {
			this.autoRoll();
		}
		if(!this.storage.rolls) {
			this.storage.rolls = [];
		}
	},
	"methods": {
		"getCheckName": function() {
			if(this.details.rolling && this.details.check_name) {
				return this.details.check_name;
			} else if(this.details.action) {
				return this.details.action.name + " Check";
			} else {
				return "Check Skill";
			}
		},
		"getFinishName": function() {
			if(this.details.rolling && this.details.finish_name) {
				return this.details.finish_name;
			} else if(this.details.action) {
				return "Perform " + this.details.action.name;
			} else {
				return "Perform Action";
			}
		},
		"getRollName": function() {
			if(this.details.rolling && this.details.rolling.name) {
				return this.details.rolling.name;
			} else if(this.details.action) {
				return this.details.action.name;
			} else {
				return "Stat Roll";
			}
		},
		"dismissStatus": function() {
			Vue.set(this, "statusResponse", null);
		},
		"receiveStatus": function(event) {
			console.log("Receive Status: ", event);
			if(event.entity === this.entity.id) {
				Vue.set(this, "statusResponse", event.message);
			}
		},
		"receiveRoll": function(event) {
			var footnote;
			if(event.dice_rolls.vantage) {
				footnote = event.dice_rolls.vantage[0] + " (" + event.dice_rolls.vantage[1] + ")";
			}
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
				Vue.set(this.waiting[event.callback_id], "computed", event.computed);
				Vue.set(this.waiting[event.callback_id], "dice_rolls", event.dice_rolls);
				this.storage.rolls.unshift(event);
				if(this.waiting[event.callback_id].skill) {
					event.name = this.waiting[event.callback_id].skill.name;
					if(footnote) {
						event.footnote = footnote;
					}
					if(this.storage.rolls.length > 20) {
						this.storage.rolls.splice(20);
					}
				}
				delete(this.waiting[event.callback_id]);
				this.$forceUpdate();
			}
		},
		"receiveFlag": function(event) {

		},
		"clearHistory": function() {
			console.log("Clearing");
			this.storage.rolls.splice(0);
			this.$forceUpdate();
		},
		"selectTarget": function(target){
			Vue.set(this, "target", target);
		},
		"clearTarget": function(){
			Vue.set(this, "target", null);
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
					if(!roll.computed) {
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
			if(this.skills.length === 1) {
				this.rollSkill(this.skills[0]);
			}
		},
		"clearSkillRolls": function(skip) {
			var check,
				dice,
				i,
				j;

			for(i=0; i<this.skills.length; i++) {
				check = this.skills[i];
				if(skip !== check) {
					Vue.set(check, "computed", "");
					if(check.dice_rolls) {
						dice = Object.keys(check.dice_rolls);
						for(j=0; j<dice.length; j++) {
							check.dice_rolls[dice[j]].splice(0);
						}
					}
				}
			}
			this.$forceUpdate();
		},
		"rollSkill": function(check, advantage) {
			if(!check.computed) {
				var cb = Random.identifier("roll", 10, 32);
				this.setTracking(check);
				Vue.set(this.waiting, cb, check);
				this.universe.send("roll:object", {
					"id": this.entity.id,
					"formula": check.formula,
					"advantage": advantage,
					"cbid": cb
				});
				/*
				var roll = Random.integer(20,1);
				this.clearSkillRolls(check);
				Vue.set(check, "computed", roll + (this.entity.skill_check[check.skill.id] || 0));
				if(!check.dice_rolls) {
					Vue.set(check, "dice_rolls", {});
				}
				if(!check.dice_rolls.d20) {
					Vue.set(check.dice_rolls, "d20", []);
				} else {
					check.dice_rolls.d20.splice(0);
				}
				check.dice_rolls.d20.push(roll);
				this.$forceUpdate();
				*/
			}
		},
		"sendSkill": function(check) {
			Vue.set(this, "check", check);
			var sending = {};
			sending.result = check.computed;
			sending.entity = this.entity.id;
			sending.name = check.skill.name;
			sending.skill = check.skill.id;
			sending.dice = check.dice_rolls;
			if(this.details.action) {
				sending.action = this.details.action.id;
			}
			if(this.target) {
				sending.target = this.target.id;
			}
			this.universe.send("action:check", sending);
			if(this.details.closeAfterCheck) {
				this.closeDialog();
			}
		},
		"clearSkill": function(skill) {
			var dice,
				j;

			if(skill) {
				Vue.set(skill, "computed", "");
				if(skill.dice_rolls) {
					dice = Object.keys(skill.dice_rolls);
					for(j=0; j<dice.length; j++) {
						skill.dice_rolls[dice[j]].splice(0);
					}
				}
			} else{
				Vue.set(this, "check", null);
			}
		},
		"clearRolls": function() {
			if(this.rolling.length) {
				var i;
				for(i=0; i<this.rolling.length; i++) {
					Vue.set(this.rolling[i], "computed", "");
					Vue.set(this.rolling[i], "dice_rolls", {});
				}
				this.$forceUpdate();
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
			this.$forceUpdate();
		},
		"removeRoll": function(roll, die, index) {
			var rolled = roll.dice_rolls[die][index],
				store;

			if(roll.computed) {
				Vue.set(roll, "computed", roll.computed - roll.dice_rolls[die][index]);
			}
			roll.dice_rolls[die].splice(index, 1);

			store = {
				"computed": rolled,
				"formula": "",
				"dice_rolls": {},
				"manual": {},
				"name": "Removed " + this.suffixed[index] + " " + roll.key.name + " " + die,
				"title": "Removed a " + die + " roll from the " + roll.key.name + " rolls"
			};
			this.storage.rolls.unshift(store);
			this.$forceUpdate();
		},
		"reroll": function(roll, die, index) {
			var rolled = Random.integer(this.range[die], 1),
				store,
				save;

			save = roll.dice_rolls[die][index];
			store = roll.computed - save;
			Vue.set(roll.dice_rolls[die], index, rolled);
			Vue.set(roll, "computed", store + rolled);

			store = {
				"computed": rolled,
				"formula": "",
				"dice_rolls": {},
				"manual": {},
				"name": "Rerolling " + save,
				"title": "Reroll of the " + this.suffixed[index] + " of the listed " + die + " rolls"
			};

			Vue.set(this, "active", store);
			this.storage.rolls.unshift(store);
			this.$forceUpdate();
		},
		"rollDice": function(die) {
			var rolled = Random.integer(this.range[die.label], 1),
				store;
			console.log(" > Roll[" + die.label + "]: " + rolled, this.tracking, die);
			if(this.tracking) {
				if(!this.tracking.dice_rolls) {
					Vue.set(this.tracking, "dice_rolls", {});
				}
				store = this.tracking;
			} else if(this.active) {
				if(!this.active.dice_rolls) {
					Vue.set(this.active, "dice_rolls", {});
				}
				store = this.active;
			} else {
				store = {
					"computed": 0,
					"formula": "",
					"dice_rolls": {},
					"manual": {}
				};
				Vue.set(this, "active", store);
				this.storage.rolls.unshift(store);
			}
			Vue.set(store, "computed", (store.computed || 0) + rolled);
			if(!store.dice_rolls[die.label]) {
				Vue.set(store.dice_rolls, die.label, []);
			}
			store.dice_rolls[die.label].push(rolled);
			this.$forceUpdate();
		},
		"getResultState": function() {
			var i;
			for(i=0; i<this.rolling.length; i++) {
				if(!this.rolling[i].computed && this.rolling[i].computed !== 0) {
					return -1;
				}
			}

			if((this.skills && this.check === null && this.warn === 0) || (this.targets && this.target === null && this.warn <= 1)) {
				return 2;
			} else {
				return 0;
			}
		},
		"getSendResultIcon": function() {
			var i;
			for(i=0; i<this.rolling.length; i++) {
				if(!this.rolling[i].computed && this.rolling[i].computed !== 0) {
					return "fas fa-exclamation-triangle rs-lightred";
				}
			}

			if(this.skills && this.check === null && this.warn === 0) {
				return "fas fa-exclamation-triangle rs-lightyellow";
			} else if(this.targets && this.target === null && this.warn <= 1) {
				return "fas fa-exclamation-triangle rs-lightyellow";
			} else if(this.action) {
				return this.action.icon || "fas fa-dice";
			} else {
				return "fas fa-dice";
			}
		},
		"sendResults": function() {
			var state = this.getResultState(),
				perform,
				i;

			if(state > 0 && this.warn < state) {
				Vue.set(this, "warn", this.warn + 1);
			} else if(state < 0) {
				console.error("Missing result data: ", _p(this.rolling));
			} else {
				perform = {};
				if(this.details.action) {
					perform.action = this.details.action.id;
					perform.name = this.details.action.name;
				}
				if(this.details.using) {
					perform.using = this.details.using.id;
				}
				if(this.target) {
					perform.target = this.target.id;
				}
				if(this.check) {
					perform.check = this.check;
				}
				if(this.statusResponse) {
					perform.status = this.statusResponse;
				}
				perform.result = {};
				for(i=0; i<this.rolling.length; i++) {
					perform.result[this.rolling[i].key.id || this.rolling[i].key] = this.rolling[i].computed;
				}
				this.universe.send("action:perform", perform);
				if(this.details.closeAfterAction) {
					this.closeDialog();
				}
			}
		},
		"JSON": function(obj) {
			try {
				return JSON.stringify(obj.dice_rolls || obj.dice, null, 4);
			} catch(exception) {
				console.error("Error: ", obj, exception);
			}
		}
	},
	"beforeDestroy": function () {
		this.universe.$off("action:status", this.receiveStatus);
		this.universe.$off("roll", this.receiveRoll);
	},
	"template": Vue.templified("components/dnd/dialogs/roll.html")
});
