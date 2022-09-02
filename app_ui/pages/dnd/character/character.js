/**
 *
 *
 * @class DNDCharacter
 * @constructor
 * @module Components
 */
rsSystem.component("DNDCharacter", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"configuration": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"computed": {
		"nearby": function() {
			var entities = [],
				entity,	
				x;
			
			if(this.meeting && this.meeting.entities) {
				for(x=0; x<this.meeting.entities.length; x++) {
					entity = this.universe.index.entity[this.meeting.entities[x]];
					if(rsSystem.utility.isValid(entity)) {
						entities.uniquely(entity);
					}
				}
			}
			if(this.location && this.location.populace) {
				for(x=0; x<this.location.populace.length; x++) {
					entity = this.universe.index.entity[this.location.populace[x]];
					if(entity && entity.id !== this.entity.id  && !entity.is_preview && !entity.disabled && !entity.obscured) {
						entities.uniquely(entity);
					}
				}
			}
			
			entities.sort(rsSystem.utility.sortByName);
			return entities;
		},
		"location": function() {
			if(this.entity && this.entity.location) {
				return this.universe.index.location[this.entity.location];
			}
			return null;
		},
		"skirmish": function() {
			var skirmish,
				i;
			for(i=0; i<this.universe.listing.skirmish.length; i++) {
				skirmish = this.universe.listing.skirmish[i];
				if(skirmish && !skirmish.is_preview && !skirmish.disabled && skirmish.is_active) {
					return skirmish;
				}
			}
			return null;
		},
		"entity": function() {
			if(this.player.gm && this.$route.query.entity) {
				return this.universe.index.entity[this.$route.query.entity];
			} else if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
		}
	},
	"watch": {
		"skirmish": function() {
			this.updateSkirmish();
		}
	},
	"data": function() {
		var reference = this,
			data = {};

		data.nearbyDashboard = this.universe.index.dashboard["dashboard:entity:nearby"];
		data.nearbyMinion = this.universe.index.dashboard["dashboard:entity:minion"];
		data.nearbyFriend = this.universe.index.dashboard["dashboard:entity:friendly"];

		data.meeting = this.universe.index.setting["setting:meeting"];
		if(data.meeting) {
			data.meeting = this.universe.index.meeting[data.meeting.value];
		}
		data.minions = [];

		data.initiativeSubicon = {};
		data.initiativeClass = "";
		data.initiatives = [];

		data.widget = {};
		data.widget.spell_list = {
		};
		data.widget.inventory = {};
		data.widget.knowledge = {};
		data.widget.equipment = {
			"no_divider": true
		};
		data.widget.actions = {
			"attribute": {
				"show_non_combat": true
			}
		};
		data.widget.effects = {
			"no_divider": true
		};
		data.widget.skills = {};
		data.widget.spells = {
			"attribute": {
				"spell_list_height": "600px"
			}
		};
		data.widget.broad = {};
		data.widget.feats = {
			"no_divider": true
		};
		data.widget.scratch = {
			"title": "Scratch Pad",
			"no_divider": true,
			"page_field": "scratch_page",
			"no_controls": true,
			"height": "200px"
		};
		data.widget.notes = {};
		data.widget.dice = {};
		data.widget.name = {};

		data.storage = {};
		data.storage.spell_list = {};
		data.storage.equipment = {};
		data.storage.inventory = {};
		data.storage.knowledge = {};
		data.storage.actions = {};
		data.storage.effects = {};
		data.storage.scratch = {};
		data.storage.skills = {};
		data.storage.spells = {};
		data.storage.broad = {};
		data.storage.feats = {};
		data.storage.notes = {};
		data.storage.dice = {};
		data.storage.name = {};


		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		window.onresize = () => {
			this.updateTableContainers();
		};

		this.universe.$on("updated", this.checkUpdate);
		this.updateTableContainers();
		this.updateSkirmish();
		this.updateMinions();
	},
	"methods": {
		"scrollTo": function(marker) {
			if(this.$refs[marker]) {
				this.$refs.infocon.scrollLeft = this.$refs[marker].offsetLeft - 420; // Appears to need the main column removed // TODO: Fix Adjustment to use actual offset instead of fudging and using grid alignment
			}
		},
		"checkLeft": function(event) {
			// console.log("Check Left Event: ", this.$refs.infocon.scrollLeft);
			if(this.$refs.infocon.scrollLeft === 0 && this.widget.broad.show_home) {
				Vue.set(this.widget.broad, "show_home", false);
			} else if(!this.widget.broad.show_home) {
				Vue.set(this.widget.broad, "show_home", true);
			}
		},
		"scrollHome": function() {
			this.$refs.infocon.scrollLeft = 0;
		},
		"scrollWheel": function(event) {
			if(event.path[0] == this.$refs.infocon) {
				/*
				var offset = this.$refs.infocon.scrollLeft,
					width = 60,
					direction = event.deltaY > 0?1:-1,
					add = direction * width;
				offset += add;
				this.$refs.infocon.scrollLeft = offset;
				*/
				if(event.deltaY > 0) {
					this.$refs.infocon.scrollLeft += 420;
				} else if(event.deltaY < 0) {
					this.$refs.infocon.scrollLeft -= 420;
				}
			}
		},
		"initiativeActive": function(entity) {
			return this.skirmish.combat_turn === entity.id || this.entity.id === entity.id;
		},
		"initiativeColor": function(entity) {
			if(this.skirmish.combat_turn === entity.id) {
				return "orange";
			} else if(this.entity.id === entity.id) {
				return "blue";
			} else if(entity.is_hostile) {
				return "red";
			} else if(entity.is_npc) {
				return "blue";
			}
			return "";
		},
		"getNearbyDashboard": function(entity) {
			// if(entity.is_minion) {
			// 	return this.nearbyMinion;
			// } else if(entity.played_by) {
			// 	return this.nearbyFriend;
			// }
			return this.nearbyDashboard;
		},
		"getNearbyClasses": function(entity) {
			var classes = "";
			if(this.skirmish && this.skirmish.combat_turn === entity.id) {
				classes += "combat_turn ";
			}
			if(this.entity && this.entity.id === entity.id) {
				classes += "self ";
			}
			if(entity.is_hostile) {
				classes += "hostile ";
			}
			if(entity.is_npc) {
				classes += "npc ";
			}
			return classes;
		},
		"updateTableContainers": function() {
			var tables = document.getElementsByClassName("character-table-container"),
				width = this.$refs.infocon.clientWidth,
				i;
			for(i=0; i<tables.length; i++) {
				tables[i].style.width = width + "px";
			}
		},
		"getSubIcon": function(entity) {
			if(this.entity.id === entity.id) {
				return "fa-solid fa-gamepad-modern";
			} else if(entity.is_hostile) {
				return "fa-solid fa-swords";
			} else if(entity.is_npc) {
				return null;
			}
			return null;
		},
		"updateMinions": function() {
			var entity,
				i;
			
			this.minions.splice(0);
			if(this.meeting && this.meeting.entities && this.meeting.entities.length) {
				for(i=0; i<this.meeting.entities.length; i++) {
					entity = this.universe.index.entity[this.meeting.entities[i]];
					if(rsSystem.utility.isValid(entity) && entity.is_minion && (entity.character === this.entity.id || (entity.loyal_to && entity.loyal_to[this.entity.id]))) {
						this.minions.push(entity);
					}
				}
			}
		},
		"updateSkirmish": function() {
			var entity,
				i;
			this.initiatives.splice(0);
			if(this.skirmish && this.skirmish.entities) {
				for(i=0; i<this.skirmish.entities.length; i++) {
					entity = this.universe.index.entity[this.skirmish.entities[i]];
					if(rsSystem.utility.isValid(entity)) {
						this.initiatives.push(entity);
						this.initiativeSubicon[entity.id] = this.getSubIcon(entity);
					}
				}
			}
			this.initiatives.sort(rsSystem.utility.sortByInitiative);
		},
		"checkUpdate": function(event) {
			if(event) {
				switch(event._class) {
					case "skirmish":
						if(this.skirmish) {
							if(event.id === this.skirmish.id ) {
								if(event.is_active) {
									this.updateSkirmish();
								} else {
									Vue.set(this, "skimish", null);
								}
							}
						} else if(event.is_active) {
							Vue.set(this, "skirmish", event);
							this.updateSkirmish();
						}
						break;
					case "entity":
						if(this.skirmish && this.skirmish.entities && this.skirmish.entities.indexOf(event.id) !== -1) {
							this.updateSkirmish();
						}
						if(this.meeting) {
							this.updateMinions();
						}
						break;
					case "meeting":
						if(this.meeting) {
							if(this.meeting.id === event.id) {
								this.updateMinions();
							}
						} else if(event.is_active) {
							Vue.set(this, "meeting", event);
						}
				}
			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.checkUpdate);
		window.onresize = null;
	},
	"template": Vue.templified("pages/dnd/character.html")
});
