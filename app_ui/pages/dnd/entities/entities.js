
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
			if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
		},
		"location": function() {
			if(this.main && this.main.location) {
				return this.universe.index.location[this.main.location];
			}
		},
		"page": function() {	
			return this.universe.index.page[this.player.attribute.notes_page];
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
			var entities = [],
				entity,
				x;
				
			
			for(x=0; x<this.universe.listing.entity.length; x++) {
				entity = this.universe.listing.entity[x];
				if(entity.played_by === this.player.id && !entity.disabled && entity.state !== "deceased" && !entity.is_preview && !entity.obscured && !entity.is_minion && entity.id !== this.player.attribute.playing_as) {
					entities.uniquely(entity);
				}
			}
			
			return entities;
		},
		"nearby": function() {
			var entities = [],
				entity,	
				x;
			
			if(this.meeting && this.meeting.entities) {
				for(x=0; x<this.meeting.entities.length; x++) {
					entity = this.universe.index.entity[this.meeting.entities[x]];
					if(entity && (!this.main || entity.id !== this.main.id) && !entity.is_preview && !entity.disabled && !entity.obscured) {
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
			
			return entities;
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

		data.controls = [];
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
		"fireControl": function(control) {

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
