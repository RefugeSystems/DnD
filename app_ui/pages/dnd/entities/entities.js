
/**
 *
 *
 * @class DNDEntities
 * @constructor
 * @module Components
 */
rsSystem.component("DNDEntities", {
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
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"main": function() {
			if(this.player.gm && this.$route.query.entity) {
				return this.universe.index.entity[this.$route.query.entity];
			} else if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
		},
		"location": function() {
			if(this.main && this.main.location) {
				return this.universe.index.location[this.main.location];
			}
			return null;
		},
		"page": function() {
			if(this.main) {
				return this.universe.index.page[this.main.page];
			}
			return null;
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
		"skirmish": function() {
			var skirmish,
				i;

			for(i=0; i<this.universe.listing.skirmish.length; i++) {
				skirmish = this.universe.listing.skirmish[i];
				if(skirmish && skirmish.is_active && !skirmish.disabled && !skirmish.is_preview) {
					return skirmish;
				}
			}

			return null;
		},
		"entities": function() {
			var entities = [],
				played = [],
				entity,
				x;
				
			if(this.player && this.player.gm) {
				if(this.meeting) {
					for(x=0; x<this.meeting.entities.length; x++) {
						entity = this.universe.index.entity[this.meeting.entities[x]];
						if(entity && !entity.played_by) {
							entities.push(entity);
						}
					}
				}
			} else {
				for(x=0; x<this.universe.listing.entity.length; x++) {
					entity = this.universe.listing.entity[x];
					if(entity && !entity.disabled && entity.state !== "deceased" && !entity.is_preview && !entity.obscured && !entity.is_minion && entity.id !== this.player.attribute.playing_as) {
						if(entity.played_by === this.player.id) {
							played.push(entity);
						} else if(entity.owned && entity.owned[this.player.id]) {
							entities.push(entity);
						}
					}
				}
			}
			
			return played.concat(entities);
		},
		"nearby": function() {
			var entities = [],
				entity,	
				x;
			
			if(this.meeting && this.meeting.entities) {
				for(x=0; x<this.meeting.entities.length; x++) {
					entity = this.universe.index.entity[this.meeting.entities[x]];
					if(this.isShownEntity(entity)) {
						entities.uniquely(entity);
					}
				}
			}
			if(this.location && this.location.populace) {
				for(x=0; x<this.location.populace.length; x++) {
					entity = this.universe.index.entity[this.location.populace[x]];
					if(entity && entity.id !== this.main.id  && !entity.is_preview && !entity.disabled && !entity.obscured) {
						entities.uniquely(entity);
					}
				}
			}
			
			if(this.storage && this.storage.ctrl && this.storage.ctrl.list && this.storage.ctrl.list.atoz) {
				entities.sort(rsSystem.utility.sortByName);
			} else {
				entities.sort(rsSystem.utility.sortByInitiative);
			}
			return entities;
		},
		"controls": function() {
			var controls = [],
				load,
				i;

			controls.push({
				"icon": "fas fa-users",
				"title": "Include all nearby creatures in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "all"
			});
			controls.push({
				"icon": "fas fa-user-alt",
				"title": "Include yourself in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "self"
			});
			controls.push({
				"icon": "fas fa-sort-alpha-down",
				"title": "Toggle Alphabetical vs Initiative sorting for the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "atoz"
			});
			// if(this.skirmish) {
			// 	controls.push({
			// 		"icon": "fas fa-swords",
			// 		"ctrl": "list",
			// 		"type": "flip",
			// 		"id": "combat"
			// 	});
			// }
			controls.push({
				"icon": "fas fa-swords",
				"title": "Include hostile creatures in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "combat"
			});
			if(this.meeting && this.meeting.entities) {
				for(i=0; i<this.meeting.entities.length; i++) {
					load = this.universe.index.entity[this.meeting.entities[i]];
					if(load && !load.disabled && !load.obscured && !load.is_preview && load.is_chest) {
						controls.push({
							"icon": "fas fa-treasure-chest",
							"title": "Include treasure chests and other piles of items in the list of creatures nearby",
							"ctrl": "list",
							"type": "flip",
							"id": "treasure"
						});
					}
				}
			}
			controls.push({
				"icon": "fas fa-street-view",
				"title": "Include creatures at your location that may be slightly farther away but still, say, in the city in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "location"
			});
			controls.push({
				"icon": "fas fa-users-crown",
				"title": "Include creatures in your party in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "party"
			});
			controls.push({
				"icon": "fas fa-users-cog",
				"title": "Include near-by NPCs in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "npcs"
			});
			controls.push({
				"icon": "far fa-crosshairs",
				"title": "Include hostile creatures in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "hostile"
			});
			controls.push({
				"icon": "fas fa-store",
				"title": "Include stores in the list of creatures nearby",
				"ctrl": "list",
				"type": "flip",
				"id": "shop"
			});


			return controls;
		},
		"minion": function() {
			var entities = {},
				entity,	
				x;
			
			for(x=0; x<this.universe.listing.entity.length; x++) {
				entity = this.universe.listing.entity[x];
				if((entity.played_by === this.player.id || (this.main && entity.loyal_to.indexOf(this.main.id) !== -1)) && !entity.is_preview && !entity.disabled && entity.state !== "deceased" && !entity.obscured && entity.is_minion) {
					entities[entity.id] = true;
				}
			}
			
			return entities;
		}
	},
	"data": function() {
		var data = {};

		// TODO: Universe Setting? Better control of some sort. Also prevent players from easily gathering intel
		data.nearbyDashboard = this.universe.index.dashboard["dashboard:entity:nearby"];
		data.nearbyMinion = this.universe.index.dashboard["dashboard:entity:minion"];
		data.nearbyFriend = this.universe.index.dashboard["dashboard:entity:friendly"];

		data.notes = "";

		return data;
	},
	"watch": {
		"notes": function(notes, old) {
			if(this.page) {
				this.universe.send("page:update", {
					"page": this.page.id,
					"text": notes
				});
			}
		}
	},
	"mounted": function() {
		rsSystem.register(this);
		if(!this.storage.notes) {
			Vue.set(this.storage, "notes", {
				"state": true
			});
			this.toggleNotes();
		}
		if(!this.storage.ctrl) {
			Vue.set(this.storage, "ctrl", {
				"list": {
					"all": true
				}
			});
		}
		if(this.page) {
			Vue.set(this, "notes", this.page.description);
		}
	},
	"methods": {
		"processDrop": function(event) {
			var data = rsSystem.dragndrop.general.drop();
			if(data && (data = this.universe.getObject(data))) {
				Vue.set(this, "notes", this.notes + "{{" + data.name + ", " + data.id + "}}");
			}
			$("#player-note-page")[0].focus();
		},
		"createPlayer": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndCreateCharacterDialog",
				"storageKey": "createCharacterStorage",
				"id": "dndCreateCharacterDialog",
				"max_size": true
			});
		},
		"getNearbyDashboard": function(entity) {
			if(this.minion[entity.id]) {
				return this.nearbyMinion;
			} else if(entity.played_by) {
				return this.nearbyFriend;
			}

			return this.nearbyDashboard;
		},
		"getNearbyClasses": function(entity) {
			var classes = "";
			if(this.skirmish && this.skirmish.combat_turn === entity.id) {
				classes += "combat_turn ";
			}
			if(this.main && this.main.id === entity.id) {
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
		"toggleNotes": function(swap) {
			// TODO: Clean up open/swap logic
			if(swap) {
				if(!this.storage.notes.state) {
					Vue.set(this.storage.notes, "icon", "game-icon game-icon-tied-scroll");
					Vue.set(this.storage.notes, "state", true);
				}
				Vue.set(this.storage.notes, "swap", !this.storage.notes.swap);
			} else {
				if(this.storage.notes.state) {
					Vue.set(this.storage.notes, "icon", "game-icon game-icon-scroll-quill");
					Vue.set(this.storage.notes, "state", false);
				} else {
					Vue.set(this.storage.notes, "icon", "game-icon game-icon-tied-scroll");
					Vue.set(this.storage.notes, "state", true);
				}
			}
			var area;
			if(this.storage.notes.state) {
				area = "open";
				if(this.storage.notes.swap) {
					area += " swap";
				}
			} else {
				area = "closed";
			}
			Vue.set(this.storage.notes, "area", area);
		},
		"getControlClass": function(control) {
			var classes = "";

			if(this.storage && this.storage.ctrl) {
				if(this.storage.ctrl[control.ctrl] && this.storage.ctrl[control.ctrl][control.id]) {
					classes += " active-ctrl";
				}
			}

			return classes;
		},
		"fireControl": function(control) {
			switch(control.type) {
				case "flip":
					if(!this.storage.ctrl[control.ctrl]) {
						Vue.set(!this.storage.ctrl, control.ctrl, {});
					}
					Vue.set(this.storage.ctrl[control.ctrl], control.id, !this.storage.ctrl[control.ctrl][control.id]);
					break;
			}
		},
		"isShownEntity": function(entity) {
			if(entity && !entity.is_preview && !entity.disabled && !entity.obscured && this.storage.ctrl) {
				if(this.main && entity.id === this.main.id && this.storage.ctrl.list.self) {
					return true;
				}
				if(this.storage.ctrl.list.all && (!this.main || entity.id !== this.main.id)) {
					return true;
				}
				if(this.storage.ctrl.list.party && entity.played_by) {
					return true;
				}
				if(this.storage.ctrl.list.shop && entity.is_shop) {
					return true;
				}
				if(this.storage.ctrl.list.npcs && entity.is_npc) {
					return true;
				}
				if(this.storage.ctrl.list.treasure && entity.is_chest) {
					return true;
				}
				if(this.storage.ctrl.list.hostile && entity.is_hostile) {
					return true;
				}
				if(this.storage.ctrl.list.location && entity.location === this.main.location) {
					return true;
				}
				if(this.storage.ctrl.list.combat && typeof(entity.initiative) === "number") {
					return true;
				}
				// if(this.storage.ctrl.list.combat && this.skirmish && this.skirmish.entities && this.skirmish.entities.indexOf(entity.id) !== -1) {
				// 	return true;
				// }
			}
			return false;
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/entities.html")
});
