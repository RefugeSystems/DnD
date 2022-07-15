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
		"damageTypes": function() {
			var types = [],
				type,
				i;

			for(i=0; i<this.universe.listing.damage_type.length; i++) {
				type = this.universe.listing.damage_type[i];
				if(type && !type.disabled && !type.is_preview) {
					types.push(type);
				}
			}

			types.sort(rsSystem.utility.sortData);
			return types;
		},
		"rolling": function() {
			var rolling = [],
				roll,
				keys,
				i;

			if(this.details.rolling) {
				keys = Object.keys(this.details.rolling);
				for(i=0; i<keys.length; i++) {
					roll = this.universe.getObject(keys[i]);
					if(!roll) {
						roll = keys[i];
					}
					rolling.push({
						"key": roll,
						"formula": this.details.rolling[keys[i]],
						"ordering": roll.ordering,
						"computed": ""
					});
				}
			}

			rolling.sort(rsSystem.utility.sortData);
			return rolling;
		},
		"meeting": function() {
			var meet,
				i;

			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meet = this.universe.listing.meeting[i];
				if(meet && meet.is_active && !meet.disabled && !meet.is_preview) {
					return meet;
				}
			}

			return null;
		},
		"entities": function() {
			var entities = [];

			if(this.meeting) {
				this.universe.transcribeInto(this.meeting.entities, entities, "entity");
			}

			return entities;
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

			if(this.meeting && this.meeting.entities) {
				for(i=0; i<this.meeting.entities.length; i++) {
					entity = this.universe.index.entity[this.meeting.entities[i]];
					if(entity) {
						targets.uniquely(entity);
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
			keys,
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
		data.actionTitling = "";
		data.actionNote = "";
		data.statusResponse = null;
		data.spellLevel = this.details.spellLevel;
		data.negative = false;
		data.tracking = null;
		data.active = null;
		data.source = null;
		data.check = null;
		data.skillCheck = {};
		data.targeting = {};
		data.waiting = {};
		data.seen = [];
		data.warn = 0;

		if(typeof(data.spellLevel) === "string") {
			data.spellLevel = parseInt(data.spellLevel);
		}
		if(typeof(data.spellLevel) !== "number") {
			data.spellLevel = null;
		}

		if(typeof(this.details.target) === "string") {
			data.target = this.universe.index.entity[this.details.target];
		} else {
			data.target = this.details.target || null;
		}

		if(typeof(this.details.source) === "string") {
			data.source = this.universe.index.entity[this.details.source];
		} else {
			data.source = this.details.source || null;
		}

		if(typeof(this.details.entity) === "string") {
			data.entity = this.universe.index.entity[this.details.entity];
		} else if(typeof(this.details.entity) === "object") {
			data.entity = this.details.entity;
		} else {
			data.entity = null;
		}

		if(typeof(this.details.action) === "string") {
			Vue.set(this.details, "action", this.universe.getObject(this.details.action));
		}

		data.damages = [];
		data.resists = [];
		data.damageActive = {};
		if(this.details.damage) {
			keys = Object.keys(this.details.damage);
			for(i=0; i<keys.length; i++) {
				roll = this.universe.getObject(keys[i]);
				if(!roll) {
					roll = keys[i];
				}
				data.damageActive[roll.id] = true;
				if(this.details.action && (this.details.action.id === "action:damage:complete" || this.details.fill_damage)) {
					data.damages.push({
						"key": roll,
						"formula": this.details.damage[keys[i]],
						"ordering": roll.ordering,
						"computed": this.details.damage[keys[i]]
					});
				} else {
					data.damages.push({
						"key": roll,
						"formula": this.details.damage[keys[i]],
						"ordering": roll.ordering,
						"computed": ""
					});
				}
				if(this.details.resist && this.details.resist[keys[i]]) {
					data.resists.push({
						"key": roll,
						"formula": this.details.resist[keys[i]],
						"ordering": roll.ordering,
						"computed": ""
					});
				} else if(data.entity && data.entity.resistance && data.entity.resistance[keys[i]]) {
					data.resists.push({
						"key": roll,
						"formula": data.entity.resistance[keys[i]],
						"ordering": roll.ordering,
						"computed": ""
					});
				}
			}
		}
		data.damages.sort(rsSystem.utility.sortData);
		data.isCritical = false;
		data.isFailure = false;

		data.hideFormula = this.details.hideFormula;
		data.hideHistory = this.details.hideHistory;
		data.ready = !this.profile.auto_roll;
		data.canMiss = !!this.details.damage;

		data.skills = [];
		if(this.details.skill) {
			if(typeof(this.details.skill) === "string") {
				skill = this.universe.index.skill[this.details.skill];
			} else {
				skill = this.details.skill;
			}
			roll = {
				"computed": "",
				"formula": "1d20",
				"dice_rolls": {},
				"skill": skill,
				"key": skill.id
			};
			if(data.entity && data.entity.skill_check && data.entity.skill_check[roll.skill.id]) {
				roll.formula += " + " + data.entity.skill_check[roll.skill.id];
			}
			data.skills.push(new Roll(roll));
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
					data.skills.push(new Roll(roll));
				} else {
					console.warn("Unknown Skill: ", this.details.action.skill[i]);
				}
			}
		}

		if(data.skills.length === 1) {
			data.tracking = data.skills[0];
		}

		data.testActive = true;

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
		if(this.skills.length === 1 && this.skills[0].skill) {
			var find = $(this.$el).find("#" + this.skills[0].skill.id.substring(7));
			if(find && find.length) {
				find[0].focus();
			}
		}
		if(this.damages.length && this.profile && this.profile.auto_roll && (this.profile.auto_submit || (this.entity.is_minion && this.profile.auto_submit_minion))) {
			setTimeout(() => {
				this.sendResults();
			}, 100);
		}
	},
	"methods": {
		"testClick": function(event) {
			console.log("Click: ", event);
		},
		"toggleFailure": function(state) {
			if(state === undefined) {
				Vue.set(this, "isFailure", !this.isFailure);
			} else {
				Vue.set(this, "isFailure", state);
			}
			if(this.isFailure) {
				Vue.set(this, "isCritical", false);
			}
		},
		"toggleCritical": function(state) {
			if(state === undefined) {
				Vue.set(this, "isCritical", !this.isCritical);
			} else {
				Vue.set(this, "isCritical", state);
			}
			if(this.isCritical) {
				Vue.set(this, "isFailure", false);
			}
		},
		"dismissDamage": function(roll) {
			Vue.set(this.damageActive, roll.key.id, false);
			this.damages.purge(roll);
		},
		"addDamageType": function(type) {
			var damage,
				roll;

			damage = {
				"key": type,
				"formula": "",
				"ordering": type.ordering,
				"computed": ""
			};
			Vue.set(this, "active", damage);
			this.damageActive[type.id] = true;
			this.damages.push(damage);
			if(this.details.resist && this.details.resist[type.id]) {
				roll = {
					"key": type,
					"formula": this.details.resist[type.id],
					"ordering": type.ordering,
					"computed": ""
				};
			} else if(this.entity.resistance && this.entity.resistance[type.id]) {
				roll = {
					"key": type,
					"formula": this.entity.resistance[type.id],
					"ordering": type.ordering,
					"computed": ""
				};
			}
			console.log("Add Damage: ", type, this.entity);
			if(roll) {
				this.resists.push(roll);
				if(this.profile.auto_roll) {
					this.rollSkill(roll);
				}
			}
		},
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
			var name = "";
			if(this.details.rolling && this.details.finish_name) {
				name += this.details.finish_name;
			} else if(this.details.action && this.details.action.name) {
				name += this.details.action.name;
			} else {
				name += "Perform Action";
			}
			name += this.actionNote;
			return name;
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
			if(event.dice_rolls && event.dice_rolls.d20) {
				if(event.dice_rolls.d20[0] === 20) {
					Vue.set(this, "isCritical", true);
					Vue.set(this, "isFailure", false);
				} else if(event.dice_rolls.d20[0] === 1) {
					Vue.set(this, "isCritical", false);
					Vue.set(this, "isFailure", true);
				} else {
					Vue.set(this, "isCritical", false);
					Vue.set(this, "isFailure", false);
				}
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
		"selectSource": function(entity) {
			if(this.source === entity) {
				Vue.set(this, "source", null);
			} else {
				Vue.set(this, "source", entity);
			}
		},
		"getTargetClass": function(target) {
			var classes = "";
			if(this.targeting[target.id]) {
				classes += " targeted";
			}
			if(target.is_npc) {
				classes += " npc";
			}
			if(target.is_hostile) {
				classes += " hostile";
			}
			if(target.is_chest) {
				classes += " chest";
			}
			if(target.is_shop) {
				classes += " shop";
			}
			return classes;
		},
		"selectTarget": function(target) {
			if(this.targeting[target.id]) {
				Vue.delete(this.targeting, target.id);
			} else {
				Vue.set(this.targeting, target.id, true);
			}
			Vue.set(this, "target", target);
		},
		"clearTarget": function(target) {
			if(target) {
				Vue.delete(this.targeting, target);
			} else {
				Vue.set(this, "target", null);
			}
		},
		"setTracking": function(roll, negative) {
			Vue.set(this, "negative", !!negative);
			Vue.set(this, "tracking", roll);
		},
		"getTrackedClass": function(roll) {
			var classes = "";
			if(this.tracking === roll) {
				classes += "tracking ";
			}
			if(this.negative) {
				classes += "negative ";
			}
			return classes;
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
		/**
		 * Determine what dice are involved and roll the missing dice.
		 * @method fillRoll
		 */
		"fillRoll": function(roll) {
			var formula = roll.formula,
				calculated,
				percent,
				result,
				dice,
				die,
				i,
				r;

			if(formula) {
				if(roll.dice_rolls) {
					for(die in roll.dice_rolls) {
						roll.dice_rolls[die].splice(0);
					}
				} else {
					Vue.set(roll, "dice_rolls", {});
				}
				dice = rsSystem.dnd.parseDiceRoll(rsSystem.dnd.reducedDiceRoll(formula));
				result = 0;
				for(die in dice) {
					calculated = rsSystem.dnd.compute(dice[die], this.entity);
					if(die[0] === "d" && typeof(calculated) === "number") {
						if(!roll.dice_rolls[die]) {
							Vue.set(roll.dice_rolls, die, []);
						}
						for(i=0; i<calculated; i++) {
							r = Random.integer(this.range[die], 1);
							roll.dice_rolls[die].push(r);
							result += r;
						}
					} else if(die[0] === "%") {
						percent = calculated;
					} else {
						result += calculated;
					}
				}
				if(percent) {
					result = result * (percent/100);
				}

				Vue.set(roll, "computed", result);
			}
		},
		"autoRoll": function() {
			var roll,
				cb,
				i;

			if(this.rolling.length) {
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

			if(this.damages.length) {
				for(i=0; i<this.damages.length; i++) {
					roll = this.damages[i];
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

			if(this.resists.length) {
				for(i=0; i<this.resists.length; i++) {
					roll = this.resists[i];
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
				var advantage = 0;
				this.skills[0].roll();
				if(this.skills[0].skill) {
					if(this.entity.skill_advantage && this.entity.skill_advantage[this.skills[0].skill.id] && this.entity.skill_advantage[this.skills[0].skill.id] !== "0") {
						advantage += parseInt(this.entity.skill_advantage[this.skills[0].skill.id]) || 1;
					}
					// Disadvantage is deprecated but the idea applies the same
					if(this.entity.skill_disadvantage && this.entity.skill_disadvantage[this.skills[0].skill.id] && this.entity.skill_disadvantage[this.skills[0].skill.id] !== "0") {
						advantage -= parseInt(this.entity.skill_disadvantage[this.skills[0].skill.id]) || 1;
					}
				}
				// console.log("Advantage: ", advantage, this.entity.skill_advantage);
				if(advantage < 0) {
					this.skills[0].reroll("d20", 0, -1);
				} else if(advantage > 0) {
					this.skills[0].reroll("d20", 0, 1);
				}
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
					check.clear();
					// Vue.set(check, "computed", "");
					// if(check.dice_rolls) {
					// 	dice = Object.keys(check.dice_rolls);
					// 	for(j=0; j<dice.length; j++) {
					// 		check.dice_rolls[dice[j]].splice(0);
					// 	}
					// }
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
			sending.critical = !!this.isCritical;
			sending.failure = !!this.isFailure;
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
		"getSkillAdvIcon": function(check) {
			var skill = check.skill,
				classes = "";

			if(this.entity.skill_advantage[skill.id] > 0) {
				classes += " has-advantage";
			} else if(this.entity.skill_advantage[skill.id] < 0) {
				// classes += " has-disadvantage";
			}
	
			return classes;
			/*
			var skill = check.skill,
				classes = "",
				advantage = 0;

			if(this.entity.skill_advantage && this.entity.skill_advantage[skill.id] && this.entity.skill_advantage[skill.id] !== "0") {
				advantage += parseInt(this.entity.skill_advantage[skill.id] || 1);
			}
			if(this.entity.skill_disadvantage && this.entity.skill_disadvantage[skill.id] && this.entity.skill_disadvantage[skill.id] !== "0") {
				advantage -= parseInt(this.entity.skill_disadvantage[skill.id] || 1);
			}
			if(advantage > 0) {
				classes += " has-advantage";
			} else if(advantage < 0) {
				// Disadvantage in separate method
			}

			return classes;
			*/
		},
		"getSkillDisIcon": function(check) {
			var skill = check.skill,
				classes = "";

			if(this.entity.skill_advantage[skill.id] > 0) {
				// classes += " has-advantage";
			} else if(this.entity.skill_advantage[skill.id] < 0) {
				classes += " has-disadvantage";
			}
	
			return classes;
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
				Vue.set(this, "active", null);
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
			if(this.negative) {
				store = roll.computed + save;
			} else {
				store = roll.computed - save;
			}
			Vue.set(roll.dice_rolls[die], index, rolled);
			if(this.negative) {
				Vue.set(roll, "computed", store - rolled);
			} else {
				Vue.set(roll, "computed", store + rolled);
			}

			if(die === "d20") {
				if(rolled >= this.entity.skill_critical) {
					Vue.set(this, "isCritical", true);
					Vue.set(this, "isFailure", false);
				} else if(rolled <= this.entity.skill_failure) {
					Vue.set(this, "isCritical", false);
					Vue.set(this, "isFailure", true);
				} else {
					Vue.set(this, "isCritical", false);
					Vue.set(this, "isFailure", false);
				}
			}

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
				parsed,
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
			if(typeof(store.computed) === "number") {
				if(this.negative) {
					Vue.set(store, "computed", (store.computed || 0) - rolled);
				} else {
					Vue.set(store, "computed", (store.computed || 0) + rolled);
				}
			} else if(typeof(store.computed) === "string") {
				parsed = rsSystem.dnd.parseDiceRoll(store.computed);
				if(this.negative) {
					parsed.remainder = parseInt(parsed.remainder || 0) - rolled;
				} else {
					parsed.remainder = parseInt(parsed.remainder || 0) + rolled;
				}
				Vue.set(store, "computed", rsSystem.dnd.reducedDiceRoll(parsed));
			} else {
				console.warn("Failed to preserve previous Roll value - Computed roll value is currently non-sense: ", _p(store));
				if(this.negative) {
					Vue.set(store, "computed", -1 * rolled);
				} else {
					Vue.set(store, "computed", rolled);
				}
			}
			if(!store.dice_rolls[die.label]) {
				Vue.set(store.dice_rolls, die.label, []);
			}
			store.dice_rolls[die.label].push(rolled);
			this.$forceUpdate();
		},
		"getResultState": function() {
			if(!this.rolling || this.rolling.length === 0) {
				return 0;
			}

			var i;
			for(i=0; i<this.rolling.length; i++) {
				if(!this.rolling[i].computed && this.rolling[i].computed !== 0) {
					Vue.set(this, "actionTitling", "Missing roll result numbers");
					Vue.set(this, "actionNote", "[Roll]");
					return -1;
				}
			}
			for(i=0; i<this.damages.length; i++) {
				if(!this.damages[i].computed && this.damages[i].computed !== 0) {
					Vue.set(this, "actionTitling", "Missing damage roll results");
					Vue.set(this, "actionNote", "[Damage]");
					return -1;
				}
			}
			for(i=0; i<this.resists.length; i++) {
				if(!this.resists[i].computed && this.resists[i].computed !== 0) {
					Vue.set(this, "actionTitling", "Missing resistance roll results");
					Vue.set(this, "actionNote", "[Resistances]");
					return -1;
				}
			}

			if(this.details.action && this.details.action.id === "action:free:damage") {
				Vue.set(this, "actionTitling", "");
				Vue.set(this, "actionNote", "");
				return 0;
			} else if((this.skills && this.skills.length && this.check === null && this.warn === 0) || (this.targets && this.targets.length && this.target === null && this.warn <= 1 && (!this.details.action || (this.details.action && this.details.action.targets && this.details.action.targets.length)))) {
				Vue.set(this, "actionTitling", "Missing skill check result or not yet sent");
				Vue.set(this, "actionNote", "[Send Skill Check]");
				return 2;
			} else {
				Vue.set(this, "actionTitling", "");
				Vue.set(this, "actionNote", "");
				return 0;
			}
		},
		"getSendResultIcon": function() {
			switch(this.getResultState()) {
				case -1:
					return "fas fa-exclamation-triangle rs-lightred";
				case 0:
					if(this.details.action) {
						return this.details.action.icon || "fas fa-dice";
					} else {
						return this.details.finish_icon || "fas fa-dice";
					}
				default:
					return "fas fa-exclamation-triangle rs-lightyellow";	
			}
			/*
			var i;
			for(i=0; i<this.rolling.length; i++) {
				if(!this.rolling[i].computed && this.rolling[i].computed !== 0) {
					
				}
			}

			if(this.skills && this.check === null && this.warn === 0) {
				return "fas fa-exclamation-triangle rs-lightyellow";
			} else if(this.targets && this.target === null && this.warn <= 1) {
				return "fas fa-exclamation-triangle rs-lightyellow";
			} else if(this.action) {
				
			} else {
				return "fas fa-dice";
			}
			*/
		},
		/**
		 * Zero the resist and damage values, then send the result. This is to essentially
		 * declare an attack a miss.
		 * @method sendZeroResults
		 */
		"sendZeroResults": function() {
			var i;
			if(this.damages.length) {
				for(i=0; i<this.damages.length; i++) {
					this.damages[i].computed = 0;
				}
			}
			if(this.resists.length) {
				for(i=0; i<this.resists.length; i++) {
					this.resists[i].computed = 0;
				}
			}
			this.sendResults();
		},
		"sendResults": function() {
			var state = this.getResultState(),
				perform,
				keys,
				i;

				
			if(state > 0 && this.warn < state) {
				Vue.set(this, "warn", this.warn + 1);
			} else if(state < 0) {
				console.error("Missing result data: ", _p(this.rolling), _p(this.damages), _p(this.resists));
			} else {
				perform = {};
				if(this.details.action) {
					perform.action = this.details.action.id;
					perform.name = this.details.action.name;
				}
				if(this.details.activity) {
					perform.activity = this.details.activity;
				}
				if(this.details.using) {
					perform.using = this.details.using.id;
				}
				// if(this.target) {
				// 	perform.target = this.target.id;
				// }
				if(this.targeting) {
					keys = Object.keys(this.targeting);
					if(keys.length) {
						perform.targets = keys;
					}
				}
				if(this.details.target) {
					if(perform.targets) {
						perform.targets.push(this.details.target);
					} else {
						perform.targets = [this.details.target];
					}
				}
				if(this.details.targets) {
					if(perform.targets) {
						perform.targets.push.apply(perform.targets, this.details.target);
					} else {
						perform.targets = [].concat(this.details.targets);
					}
				}
				if(this.source) {
					perform.source = this.source.id;
				}
				if(this.details.spell) {
					perform.spell = this.details.spell.id;
				}
				if(this.check) {
					perform.check = Object.assign({}, this.check);
					if(perform.check.skill) {
						perform.check.skill = perform.check.skill.id;
					}
					delete(perform.check.key);
				} else if(this.skills.length === 1 && (this.skills[0].result !== undefined || this.skills[0].computed !== undefined)) {
					perform.check = Object.assign({}, this.skills[0]);
					if(perform.check.skill) {
						perform.check.skill = perform.check.skill.id;
					}
					delete(perform.check.key);
				}
				if(this.statusResponse) {
					perform.status = this.statusResponse;
				}
				perform.entity = this.entity.id;
				if(this.rolling.length) {
					perform.result = {};
					for(i=0; i<this.rolling.length; i++) {
						perform.result[this.rolling[i].key.id || this.rolling[i].key] = this.rolling[i].computed;
					}
				}
				if(this.damages.length) {
					perform.damage = {};
					for(i=0; i<this.damages.length; i++) {
						if(this.isCritical) {
							perform.damage[this.damages[i].key.id || this.damages[i].key] = 2 * this.damages[i].computed;
						} else {
							perform.damage[this.damages[i].key.id || this.damages[i].key] = this.damages[i].computed;
						}
					}
				}
				if(this.resists.length) {
					perform.resist = {};
					for(i=0; i<this.resists.length; i++) {
						perform.resist[this.resists[i].key.id || this.resists[i].key] = this.resists[i].computed;
					}
				}
				if(this.details.spellLevel !== undefined) {
					perform.spellLevel = parseInt(this.details.spellLevel) || 0;
				}
				perform.critical = !!this.isCritical;
				perform.failure = !!this.isFailure;

				console.log("Performing: ", perform);
				if(perform.action && perform.action !== "action:free:damage") {
					this.universe.send(perform.action, perform);
				} else {
					this.universe.send("action:perform", perform);
				}
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
