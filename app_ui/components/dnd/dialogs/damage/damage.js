/**
 *
 *
 * @class dndDialogDamage
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogDamage", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController,
		rsSystem.components.DNDWidgetCore,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {
		"meeting": function() {
			if(this.universe.index.setting["setting:meeting"]) {
				return this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value] || null;
			}
			return null;
		},
		"skirmish": function() {
			var skirmish,
				i;
			for(i=0; i<this.universe.listing.skirmish.length; i++) {
				skirmish = this.universe.listing.skirmish[i];
				if(rsSystem.utility.isValid(skirmish) && skirmish.active) {
					return skirmish;
				}
			}
			return null;
		},
		"entity": function() {
			if(typeof(this.details.entity) === "string") {
				return this.universe.index.entity[this.details.entity];
			}
			return this.details.entity;
		},
		"mainhand": function() {
			if(this.entity.main_weapon) {
				return this.universe.index.item[this.entity.main_weapon];
			}
			return null;
		},
		"available_offhand": function() {
			var exclusions = {},
				items = [],
				item,
				i;
			if(this.mainhand) {
				exclusions[this.mainhand.id] = true;
			}

			if(this.entity.equipped) {
				for(i=0; i<this.entity.equipped.length; i++) {
					item = this.universe.getObject(this.entity.equipped[i]);
					if(rsSystem.utility.isValid(item) && !exclusions[item.id]) {
						if(this.isWeapon(item)) {
							items.unshift(item);
						} else if(rsSystem.utility.isNotEmpty(item.skill_damage)) {
							items.push(item);
						}
					}
				}
			}

			return items;
		},
		"available_other_items": function() {
			var items = [],
				item,
				i;

			if(this.entity.equipped) {
				for(i=0; i<this.entity.equipped.length; i++) {
					item = this.universe.getObject(this.entity.equipped[i]);
					if(rsSystem.utility.isValid(item) && !this.isWeapon(item) && ((item.instilled && item.instilled.length) || item.dc || rsSystem.utility.isNotEmpty(item.damage) || (item.form && item.form.length))) {
						items.push(item);
					}
				}
			}

			return items;
		},
		"ammos": function() {
			var ammos = {},
				ammo,
				i;

			if(this.mainhand && (ammo = this.universe.index.item[this.mainhand.ammo])) {
				ammos[this.mainhand.id] = {
					"available": rsSystem.utility.getByParentID(ammo.id, this.entity, ["inventory"]),
					"item": ammo
				};
			}
			for(i=0; i<this.available_offhand.length; i++) {
				if(ammo = this.universe.index.item[this.available_offhand[i].ammo]) {
					ammos[this.available_offhand[i].id] = {
						"available": rsSystem.utility.getByParentID(ammo.id, this.entity, ["inventory"]),
						"item": ammo
					};
				}
			}

			return ammos;
		},
		"available_effects": function() {
			var effects = [],
				effect,
				i;

			for(i=0; i<this.universe.listing.effect.length; i++) {
				effect = this.universe.listing.effect[i];
				if(effect && (effect.playable || effect.is_playable) && rsSystem.utility.isValid(effect)) {
					effects.push(effect);
				}
			}

			return effects;
		},
		"available_additives": function() {
			var additives = [],
				search,
				check,
				i;
			
			if(this.entity) {
				search = this.universe.transcribeInto(this.entity.feats);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(rsSystem.utility.isNotEmpty(check.additive_skill) || check.skill_bonus_roll || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
					// if(this.isValidAdditive(check)) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(this.entity.equipped);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(rsSystem.utility.isNotEmpty(check.additive_skill) || check.skill_bonus_roll || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(this.entity.spells);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(rsSystem.utility.isNotEmpty(check.additive_skill) || check.skill_bonus_roll || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(this.entity.effects);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(rsSystem.utility.isNotEmpty(check.additive_skill) || check.skill_bonus_roll || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
			}

			return additives;
		},
		"available_feats": function() {
			return this.buildAvailableChannel(this.entity.feats);
		},
		"available_spells": function() {
			return this.buildAvailableChannel(this.entity.spells);
		},
		"available_targets": function() {
			var targets = [],
				filter = {},
				types = {},
				any = false,
				target,
				add,
				dmg,
				i,
				j;

			add = (target, skip) => {
				if(rsSystem.utility.isValid(target) && !filter[target.id] && ((!target.obscured && !target.is_obscured) || (this.player && this.player.gm))) {
					filter[target.id] = true;
					if(skip || !types || any || rsSystem.utility.hasCommonKey(types, target.types)) {
						if(target.obscured || target.is_obscured) {
							delete(this.ranging[target.id]);
						} else {
							this.ranging[target.id] = this.distanceTo(this.entity, target);
							if(typeof(this.ranging[target.id]) !== "number") {
								this.ranging[target.id] = "";
							}
						}
						targets.push(target);
					}
				}
			};

			if(this.channel && this.channel.targets) {
				for(i=0; i<this.channel.targets.length; i++) {
					types[this.channel.targets[i]] = true;
					if(this.channel.targets[i] === "type:any") {
						any = true;
					} else if(this.channel.targets[i] === "type:self") {
						add(this.entity, true);
					}
				}
			}
			if(rsSystem.utility.isEmpty(types)) {
				types = null;
			}

			if(this.meeting) {
				for(i=0; i<this.meeting.entities.length; i++) {
					target = this.universe.index.entity[this.meeting.entities[i]];
					add(target);
				}
			}

			if(this.skirmish) {
				for(i=0; i<this.skirmish.entities.length; i++) {
					target = this.universe.index.entity[this.skirmish.entities[i]];
					add(target);
				}
			}

			for(i=0; i<targets.length; i++) {
				target = targets[i].id;
				if(!this.roll_damage[target]) {
					Vue.set(this.roll_damage, target, {});
				}
				for(j=0; j<this.universe.listing.damage_type.length; j++) {
					dmg = this.universe.listing.damage_type[j].id;
					if(!this.roll_damage[target][dmg]) {
						add = new Roll();
						add.setSource(this.entity);
						Vue.set(this.roll_damage[target], dmg, add);
					}
				}
			}

			return targets;
		},
		"available_checks": function() {
			var checks = [],
				check,
				i;
			
			if(this.channel) {
				switch(this.channel._class) {
					case "spell":
						if(this.channel.cast_attack) {

						} else {

						}
						break;
					case "item":
						break;
				}
			}

			return checks;
		},
		"targetCountClasses": function() {
			if(this.target_limit < this.targetted) {
				return "rs-light-red";
			} else if(this.target_limit > this.targetted) {
				return "rs-light-yellow";
			} else {
				return "rs-light-green";
			}
		},
		"targetted": function() {
			var targets = Object.keys(this.targetCount),
				targetted = 0,
				id,
				i;

			for(i=0; i<targets.length; i++) {
				id = targets[i];
				targetted += this.targetCount[id];
			}
			
			return targetted;
		},
		"available_effects": function() {
			var effects = [],
				effect,
				i;

			if(this.channel) {
				if(this.channel.instilled) {
					return this.universe.transcribeInto(this.channel.instilled, effects);
				}
			} else {
				for(i=0; i<this.universe.listing.length; i++) {
					effect = this.universe.listing[i];
					if(rsSystem.utility.isValid(effect) && effect.selectable && !effect.is_copy) {
						effects.push(effect);
					}
				}
			}
			return effects;
		}
	},
	"data": function () {
		var data = {},
			items,
			slot,
			dmg,
			i;

		data.sections = [{
			"name": "Channel",
			"description": "Select how you are dealing the damage or healing, such as a spell, weapon, or through a feat.",
			"id": "channel"
		}, {
			"name": "Targets",
			"description": "Select the targets of your damage",
			"id": "targets"
		}, {
			"name": "Adds",
			"description": "Select abilities from which to add effects",
			"id": "additives"
		}, {
			"name": "Skills",
			"description": "Indicate skills that are being performed and enter the values you rolled",
			"id": "checks"
		}, {
		// 	"name": "Saves",
		// 	"description": "Indicate any effects that you are imparting on the targets as a result of this damage. The effects will track whether damage needs dealt or any save needs passed.",
		//	"id": "saves"
		// }, {
			"name": "Damage",
			"description": "Select damage that is being dealt to the specified targets.",
			"id": "damage"
		}, {
			"name": "Effects",
			"description": "Indicate any effects that you are imparting on the targets as a result of this damage. The effects will track whether damage needs dealt or any save needs passed.",
			"id": "effects"
		}, {
			"name": "Data",
			"description": "Custom data to be entered for the action, if any",
			"id": "data"
		}, {
			"name": "Review",
			"description": "Final review page",
			"id": "review"
		}];
		for(i=0; i<data.sections.length; i++) {
			data.sections[i].classing = "page" + (i + 1);
			data.sections[i].index = i;
		}
		data.activeSection = data.sections[0];
		data.prepared = [data.sections[0]];
		data.index = 0;

		items = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
		data.stats = [];
		for(i=0; i<items.length; i++) {
			data.stats.push({
				"icon": this.universe.index.skill["skill:" + items[i]].icon + " rs-light-blue",
				"name": items[i].capitalize(),
				"id": items[i].substring(0,3),
				"value": isNaN(this.details.entity[items[i]])?0:this.details.entity[items[i]] || 0
			});
		}

		data.dice = rsSystem.dnd.diceDefinitions;
		data.focused_roll = null;
		data.targetCount = {};
		data.maxtargets = 0;
		
		data.form_filters = {};
		data.form_fields = [];
		data.form = {};

		data.autoskipped = {};
		data.available_levels = [0];
		if(this.details.channel && this.details.channel.level) {
			data.cast_level = parseInt(this.details.channel.level) || 0;
		} else {
			data.cast_level = 0;
		}

		data.actionsToTake = [];

		data.target_repetition = 0;
		data.target_limit = 0;
		data.channel = this.details.channel || null;
		data.action = this.details.action || null;
		data.action_cost = null;
		data.targeting = this.details.targeting || {};
		data.ranging = {};
		data.roll_damage = this.details.roll_damage || {};
		data.send_damage = this.details.send_damage || {};
		data.raw_damage = this.details.raw_damage || {};
		data.quick_adds = false;
		data.additives_locked = false;
		data.available_damages = [];
		data.damage_targets = [];
		data.active_targets = [];
		data.target_check = {};
		data.effects_self = [];
		data.damages = [];
		data.effects = [];
		data.channel_changed = false;
		data.targets_changed = false;
		data.splitDamage = this.details.splitDamage === undefined?true:!!this.details.splitDamage;
		data.skill_add = {};
		data.additives = [];
		data.adding = {};

		data.roll_damage[null] = {};
		for(i=0; i<this.universe.listing.damage_type.length; i++) {
			dmg = this.universe.listing.damage_type[i];
			data.roll_damage[null][dmg.id] = new Roll();
		}
		/**
		 * 
		 * @property activeRoll
		 * @type Roll
		 */
		data.activeRoll = null;

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.getObject(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
		this.goToSection(this.sections[0]);
		if(this.details.channel) {
			var channel = this.details.channel;
			if(typeof(channel) === "string") {
				channel = this.universe.getObject(channel);
				if(channel) {
					this.selectChannel(channel);
				} else {
					console.warn("Damage details specified an invalid channel: " + this.details.channel, this.details);
				}
			} else if(typeof(channel) === "object") {
				this.selectChannel(channel);
			} else {
				console.warn("Damage details specified a  channel with a bad type: " + this.details.channel, this.details);
			}
		}
	},
	"methods": {
		"isValidAdditive": function(check) {
			// Broken up for readability x_x
			if(rsSystem.utility.isEmpty(check.additive_skill) && !check.skill_bonus_roll && !check.additive_attack && !check.additive_attack_melee && !check.additive_attack_range && !check.additive_attack_spell && (!check.additive_attack_charged || check.charges === 0)) {
				return false;
			}

			if(check.bonus_channel_lock && this.channel.id !== check.bonus_channel_lock) {
				return false;
			}
			
			if(check.bonus_lock_to_class && this.channel._class !== check.bonus_lock_to_class) {
				return false;
			}

			if(check.bonus_type_lock && (!this.channel.types || this.channel.types.indexOf(check.bonus_type_lock) === -1)) {
				return false;
			}

			if(check.damage_bonus_type_lock && this.channel.damage_type !== check.damage_bonus_type_lock) {
				return false;
			}

			if(check.additive_attack_melee && !this.channel.melee && this.channel.ranged) {
				return false;
			}

			if(check.bonus_lock_to_ranged && this.channel.melee && !this.channel.ranged) {
				return false;
			}

			return true;
		},
		"isEmpty": function(object) {
			return rsSystem.utility.isEmpty(object);
		},
		"isWeapon": function(item) {
			return item.melee || item.ranged || item.thrown;
		},
		"getHatColor": function(entity) {
			return "rs-" + entity.color_flag;
		},
		"channelClasses": function(channel) {
			if(channel === this.channel) {
				return "active-channel";
			}
			return "";
		},
		"toggleSplitDamage": function() {
			Vue.set(this, "splitDamage", !this.splitDamage);
		},
		"getTargetClasses": function(target) {
			var classes = "target";
			if(this.targeting[target.id]) {
				classes += " targeted";
			}
			if(target.is_npc) {
				classes += " npc";
			}
			if(target.is_hostile) {
				classes += " hostile";
			}
			if(target.is_shop) {
				classes += " shop";
			}
			if(target.is_chest) {
				classes += " chest";
			}
			if(target.is_minion) {
				classes += " minion"; 
			}
			return classes;
		},
		"getAdditiveClasses": function(additive) {
			var classes = "additive";
			if(this.adding[additive.id]) {
				classes += " selected";
			}
			if(this.additives_locked) {
				classes += " locked";
			}
			return classes;
		},
		"setFocus": function(roll) {
			console.log("Focus Roll: ", roll);
			if(this.focused_roll && this.focused_roll !== roll) {
				this.focused_roll.blurred();
			}
			Vue.set(this, "focused_roll", roll);
			roll.focused();
		},
		"clearFocus": function(roll) {
			console.log("Blur Roll: ", roll);
			if(this.focused_roll === roll) {
				Vue.set(this, "focused_roll", null);
				roll.blurred();
			}
		},
		"includeObject": function(object) {
			return rsSystem.utility.isValid(object) && (rsSystem.utility.hasDamage(object) || (object.instilled && object.instilled.length));
		},
		"buildAvailableChannel": function(source, exclusions) {
			exclusions = exclusions || {};
			var items = [],
				item,
				i;

			if(source) {
				for(i=0; i<source.length; i++) {
					item = this.universe.getObject(source[i]);
					if(this.includeObject(item) && !exclusions[item.id]) {
						items.push(item);
					}
				}
			}

			return items;
		},
		"toggleSpells": function() {
			Vue.set(this, "show_spells", !this.show_spells);
		},
		"toggleFeats": function() {
			Vue.set(this, "show_feats", !this.show_feats);
		},
		"toggleTarget": function(target) {
			if(this.targetCount[target.id]) {
				this.removeTarget(target);
			} else {
				this.setTarget(target);
			}
		},
		"removeTarget": function(target) {
			Vue.set(this.targetCount, target.id, this.targetCount[target.id] - 1);
			if(!this.targetCount[target.id]) {
				Vue.delete(this.targeting, target.id);
			}
			Vue.set(this, "targets_changed", true);
		},
		"setTarget": function(target) {
			Vue.set(this.targetCount, target.id, (this.targetCount[target.id] || 0) + 1);
			Vue.set(this.targeting, target.id, target);
			Vue.set(this, "targets_changed", true);
			if(this.activeSection.id === "targets" && !this.autoskipped[this.activeSection.id] && this.target_limit && this.targetted === this.target_limit) {
				this.autoskipped[this.activeSection.id] = true;
				this.finishSection(this.activeSection);
			}
		},
		"toggleAdditive": function(additive) {
			if(!this.additives_locked) {
				if(this.adding[additive.id]) {
					Vue.delete(this.adding, additive.id);
					if(this.skill_add[additive.id]) {
						Vue.delete(this.skill_add, additive.id);
					}
				} else {
					Vue.set(this.adding, additive.id, additive);
					if(!this.skill_add[additive.id] && (rsSystem.utility.isNotEmpty(additive.additive_skill) || additive.skill_bonus_roll)) {
						Vue.set(this.skill_add, additive.id, additive);
					}
				}
			}
		},
		"createActionCheck": function(target) {
			console.warn("Create Action: ", target, this);
			var action = {},
				damage_type,
				formula,
				damage,
				skill,
				add,
				i;

			action.target = target;

			// Get Skill Check
			if(this.channel) {
				if((this.isWeapon(this.channel) || this.channel.cast_attack)) {
					if(this.entity.main_weapon === this.channel.id) {
						skill = this.universe.index.skill["skill:mainhand"];
					} else {
						skill = this.universe.index.skill[this.channel.skill];
						if(!skill) {
							if(this.channel.cast_attack) {
								skill = this.universe.index.skill["skill:spellattack"];
							} else {
								skill = this.universe.index.skill["skill:offhand"];
							}
						}
					}
					if(skill) {
						formula = "";
						if(rsSystem.utility.isNotEmpty(this.skill_add)) {
							for(i in this.skill_add) {
								add = this.skill_add[i];
								if(this.additiveAppliesToTarget(add, target)) {
									if(add.additive_skill && add.additive_skill[skill.id]) {
										formula += " + " + add.additive_skill[skill.id];
									} else if(add.skill_bonus_roll) {
										formula += " + " + add.skill_bonus_roll;
									}
								}
							}
						}
						action.check = {
							"roll": new Roll({
								"formula": "1d20 + " + rsSystem.dnd.reducedDiceRoll((this.entity.skill_check[skill.id] || 0) + formula),
								"entity": this.entity
							}),
							"target": target,
							"skill": skill
						};
						action.skill = skill;
					} else {
						console.warn("Unable to find skill for channel: ", this.channel);
					}
				} else if(this.channel.dc_save && (skill = this.universe.index.skill[this.channel.dc_save])) {
					action.check = {
						"roll": new Roll({
							"formula": "1d20 + " + (this.entity.skill_check[skill.id] || 0),
							"entity": this.entity
						}),
						"target": target,
						"skill": skill
					};
					action.skill = skill;
					if(this.profile.auto_roll) {
						action.check.roll.roll();
					}
				} else {
					// No Skill
				}
				damage_type = this.channel.damage_type;
			}

			// Add Damage Rolls
			if(this.available_damages.length) {
				action.damageFormulas = {};
				action.damageRollMap = {};
				action.damages = [];
				for(i=0; i<this.available_damages.length; i++) {
					damage = this.available_damages[i];
					action.damageFormulas[damage.id] = [this.channel.damage[damage.id] || 0];
					action.damages.push(damage);
				}
				if(damage_type && !action.damageFormulas[damage_type]) {
					action.damageFormulas[damage_type] = [];
					action.damages.push(this.universe.get(damage_type));
				}
				if(rsSystem.utility.isNotEmpty(this.adding)) {
					for(i in this.adding) {
						add = this.adding[i];
						if(this.additiveAppliesToTarget(add, target)) {
							if(rsSystem.utility.isNotEmpty(add.damage_bonus_spell)) {
								for(damage in add.damage_bonus_spell) {
									if(!action.damageFormulas[damage]) {
										action.damageFormulas[damage] = [];
										action.damages.push(this.universe.get(damage));
									}
									action.damageFormulas[damage].push(add.damage_bonus_spell[damage]);
								}
							}
							if(add.damage_bonus_weapon && damage_type) {
								action.damageFormulas[damage_type].push(add.damage_bonus_weapon);
							}
						}
					}
				}
				for(i=0; i<action.damages.length; i++) {
					damage = action.damages[i];
					action.damages[i] = {
						"type": damage,
						"roll": new Roll({
							"formula": action.damageFormulas[damage.id].join(" + "),
							"entity": this.entity
						})
					};
					if(this.profile.auto_roll) {
						action.damages[i].roll.roll();
					}
				}
			}

			return action;
		},

		"getDamageTotal": function(damages) {
			var remainder = [],
				sum = 0,
				roll,
				i;

			if(damages) {
				for(i=0; i<damages.length; i++) {
					roll = damages[i].roll;
					if(isNaN(roll.computed)) {
						remainder.push(roll.computed);
					} else {
						sum += parseInt(roll.computed);
					}
				}

				if(remainder.length) {
					return sum + " + " + remainder.join(" + ");
				}
			}

			return sum;
		},
		"completeRoll": function(section, id, formula) {
			
		},
		"finishSection": function(section) {
			// TODO: Validate Current
			var channel = this.channel,
				additives,
				additive,
				damages,
				targets,
				action,
				damage,
				source,
				target,
				check,
				type,
				a,
				i,
				j;

			console.log("Finish Section: ", section.id, "\nActive:\n", this.activeSection.id);
			switch(this.activeSection.id) {
				case "channel":
					console.log("Channel Set: ", this.channel);
					break;
				case "additives":
					this.actionsToTake.splice(0);
					targets = Object.keys(this.targetCount);
					console.log(" > Check Targets: " + Object.keys(this.targeting).join(", ") + "\n", _p(this.targetCount));
					for(i=0; i<targets.length; i++) {
						console.log(" > Check Target: " + targets[i]);
						target = this.targeting[targets[i]];
						if(target) {
							for(j=0; j<this.targetCount[target.id]; j++) {
								action = this.createActionCheck(target);
								this.actionsToTake.push(action);
							}
						} else {
							delete(this.targetCount[targets[i]]);
						}
					}
					break;
				case "checks":
					for(i=0; i<this.actionsToTake.length; i++) {
						action = this.actionsToTake[i];
						if(action.check && action.check.roll.is_critical && action.damages) {
							for(j=0; j<action.damages.length; j++) {
								action.damages[j].roll.setDiceMultiplier(2);
							}
						}
					}
					break;
				case "targets":
					targets = Object.keys(this.targeting);
					if(this.targets_changed || this.channel_changed) {
						Vue.set(this, "targets_changed", false);
						Vue.set(this, "channel_changed", false);
						this.active_targets.splice(0);
						this.universe.transcribeInto(targets, this.active_targets);
					}
					this.damage_targets.splice(0);
					if(this.splitDamage) {
						this.damage_targets.push.apply(this.damage_targets, targets);
					} else {
						this.damage_targets.push(null);
					}
					this.buildAdditives();
					break;
				case "review":
					this.send();
					return false;
			}

			this.goToNextSection();
			return true;
		},
		"goToSection": function(section) {
			var auto_submit = this.profile.auto_submit || (this.entity.is_minion && this.profile.auto_submit_minion),
				auto = this.profile.auto_roll && auto_submit,
				targets,
				entity,
				effect,
				skill,
				slot,
				i;

			switch(section.id) {
				case "channel":
					this.available_levels.splice(1);
					if(this.entity && this.entity.spell_slot_max && this.entity.spell_slots) {
						// TODO: Build Out spell levels for selection of the cast
						for(slot in this.entity.spell_slot_max) {
							if(this.entity.spell_slots[slot] > 0) {
								this.available_levels.push(slot);
							}
						}
					}
					break;
				case "additives":
					if(this.additives.length === 0 && !this.autoskipped[section.id]) {
						this.autoskipped[section.id] = true;
						setTimeout(() => {
							this.finishSection(section);
							// this.goToNextSection();
						});
					} else if(this.quick_adds && auto_submit && !this.autoskipped[section.id]) {
						this.autoskipped[section.id] = true;
						setTimeout(() => {
							this.finishSection(section);
							// this.goToNextSection();
						});
					}
					break;
				case "checks":
					if(this.hasNoSkillChecks() && !this.autoskipped[section.id]) {
						this.autoskipped[section.id] = true;
						setTimeout(() => {
							this.finishSection(section);
							// this.goToNextSection();
						});
					} else if(auto) {
						setTimeout(() => {
							this.finishSection(section);
							// this.goToNextSection();
						});
					}
					break;
				case "targets":
					if(this.available_targets.length === 0 && !this.autoskipped[section.id]) {
						this.autoskipped[section.id] = true;
						setTimeout(() => {
							this.finishSection(section);
							// this.goToNextSection();
						});
					}
					break;
				case "damage":
					if(this.channel) {
						if(this.available_damages.length === 0 && !this.autoskipped[section.id]) {
							this.autoskipped[section.id] = true;
							setTimeout(() => {
								this.finishSection(section);
								// this.goToNextSection();
							});
						} else if(auto) {
							setTimeout(() => {
								this.finishSection(section);
								// this.goToNextSection();
							});
						}
					}
					break;
				case "effects":
					this.effects_self.splice(0);
					this.effects.splice(0);
					if(this.details.effects) {
						for(i=0; i<this.details.effects.length; i++) {
							effect = this.universe.index.effect[this.details.effects[i]];
							if(rsSystem.utility.isValid(effect)) {
								this.effects.push(effect);
							}
						}
					}
					if(this.details.effects_self) {
						for(i=0; i<this.details.effects_self.length; i++) {
							effect = this.universe.index.effect[this.details.effects_self[i]];
							if(rsSystem.utility.isValid(effect)) {
								this.effects_self.push(effect);
							}
						}
					}
					if(this.channel) {
						if(this.channel.instilled) {
							for(i=0; i<this.channel.instilled.length; i++) {
								effect = this.universe.index.effect[this.channel.instilled[i]];
								if(rsSystem.utility.isValid(effect)) {
									this.effects.push(effect);
								}
							}
						}
						if(this.channel.instilled_self) {
							for(i=0; i<this.channel.instilled_self.length; i++) {
								effect = this.universe.index.effect[this.channel.instilled_self[i]];
								if(rsSystem.utility.isValid(effect)) {
									this.effects_self.push(effect);
								}
							}
						}
					}
					console.log("Effects: ", this.effects, this.effects_self);
					// if(!this.autoskipped[this.activeSection.id] && ((this.effects.length === 0 && this.effects_self.length === 0) || this.channel)) {
					if(!this.autoskipped[section.id] && ((this.effects.length === 0 && this.effects_self.length === 0) || this.channel)) {
						this.autoskipped[section.id] = true;
						setTimeout(() => {
							this.goToNextSection();
						});
					} else if(this.profile && auto) {
						setTimeout(() => {
							this.goToNextSection();
						});
					}
					break;
				case "data":
					if(this.form_fields.length === 0 && !this.autoskipped[section.id]) {
					// if(!this.form_fields.length) { // Always skip if no data prompt
						this.autoskipped[section.id] = true;
						setTimeout(() => {
							this.finishSection(section);
						});
					}
					break;
				case "review":
					if(this.profile && auto_submit) {
						this.send();
					}
					break;
			}

			Vue.set(this, "activeSection", section);
			this.prepared.splice(0);
			for(i=0; i<=section.index; i++) {
				this.prepared.push(this.sections[i]);
			}
		},
		"goToNextSection": function() {
			var next = this.sections[this.activeSection.index + 1];
			if(next) {
				this.clearFocus();
				this.goToSection(next);
			}
		},
		"hasNoSkillChecks": function() {
			for(var i=0; i<this.actionsToTake.length; i++) {
				if(this.actionsToTake[i].skill) {
					return false;
				}
			}
			return true;
		},
		"getRangeClasses": function(target) {
			if(!this.channel || !this.ranging[target.id]) {
				return "";
			}

			var range_to = this.ranging[target.id],
				classes = "",
				range;

			if((this.channel.melee && !this.channel.thrown) || (this.channel.range_normal === 0 && !this.channel.range_maximum)) {
				// Melee/Touch
				range = 7;
				if(this.channel.melee && this.channel.range_normal) {
					range += this.channel.range_normal; // Reach
				}
			} else if(this.channel.range_normal || this.channel.range_maximum) {
				range = this.channel.range_maximum || this.channel.range_normal;
			}

			if(range_to < range) {
				classes += " within-range";
			} else {
				classes += " out-of-range";
			}

			// Consider Radius
			if(this.channel.effect_radius && range < range_to && range_to <= (range + this.channel.effect_radius)) {
				classes += " within-radius";
			}

			return classes;
		},
		"targetAdditiveApplies": function(additive) {
			if(additive.bonus_target_lock || additive.bonus_effect_lock) {
				var target,
					i;

				for(i=0; i<this.active_targets.length; i++) {
					target = this.active_targets[i];
					if(additive.bonus_target_lock && rsSystem.utility.hasParentalKey(target, additive.bonus_target_lock)) {
						return true;
					} else if(additive.bonus_effect_lock && target.effects && target.effects.length && rsSystem.utility.hasParentalKey(target.effects, additive.bonus_effect_lock)) {
						return true;
					}
				}
			}

			return false;
		},
		"additiveAppliesToTarget": function(additive, target) {
			if(additive.bonus_target_lock || additive.bonus_effect_lock) {
				if(additive.bonus_target_lock && rsSystem.utility.hasParentalKey(target, additive.bonus_target_lock)) {
					return true;
				} else if(additive.bonus_effect_lock && target.effects && target.effects.length && rsSystem.utility.hasParentalKey(target.effects, additive.bonus_effect_lock)) {
					return true;
				}
				return false;
			} else {
				return true;
			}
		},
		"buildAdditives": function() {
			console.log("Building Additives...", this.active_targets);
			var channel = this.channel,
				always = 0,
				additive,
				keys,
				i;

			this.autoskipped.additives = false;
			this.additives.splice(0);
			keys = Object.keys(this.adding);
			for(i=0; i<keys.length; i++) {
				Vue.delete(this.adding, keys[i]);
			}

			for(i=0; i<this.available_additives.length; i++) {
				additive = this.available_additives[i];
				if(additive.additive_attack || (!additive.additive_attack_melee && !additive.additive_attack_range && !additive.additive_attack_spell) || (this.channel && ((additive.additive_attack_spell && this.channel._class === "spell") || (additive.additive_attack_melee && this.channel.melee) || (additive.additive_attack_range && this.channel.ranged)))) {
					if((!additive.damage_bonus_type_lock && !additive.bonus_type_lock && !additive.bonus_channel_lock && !additive.bonus_target_lock && !additive.bonus_effect_lock && !additive.bonus_lock_to_class && !additive.bonus_lock_to_ranged && !additive.bonus_lock_to_melee) ||
							(channel
							&& (!additive.damage_bonus_type_lock || (channel.damage[additive.damage_bonus_type_lock] || channel.damage_type === additive.damage_bonus_type_lock))
							&& (!additive.bonus_type_lock || channel.type === additive.bonus_type_lock || (channel.types && channel.types.indexOf(additive.bonus_type_lock) !== -1))
							&& (!additive.bonus_channel_lock || rsSystem.utility.hasParentalKey(channel, additive.bonus_channel_lock))
							&& (!additive.bonus_lock_to_class || channel._class === additive.bonus_lock_to_class)
							&& (!additive.bonus_lock_to_ranged || channel.ranged)
							&& (!additive.bonus_lock_to_melee || channel.melee)
							&& ((!additive.bonus_effect_lock && !additive.bonus_target_lock) || this.targetAdditiveApplies(additive))
							)) {
						if(!additive.additive_attack_charged || additive.charges > 0) {
							this.additives.push(additive);
							if(additive.additive_attack_always) {
								// this.adding[additive.id] = additive;
								this.toggleAdditive(additive);
								always++;
							}
						}
					}
				}
			}

			if(always === this.additives.length) {
				Vue.set(this, "quick_adds", true);
			} else {
				Vue.set(this, "quick_adds", false);
			}
			console.log("...Built Additives: ", this.additives);
		},
		"selectChannel": function(channel) {
			var target,
				source,
				field,
				keys,
				map,
				dmg,
				i,
				j;
			
			rsSystem.utility.clearObject(this.form_filters);
			this.form_fields.splice(0);
			Vue.set(this, "additives_locked", false);
			if(channel && channel._class === "spell" && (!channel || channel.level !== this.cast_level)) {
				channel = Object.assign({}, channel);
				if(channel.level && channel.level !== "0" /* Bug handling */ && this.cast_level > channel.level) {
					channel.level = this.cast_level;
				}
			}

			if(!this.channel || this.channel.id !== channel.id) {
				Vue.set(this, "channel_changed", true);
				this.actionsToTake.splice(0);
				Vue.set(this, "channel", channel);
			}

			if(channel && !this.isEmpty(channel.action_cost)) {
				Vue.set(this, "action_cost", channel.action_cost);
			} else if(this.action && !this.isEmpty(this.action.action_cost)) {
				Vue.set(this, "action_cost", this.action.action_cost);
			}
			
			this.available_damages.splice(0);
			if(channel) {
				if(channel.split_damage !== undefined && channel.split_damage !== null) {
					Vue.set(this, "splitDamage", !!channel.split_damage);
				} else if(channel.is_damage_split !== undefined && channel.is_damage_split !== null) {
					Vue.set(this, "splitDamage", !!channel.is_damage_split);
				}

				if(channel.melee || channel.ranged || channel.thrown) {
					Vue.set(this, "target_repetition", this.entity.attack_limit || 1);
					Vue.set(this, "target_limit", this.entity.attack_limit);
				} else if(channel.target_limit) {
					Vue.set(this, "target_repetition", channel.target_repetition || channel.target_limit);
					Vue.set(this, "target_limit", channel.target_limit);
				} else {
					Vue.set(this, "target_repetition", 1);
					Vue.set(this, "target_limit", 1);
				}

				source = [];
				if(rsSystem.utility.isNotEmpty(channel.damage)) {
					this.universe.transcribeInto(Object.keys(channel.damage), source);
				} else if(rsSystem.utility.isNotEmpty(channel.skill_damage)) {
					this.universe.transcribeInto(Object.keys(channel.skill_damage), source);
				} else {
					// This channel does no damage, likely simply passing on effects or noting a spell slot consumption
				}

				if(channel.form) {
					for(i=0; i<channel.form.length; i++) {
						field = channel.form[i];
						if(typeof(field) === "string") {
							map = this.universe.index.fields[field];
							if(map) {
								this.form_fields.push(map);
							} else {
								console.warn("Invalid Channel Data Field: ", field);
							}
						} else if(typeof(field) === "object") {
							this.form_fields.push(field);
						} else {
							console.warn("Invalid Channel Data Field: ", field, typeof(field));
						}
					}
				}
			} else {
				source = this.universe.listing.damage_type;
			}

			for(i=0; i<source.length; i++) {
				dmg = source[i];
				if(rsSystem.utility.isValid(dmg)) {
					this.available_damages.push(dmg);
				}
			}

			this.available_damages.sort(rsSystem.utility.sortData);
			// this.buildAdditives();
			this.goToNextSection();
		},
		"skillVantage": function(skill) {
			if(this.entity.skill_advantage && this.entity.skill_advantage[skill.id]) {
				if(this.entity.skill_advantage[skill.id] < 0) {
					return "disadvantage";
				} else if(this.entity.skill_advantage[skill.id] > 0) {
					return "advantage";
				}
			}
			return "";
		},
		"send": function() {
			var sending = {},
				action,
				damage,
				check,
				event,
				field,
				i,
				j;
			
			// Send Skill Checks
			sending.targeted_checks = {};
			sending.target_checks = {};
			sending.checks = [];
			sending.form = {};
			check = {};

			// Send Damage
			sending.additives = Object.keys(this.adding);
			if(this.channel) {
				sending.channel = this.channel.id;
				sending.using = this.channel.id;
				if(this.channel._class === "spell") {
					sending.spell_level = this.cast_level;
					sending.spell = this.channel.id;
				}
			}
			if(this.action) {
				sending.action = this.action.id;
			}
			if(this.action_cost) {
				sending.action_cost = this.action_cost;
			}
			if(this.entity) {
				sending.source = this.entity.id;
			}
			for(i=0; i<this.form_fields.length; i++) {
				field = this.form_fields[i].id;
				sending.form[field] = this.form[field];
			}
			
			for(i=0; i<this.actionsToTake.length; i++) {
				action = this.actionsToTake[i];
				event = Object.assign({}, sending);
				event.targets = [action.target.id];
				if(action.check) {
					event.checks = [];
					event.checks.push(check = {});
					check.result = action.check.roll.computed;
					check.channel = this.channel?this.channel.id:undefined;
					check.entity = this.entity?this.entity.id:undefined;
					check.name = action.skill.name;
					check.skill = action.skill.id;
					check.dice = action.check.roll.dice_rolls; // Legacy Support;
					check.roll = action.check.roll; // Future Support
					check.critical = action.check.roll.is_critical;
					check.failure = action.check.roll.is_failure;
					if(this.channel.dc) {
						check.difficulty = this.channel.dc;
					}
					this.universe.send("action:check", check);

					event.targeted_checks = {};
					event.targeted_checks[action.target.id] = check.result;
				}
				if(action.damages) {
					event.damage = {};
					event.result = {};
					for(j=0; j<action.damages.length; j++) {
						damage = action.damages[j];
						if(isNaN(damage.roll.computed)) {
							event.damage[damage.type.id] = event.result[damage.type.id] = damage.roll.computed;
						} else {
							event.damage[damage.type.id] = event.result[damage.type.id] = parseInt(damage.roll.computed);
						}
					}
				}

				if(this.details.action === "channel:use") {
					console.log("Use Event: ", _p(event));
					this.universe.send("channel:use", event);
				} else {
					switch(this.channel._class) {
						case "spell":
							this.universe.send("action:cast:spell", event);
							break;
						case "item":
							this.universe.send("action:damage:send", event);
							break;
						case "feat":
							this.universe.send("channel:use", event);
							break;
						default:
							this.universe.send("action:damage:send", event);
					}
				}
			}

			if(typeof(this.details.finished) === "function") {
				this.details.finished(sending);
			}
			this.closeDialog();
		},
		"addStat": function(stat) {
			if(this.focused_roll) {
				Vue.set(this.focused_roll, "computed", this.focused_roll.computed + stat.value);
			}
		},
		"addDie": function(die) {
			if(this.focused_roll) {
				this.focused_roll.add(die.id);
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/damage.html")
});