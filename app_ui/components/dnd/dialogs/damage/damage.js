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
				if(rsSystem.utility.isValid(target) && !filter[target.id]) {
					filter[target.id] = true;
					if(skip || !types || any || rsSystem.utility.hasCommonKey(types, target.types)) {
						this.ranging[target.id] = this.distanceTo(this.entity, target);
						if(this.ranging[target.id]) {
							this.ranging[target.id] = this.ranging[target.id];
						} else {
							this.ranging[target.id] = "";
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
		"available_damages": function() {
			var damages = [],
				source,
				damage,
				i;
			if(this.channel) {
				source = [];
				if(this.channel.damage || this.channel.skill_damage) {
					this.universe.transcribeInto(Object.keys(this.channel.damage || this.channel.skill_damage), source);
				}
			} else {
				source = this.universe.listing.damage_type;
			}
			for(i=0; i<source.length; i++) {
				damage = source[i];
				if(rsSystem.utility.isValid(damage)) {
					damages.push(damage);
				}
			}
			damages.sort(rsSystem.utility.sortData);
			return damages;
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
			"name": "Skill Checks",
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
			"name": "Review",
			"description": "page4",
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

		data.autoskipped = {};
		data.available_levels = [0];
		if(this.details.channel && this.details.channel.level) {
			data.cast_level = parseInt(this.details.channel.level) || 0;
		} else {
			data.cast_level = 0;
		}

		data.channel = this.details.channel || null;
		data.action = this.details.action || null;
		data.action_cost = null;
		data.targeting = this.details.targeting || {};
		data.ranging = {};
		data.roll_damage = this.details.roll_damage || {};
		data.send_damage = this.details.send_damage || {};
		data.raw_damage = this.details.raw_damage || {};
		data.damage_targets = [];
		data.active_targets = [];
		data.target_check = {};
		data.skill_checks = [];
		data.effects_self = [];
		data.damages = [];
		data.effects = [];
		data.channel_changed = false;
		data.targets_changed = false;
		data.splitDamage = this.details.splitDamage === undefined?false:!!this.details.splitDamage;

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
			if(this.targeting[target.id]) {
				Vue.delete(this.targeting, target.id);
			} else {
				Vue.set(this.targeting, target.id, target);
			}
			Vue.set(this, "targets_changed", true);
		},
		"completeRoll": function(section, id, formula) {
			
		},
		"finishSection": function(section) {
			// TODO: Validate Current
			var targets,
				check,
				i,
				j;

			switch(this.activeSection.id) {
				case "checks":
					for(i=0; i<this.skill_checks.length; i++) {
						check = this.skill_checks[i];
						if(check.target) {
							this.target_check[check.target.id] = check;
						}
						if(check.roll && check.roll.is_critical) {
							if(check.target) {
								for(j=0; j<this.available_damages.length; j++) {
									if(this.roll_damage[check.target.id][this.available_damages[j].id].dice_multiplier != 2) {
										this.roll_damage[check.target.id][this.available_damages[j].id].setDiceMultiplier(2);
									}
								}
							} else {
								for(j=0; j<this.available_damages.length; j++) {
									if(this.roll_damage[null][this.available_damages[j].id].dice_multiplier != 2) {
										this.roll_damage[null][this.available_damages[j].id].setDiceMultiplier(2);
									}
								}
							}
						} else {
							if(check.target) {
								for(j=0; j<this.available_damages.length; j++) {
									if(this.roll_damage[check.target.id][this.available_damages[j].id].dice_multiplier != 1) {
										this.roll_damage[check.target.id][this.available_damages[j].id].setDiceMultiplier(1);
									}
								}
							} else {
								for(j=0; j<this.available_damages.length; j++) {
									if(this.roll_damage[null][this.available_damages[j].id].dice_multiplier != 1) {
										this.roll_damage[null][this.available_damages[j].id].setDiceMultiplier(1);
									}
								}
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
						this.buildSkillChecks();
					}
					this.damage_targets.splice(0);
					if(this.splitDamage) {
						this.damage_targets.push.apply(this.damage_targets, targets);
					} else {
						this.damage_targets.push(null);
					}
					break;
				case "review":
					this.send();
					return false;
			}

			this.goToNextSection();
			return true;
		},
		"buildSkillChecks": function() {
			var targets,
				skill,
				i;

			this.skill_checks.splice(0);
			if(this.details.skill_checks) {
				for(i=0; i<this.details.skill_checks.length; i++) {
					skill = this.universe.index.skill[this.details.skill_checks[i]];
					if(rsSystem.utility.isValid(skill)) {
						this.skill_checks.push({
							"roll": new Roll({
								"entity": this.entity
							}),
							"skill": skill
						});
					}
				}
			}
			if(this.channel) {
				if((this.isWeapon(this.channel) || this.channel.cast_attack)) {
					targets = Object.keys(this.targeting);
					if(this.entity.main_weapon === this.channel.id) {
						skill = this.universe.index.skill["skill:mainhand"];
					} else {
						skill = this.universe.index.skill[this.channel.skill] || this.universe.index.skill["skill:offhand"];
					}
					if(skill) {
						for(i=0; i<targets.length; i++) {
							this.skill_checks.push({
								"roll": new Roll({
									"formula": "1d20 + " + (this.entity.skill_check[skill.id] || 0),
									"entity": this.entity
								}),
								"target": this.universe.getObject(targets[i]) || targets[i],
								"skill": skill
							});
						}
					} else {
						console.warn("Unable to find skill for channel: ", this.channel);
					}
				} else if(this.channel.dc_save && (skill = this.universe.index.skill[this.channel.dc_save])) {
					for(i=0; i<targets.length; i++) {
						this.skill_checks.push({
							"roll": new Roll({
								"formula": "1d20 + " + (this.entity.skill_check[skill.id] || 0),
								"entity": this.entity
							}),
							"target": this.universe.getObject(targets[i]) || targets[i],
							"skill": skill
						});
					}
				}
			}
		},
		"goToSection": function(section) {
			var targets,
				entity,
				effect,
				skill,
				slot,
				i;

			switch(section.id) {
				case "channel":
					console.log("Levels: ", _p(this.entity.spell_slots));
					this.available_levels.splice(1);
					if(this.entity && this.entity.spell_slots) {
						// TODO: Build Out spell levels for selection of the cast
						for(slot in this.entity.spell_slots) {
							if(this.entity.spell_slots[slot] > 0) {
								this.available_levels.push(slot);
							}
						}
					}
					break;
				case "checks":
					if(this.skill_checks.length === 0 && !this.autoskipped[this.activeSection.id]) {
						this.autoskipped[this.activeSection.id] = true;
						setTimeout(() => {
							this.goToNextSection();
						});
					} else if(this.profile && this.profile.auto_roll && this.profile.auto_submit) {
						setTimeout(() => {
							this.goToNextSection();
						});
					}
					break;
				case "targets":
					if(this.available_targets.length === 0 && !this.autoskipped[this.activeSection.id]) {
						this.autoskipped[this.activeSection.id] = true;
						setTimeout(() => {
							this.goToNextSection();
						});
					}
					break;
				case "damage":
					if(this.channel) {
						if(this.available_damages.length === 0 && !this.autoskipped[this.activeSection.id]) {
							this.autoskipped[this.activeSection.id] = true;
							setTimeout(() => {
								this.goToNextSection();
							});
						} else if(this.profile && this.profile.auto_roll && this.profile.auto_submit) {
							setTimeout(() => {
								this.goToNextSection();
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
					if(!this.autoskipped[this.activeSection.id] && ((this.effects.length === 0 && this.effects_self.length === 0) || this.channel)) {
						this.autoskipped[this.activeSection.id] = true;
						setTimeout(() => {
							this.goToNextSection();
						});
					} else if(this.profile && this.profile.auto_roll && this.profile.auto_submit) {
						setTimeout(() => {
							this.goToNextSection();
						});
					}
					break;
				case "review":
					if(this.profile && this.profile.auto_submit) {
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
		"selectChannel": function(channel) {
			var target,
				keys,
				map,
				dmg,
				i,
				j;
			
			Vue.set(this, "channel_changed", true);
			if(channel && channel._class === "spell" && (!channel || channel.level !== this.cast_level)) {
				channel = Object.assign({}, channel);
				if(channel.level && channel.level !== "0" /* Bug handling */ && this.cast_level > channel.level) {
					channel.level = this.cast_level;
				}
			}

			if(this.channel != channel) {
				// Clear out damage data from previous channel
				keys = Object.keys(this.roll_damage[null]);
				for(i=0; i<keys.length; i++) {
					this.roll_damage[null][keys[i]].clear();
				}
				Vue.set(this, "channel", channel);
			}

			// Build New Rolls objects for damage
			if(channel && (channel.skill_damage || channel.damage)) {
				map = channel._formula || {};
				keys = Object.keys(map = map.skill_damage || map.damage || channel.skill_damage || channel.damage);
				for(i=0; i<keys.length; i++) {
					dmg = keys[i];
					this.roll_damage[null][dmg].setFormula(rsSystem.dnd.reducedDiceRoll(map[dmg], channel));
					this.roll_damage[null][dmg].setSource(channel);
					for(j=0; j<this.available_targets.length; j++) {
						target = this.available_targets[j].id;
						this.roll_damage[target][dmg].setFormula(rsSystem.dnd.reducedDiceRoll(map[dmg], channel));
						this.roll_damage[target][dmg].setSource(channel);
					}
				}
			} else {
				for(i=0; i<this.universe.listing.damage_type.length; i++) {
					dmg = this.universe.listing.damage_type[i];
					this.roll_damage[null][dmg.id].setFormula("");
					this.roll_damage[null][keys[i]].setSource(null);
					for(j=0; j<this.available_targets.length; j++) {
						target = this.available_targets[j].id;
						this.roll_damage[target][dmg].setFormula("");
						this.roll_damage[target][dmg].setSource(null);
					}
				}
			}

			if(channel && !this.isEmpty(channel.action_cost)) {
				Vue.set(this, "action_cost", channel.action_cost);
			} else if(this.action && !this.isEmpty(this.action.action_cost)) {
				Vue.set(this, "action_cost", this.action.action_cost);
			}
			
			if(channel) {
				if(channel.split_damage !== undefined && channel.split_damage !== null) {
					Vue.set(this, "splitDamage", !!channel.split_damage);
				} else if(channel.is_damage_split !== undefined && channel.is_damage_split !== null) {
					Vue.set(this, "splitDamage", !!channel.is_damage_split);
				}
			}
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
				check,
				buffer,
				load,
				i;
			
			// Send Skill Checks
			sending.target_checks = {};
			sending.checks = [];
			check = {};
			for(i=0; i<this.skill_checks.length; i++) {
				load = this.skill_checks[i];
				if(load.target) {
					buffer = sending.target_checks[load.target.id || load.target];
					if(!buffer) {
						buffer = sending.target_checks[load.target.id || load.target] = {};
					}
					buffer[load.skill.id] = parseInt(load.roll.computed) || 0;
					check.target = load.target.id;
				}
				sending.checks.push(check);
				check.result = load.roll.computed;
				check.channel = this.channel?this.channel.id:undefined;
				check.entity = this.entity?this.entity.id:undefined;
				check.name = load.skill.name;
				check.skill = load.skill.id;
				check.dice = load.roll.dice_rolls; // Legacy Support;
				check.roll = load.roll; // Future Support
				check.critical = load.roll.is_critical;
				check.failure = load.roll.is_failure;
				this.universe.send("action:check", check);
			}

			// Send Damage
			sending = {};
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

			if(this.splitDamage) {
				this.damage_targets.forEach((target) => {
					var event = Object.assign({}, sending);
				
					event.targets = [target];
					if(this.available_damages.length) {
						event.damage = {};
						event.result = {};
						for(i=0; i<this.available_damages.length; i++) {
							load = this.available_damages[i].id;
							if(this.roll_damage[target][load] && this.roll_damage[target][load].computed) {
								event.result[load] = event.damage[load] = this.roll_damage[target][load].computed;
							}
						}
					}

					if(this.details.action === "channel:use" || this.isEmpty(event.damage)) {
						this.universe.send("channel:use", event);
					} else {
						if(this.channel && this.channel._class === "spell") {
							this.universe.send("action:cast:spell", event);
						} else {
							this.universe.send("action:damage:send", event);
						}
					}
				});
			} else {
				if(!this.isEmpty(this.targeting)) {
					sending.targets = Object.keys(this.targeting);
				}

				if(this.available_damages.length) {
					sending.damage = {};
					sending.result = {};
					for(i=0; i<this.available_damages.length; i++) {
						load = this.available_damages[i].id;
						if(this.roll_damage[null][load] && this.roll_damage[null][load].computed) {
							sending.result[load] = sending.damage[load] = this.roll_damage[null][load].computed;
						}
					}
				}

				if(this.details.action === "channel:use" || this.isEmpty(sending.damage)) {
					this.universe.send("channel:use", sending);
				} else {
					if(this.channel && this.channel._class === "spell") {
						this.universe.send("action:cast:spell", sending);
					} else {
						this.universe.send("action:damage:send", sending);
					}
				}
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