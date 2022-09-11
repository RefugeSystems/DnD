/**
 *
 *
 * @class dndCharacterLevelDialog
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndCharacterLevelDialog", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DialogController,
		rsSystem.components.RSCore
	],
	"props": {
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"computed": {
		"corpus": function() {
			var limit = {};
			return limit;
		},
		"limit": function() {
			var limit = {};
			return limit;
		}
	},
	"data": function() {
		var data = {},
			map = {},
			noExclusive,
			archetype,
			add,
			i,
			j;
		
		this.entity = this.universe.index.entity[this.details.entity];
		data.sections = ["class", "subclass", "hp", "customizations"];
		data.completed = 0;
		data.sectionInfo = {
			"class": {
				"name": "Class",
				"icon": "fas fa-user-crown",
				"completed": false
			},
			"subclass": {
				"name": "Subclass",
				"icon": "fas fa-user-graduate",
				"completed": false
			},
			"hp": {
				"name": "HP",
				"icon": "fas fa-dice",
				"completed": false
			},
			"customizations": {
				"name": "Customizations",
				"icon": "fas fa-edit",
				"completed": false
			}
		};
		data.toLevel = this.details.level;
		data.availableSubclasses = [];
		data.availableClasses = [];
		data.customizations = [];
		data.complete = false;
		data.archetype = null;
		data.section = "class";
		data.hitDie = "d0";
		data.building = {};
		data.hp = 0;

		// Some aspects may require specific feats or slots as well; This is essentially matching the needs column
		if(this.entity.archetypes) {
			for(i=0; i<this.entity.archetypes.length; i++) {
				map[this.entity.archetypes[i]] = true;
			}
		}
		if(this.entity.feats) {
			for(i=0; i<this.entity.feats.length; i++) {
				map[this.entity.feats[i]] = true;
			}
		}
		if(this.entity.slots) {
			for(i=0; i<this.entity.slots.length; i++) {
				map[this.entity.slots[i]] = true;
			}
		}

		noExclusive = function(archetype) {
			if(archetype.exclusives) {
				for(var i=0; i<archetype.exclusives.length; i++) {
					if(map[archetype.exclusives[i]]) {
						return false;
					}
				}
			}
			return true;
		};

		for(i=0; i<this.universe.listing.archetype.length; i++) {
			archetype = this.universe.listing.archetype[i];
			if(archetype && archetype.playable && !archetype.obscured && !archetype.disabled && !archetype.is_preview && !archetype.is_disabled && !archetype.subclassing && this.archetypeExclusionClear(archetype, map) && this.entity.archetypes.indexOf(archetype.id) === -1) {
				if(archetype.root || archetype.is_root) {
					data.availableClasses.push(archetype);
				} else if(this.archetypeNeedsMet(archetype, map)) {
					data.availableClasses.push(archetype);
				}
			}
		}

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"archetypeExclusionClear": function(archetype, map) {
			if(archetype.exclusives) {
				for(var i=0; i<archetype.exclusives.length; i++) {
					if(map[archetype.exclusives[i]]) {
						return false;
					}
				}
			}
			return true;
		},
		"archetypeNeedsMet": function(archetype, map) {
			var needs,
				met,
				j;

			if(archetype.needs) {
				needs = Object.keys(archetype.needs);
				met = true;
				for(j=0; j<needs.length; j++) {
					if(!map[needs[j]]) {
						return false;
					}
				}
			}
			return true;
		},
		"panelClassing": function(archetype) {
			var classes = [];
			if(archetype && this.entity.archetypes.indexOf(archetype.id) !== -1) {
				classes.push("has-class");
			}
			if((this.sectionInfo.class.archetype && this.sectionInfo.class.archetype.id === archetype.id) || (this.sectionInfo.subclass.archetype && this.sectionInfo.subclass.archetype.id === archetype.id)) {
				classes.push("panel-current");
			}
			return classes;
		},
		"getTabStyle": function(section) {
			var classes = "";
			if(this.section === section) {
				classes += "active ";
			}
			if(this.sectionInfo[section].completed) {
				classes += "completed ";
			}
			return classes;
		},
		"getTabIcon": function(section) {
			if(this.sectionInfo[section].completed) {
				return "rs-light-green fas fa-check";
			}
			return this.sectionInfo[section].icon;
		},
		"chooseClass": function(archetype) {
			console.log("Choose Class: ", archetype);
			if(!this.sectionInfo.class.archetype || this.sectionInfo.class.archetype.id !== archetype.id) {
				Vue.set(this.sectionInfo.subclass, "archetype", null);
				Vue.set(this.sectionInfo.subclass, "completed", false);
				Vue.set(this.sectionInfo.hp, "amount", 0);
				Vue.set(this.sectionInfo.hp, "completed", false);
				Vue.set(this.sectionInfo.customizations, "completed", false);
			}
			Vue.set(this.sectionInfo.class, "archetype", archetype);
			Vue.set(this, "hitDie", Object.keys(archetype.hit_dice_max)[0]);
			this.nextSection();
		},
		"chooseSubclass": function(archetype) {
			console.log("Choose Subclass: ", archetype);
			if(!this.sectionInfo.subclass.archetype || this.sectionInfo.subclass.archetype.id !== archetype.id) {
				Vue.set(this.sectionInfo.customizations, "completed", false);
			}
			Vue.set(this.sectionInfo.subclass, "archetype", archetype);
			this.nextSection();
		},
		"hpSet": function() {
			if(this.sectionInfo.hp.amount) {
				this.nextSection();
			}
		},
		"hpRoll": function() {
			if(this.hitDie && !this.sectionInfo.hp.amount) {
				Vue.set(this.sectionInfo.hp, "amount", Random.integer(parseInt(this.hitDie.substring(1)), 1));
			}
		},
		"blockSelected": function(block) {
			this.finishSection("customizations");
			if(this.sectionInfo.customizations.completed) {
				this.nextSection();
			}
		},
		"nextSection": function() {
			var index = this.sections.indexOf(this.section),
				i;
			
			// this.finishSection(this.section);
			this.changeSection(this.sections[index + 1]);
		},
		"getMax": function(...of) {
			if(of && of.length) {
				var max = parseInt(of[0][0]) || 0,
					c,
					i,
					j;
					
				for(i=0; i<of.length; i++) {
					for(j=0; j<of[i].length; j++) {
						c = parseInt(of[i][j]);
						if(typeof(c) === "number" && max < c) {
							max = c;
						}
					}
				}

				return max;
			}
			return 0;
		},
		"changeSection": function(section) {
			this.finishSection(this.section);
			var map = {},
				archetype,
				subarch,
				custom,
				add,
				max,
				i,
				j;

			switch(section) {
				case "subclass":
					// Some aspects may require specific feats or slots as well; This is essentially matching the needs column
					if(this.entity.archetypes) {
						for(i=0; i<this.entity.archetypes.length; i++) {
							map[this.entity.archetypes[i]] = true;
						}
					}
					if(this.entity.feats) {
						for(i=0; i<this.entity.feats.length; i++) {
							map[this.entity.feats[i]] = true;
						}
					}
					if(this.entity.slots) {
						for(i=0; i<this.entity.slots.length; i++) {
							map[this.entity.slots[i]] = true;
						}
					}
					if(this.sectionInfo.class.archetype) {
						map[this.sectionInfo.class.archetype.id] = true;
					}

					this.availableSubclasses.splice(0);
					for(i=0; i<this.universe.listing.archetype.length; i++) {
						archetype = this.universe.listing.archetype[i];
						if(archetype && archetype.playable && !archetype.disabled && !archetype.obscured && !archetype.is_preview && !archetype.is_disabled && archetype.subclassing && map[archetype.subclassing] && this.archetypeExclusionClear(archetype, map) && (!archetype.required_level || this.toLevel >= archetype.required_level)) {
							if(archetype.root || archetype.is_root) {
								this.availableSubclasses.push(archetype);
							} else if(this.archetypeNeedsMet(archetype, map)) {
								this.availableSubclasses.push(archetype);
							}
						}
					}
					if(this.availableSubclasses.length === 0) {
						console.warn("No Subclasses");
						if(!this.sectionInfo.subclass.completed) {
							setTimeout(this.nextSection, 0);
						}
					} else {
						
					}
					break;
				case "hp":
					if(this.sectionInfo["class"].archetype && this.profile.auto_roll) {
						Vue.set(this.sectionInfo.hp, "amount", rsSystem.dnd.diceRoll(Object.keys(this.sectionInfo["class"].archetype.hit_dice_max)[0]));
						if(this.sectionInfo.hp.amount === 1) {
							Vue.set(this.sectionInfo.hp, "amount", rsSystem.dnd.diceRoll(Object.keys(this.sectionInfo["class"].archetype.hit_dice_max)[0]));
							this.sectionInfo.hp.comment = "Initial roll of `1` was automatically re-rolled";
						}
					}
					break;
				case "customizations":
					this.customizations.splice(0);
					if(this.sectionInfo.class.archetype) {
						if(this.sectionInfo.subclass.archetype) {
							max = this.getMax(Object.keys(this.entity.spell_slot_max), Object.keys(this.sectionInfo.class.archetype.spell_slot_max), Object.keys(this.sectionInfo.subclass.archetype.spell_slot_max));
						} else {
							max = this.getMax(Object.keys(this.entity.spell_slot_max), Object.keys(this.sectionInfo.class.archetype.spell_slot_max));
						}
						archetype = this.sectionInfo.class.archetype;
						if(archetype && archetype.selection) {
							for(i=0; i<archetype.selection.length; i++) {
								custom = Object.assign({}, archetype.selection[i]);
								custom.entity = this.entity.id;
								custom.spell_level = max;
								this.customizations.push(custom);
							}
						}
						archetype = this.sectionInfo.subclass.archetype;
						if(archetype && archetype.selection) {
							for(i=0; i<archetype.selection.length; i++) {
								custom = Object.assign({}, archetype.selection[i]);
								custom.entity = this.entity.id;
								custom.spell_level = max;
								this.customizations.push(custom);
							}
						}
						if(this.customizations.length === 0) {
							console.warn("No Customizations");
							if(!this.sectionInfo.customizations.completed) {
								setTimeout(this.nextSection, 0);
							}
						}
						break;
					}
			}
			Vue.set(this, "section", section);
		},
		"finishSection": function(section) {
			var completed,
				i;

			switch(section) {
				case "class":
					if(this.sectionInfo["class"].archetype) {
						this.sectionInfo["class"].completed = true;
					}
					break;
				case "subclass":
					if(this.availableSubclasses.length === 0 || this.sectionInfo["subclass"].archetype) {
						this.sectionInfo["subclass"].completed = true;
					}
					break;
				case "hp":
					if(this.sectionInfo["hp"].amount) {
						this.sectionInfo["hp"].completed = true;
					}
					break;
				case "customizations":
					completed = true;
					for(i=0; completed && i<this.customizations.length; i++) {
						if(!this.customizations[i]._completed) {
							completed = false;
						}
					}
					this.sectionInfo.customizations.completed = completed;
					break;
			}

			completed = 0;
			for(i=0; i<this.sections.length; i++) {
				if(this.sectionInfo[this.sections[i]].completed) {
					completed += 1;
				}
			}
			Vue.set(this, "completed", completed);
		},
		"levelUp": function() {
			var level = {},
				custom,
				i;

			level.entity = this.entity.id;
			level.to_level = this.toLevel;
			level.archetypes = [this.sectionInfo.class.archetype.id];
			level.hp_rolled = this.sectionInfo.hp.amount;
			if(this.sectionInfo.subclass.archetype) {
				level.archetypes.push(this.sectionInfo.subclass.archetype.id);
			}
			for(i=0; i<this.customizations.length; i++) {
				custom = this.customizations[i];
				if(custom) {
					if(!level[custom.field]) {
						level[custom.field] = [];
					}
					level[custom.field] = level[custom.field].concat(custom._selected);
				}
			}
			console.log("Level Up: ", level);
			this.universe.send("entity:level", level);
			this.closeDialog();
		}
	},
	"beforeDestroy": function() {
		
	},
	"template": Vue.templified("components/dnd/dialogs/creation/level.html")
});