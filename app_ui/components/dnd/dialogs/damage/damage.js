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
			var exclusions = {};
			if(this.mainhand) {
				exclusions[this.mainhand.id] = true;
			}
			return this.buildAvailableChannel(this.entity.equipped, exclusions);
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
				target,
				i;

			if(this.channel && this.channel.targets) {
				for(i=0; i<this.channel.targets.length; i++) {
					types[this.channel.targets[i]] = true;
				}
			}
			if(rsSystem.utility.isEmpty(types)) {
				types = null;
			}

			if(this.meeting) {
				for(i=0; i<this.meeting.entities.length; i++) {
					target = this.universe.index.entity[this.meeting.entities[i]];
					if(rsSystem.utility.isValid(target) && !filter[target.id]) {
						filter[target.id] = true;
						if(!types || rsSystem.utility.hasCommonKey(types, target.types)) {
							targets.push(target);
						}
					}
				}
			}

			if(this.skirmish) {
				for(i=0; i<this.skirmish.entities.length; i++) {
					target = this.universe.index.entity[this.skirmish.entities[i]];
					if(rsSystem.utility.isValid(target) && !filter[target.id]) {
						filter[target.id] = true;
						if(!types || rsSystem.utility.hasCommonKey(types, target.types)) {
							targets.push(target);
						}
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
			dmg,
			i;

		data.sections = [{
			"name": "Channel",
			"description": "Select how you are dealing the damage or healing, such as a spell, weapon, or through a feat."
		}, {
			"name": "Targets",
			"description": "Select the targets of your damage"
		}, {
			"name": "Skill Checks",
			"description": "Indicate skills that are being performed and enter the values you rolled"
		}, {
		// 	"name": "Saves",
		// 	"description": "Indicate any effects that you are imparting on the targets as a result of this damage. The effects will track whether damage needs dealt or any save needs passed."
		// }, {
			"name": "Damage",
			"description": "Select damage that is being dealt to the specified targets."
		}, {
			"name": "Effects",
			"description": "Indicate any effects that you are imparting on the targets as a result of this damage. The effects will track whether damage needs dealt or any save needs passed."
		}, {
			"name": "Review",
			"description": "page4"
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
				"icon": this.universe.index.skill["skill:" + items[i]].icon,
				"name": items[i].capitalize(),
				"id": items[i].substring(0,3),
				"value": isNaN(this.details.entity[items[i]])?0:this.details.entity[items[i]] || 0
			});
		}

		items = ["d20", "d12", "d10", "d8", "d6", "d4"];
		data.dice = [{
			"icon": "fa-duotone fa-dice-d10",
			"name": "d100",
			"id": "d100",
			"sides": 100
		}];
		for(i=0; i<items.length; i++) {
			data.dice.push({
				"icon": "fa-solid fa-dice-" + items[i],
				"name": items[i],
				"id": items[i],
				"sides": parseInt(items[i].substring(1))
			});
		}

		data.focused_roll = null;
		data.show_spells = false;
		data.show_feats = false;

		data.channel = this.details.channel || null;
		data.targeting = this.details.targeting || {};
		data.effects = this.details.effects || [];
		data.roll_damage = this.details.roll_damage || {};
		data.send_damage = this.details.send_damage || {};
		data.raw_damage = this.details.raw_damage || {};

		for(i=0; i<this.universe.listing.damage_type.length; i++) {
			dmg = this.universe.listing.damage_type[i];
			data.roll_damage[dmg.id] = new Roll();
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
	},
	"methods": {
		"setFocus": function(roll) {
			console.log("Focus Roll: ", roll);
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
			Vue.set(this.targeting, target.id, !this.targeting[target.id]);
		},
		"completeRoll": function(section, id, formula) {
			
		},
		"finishSection": function(section) {
			// TODO: Validate Current
			var next = this.sections[section.index + 1];

			if(next) {
				Vue.set(this, "activeSection", next);
				this.prepared.push(next);
			}
		},
		"goToSection": function(section) {
			var i;
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
		"selectChannel": function(channel) {
			Vue.set(this, "channel", channel);
			var keys,
				map,
				dmg,
				i;

			if(channel && (channel.skill_damage || channel.damage)) {
				keys = Object.keys(channel.skill_damage || channel.damage);
				for(i=0; i<keys.length; i++) {
					Vue.set(this.roll_damage[keys[i]], "formula", map[keys[i]]);
				}
			} else {
				for(i=0; i<this.universe.listing.damage_type.length; i++) {
					dmg = this.universe.listing.damage_type[i];
					Vue.set(this.roll_damage[dmg.id], "formula", "");
				}
			}
			this.goToNextSection();
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