/**
 *
 *
 * @class DNDMasterScreen
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMasterScreen", {
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
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
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
		"availableSpells": function() {
			var available = [],
				buffer,
				i;
			for(i=0; i<this.universe.listing.spell.length; i++) {
				buffer = this.universe.listing.spell[i];
				if(buffer && !buffer.disabled && !buffer.is_preview && !buffer.is_copy) {
					available.push(buffer);
				}
			}
			return available;
		},
		"availableKnowledge": function() {
			var available = [],
				buffer,
				i;
			for(i=0; i<this.universe.listing.knowledge.length; i++) {
				buffer = this.universe.listing.knowledge[i];
				if(buffer && !buffer.disabled && !buffer.is_preview && !buffer.is_copy && !buffer.is_template) {
					available.push(buffer);
				}
			}
			return available;
		},
		"viewedEntity": function() {
			if(this.$route.query.entity) {
				return this.universe.index.entity[this.$route.query.entity];
			} else {
				return null;
			}
		},
		"activeEntities": function() {
			var entities = {},
				minions = [],
				loaded = {},
				mains = [],
				main = {},
				foes = [],
				npcs = [],
				meeting,
				location,
				entity,
				player,
				party,
				load,
				i,
				j,
				k;

			entities.list = [];
			entities.mains = mains;
			entities.minions = minions;
			entities.foes = foes;
			entities.npcs = npcs;
			entities.meeting = [];
			entities.combat = [];

			// Pull from connected players
			for(i=0; i<this.universe.listing.player.length; i++) {
				player = this.universe.listing.player[i];
				if(player && player.attribute && player.attribute.playing_as && player.connections && !player.disabled) {
					entity = this.universe.index.entity[player.attribute.playing_as];
					if(entity && !loaded[entity.id]) {
						loaded[entity.id] = true;
						mains.push(entity);
						main[entity.id] = true;
					}
				}
			}

			// Pull from players listed in active meeting
			for(i=0; i<this.universe.listing.meeting.length; i++) {
				load = this.universe.listing.meeting[i];
				if(load && !load.disabled && load.is_active && load.players && load.players.length) {
					for(j=0; j<load.players.length; j++) {
						player = this.universe.index.player[load.players[j]];
						if(player && player.attribute && player.attribute.playing_as && player.connections && !player.disabled) {
							entity = this.universe.index.entity[player.attribute.playing_as];
							if(entity && !loaded[entity.id]) {
								loaded[entity.id] = true;
								mains.push(entity);
								main[entity.id] = true;
							}
						}
					}
				}
			}

			for(i=0; i<mains.length; i++) {
				entity = mains[0];
				if(entity.location && !loaded[entity.location]) {
					location = this.universe.index.location[entity.location];
					loaded[entity.location] = true;
					if(location && location.populace && location.populace.length) {
						for(j=0; j<location.populace.length; j++) {
							load = this.universe.index.entity[location.populace[j]];
							if(load && !loaded[load.id]) {
								loaded[load.id] = true;
								if(entity.owned && Object.keys(entity.owned).length) {
									minions.push(load);
								} else if(load.is_npc) {
									npcs.push(load);
								} else {
									foes.push(load);
								}
							}
						}
					}
				}
			}

			// Scan for entities loyal to the active mains
			for(i=0; i<this.universe.listing.entity.length; i++) {
				entity = this.universe.index.entity[i];
				if(entity && !loaded[entity.id] && main[entity.loyal_to]) {
					loaded[entity.id] = true;
					minions.push(entity);
				}
			}

			for(i=0; i<this.universe.listing.party.length; i++) {
				party = this.universe.listing.party[i];
				if(party && !party.disabled && party.entities && party.entities.length) {
					for(k=0; k<main.length && !loaded[party.id]; k++) {
						if(party.entities.indexOf(main[k].id) !== -1) {
							loaded[party.id] = true;
							for(j=0; j<party.entities.length; j++) {
								entity = this.universe.index.entity[party.entities[j]];
								if(entity && !entity.disabled && !loaded[entity.id]) {
									loaded[entity.id] = true;
									if(entity.owned && Object.keys(entity.owned).length) {
										minions.push(entity);
									} else if(entity.is_npc) {
										npcs.push(entity);
									} else {
										foes.push(entity);
									}
								}
							}
						}
					}
				}
			}

			// Meeting
			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meeting = this.universe.listing.meeting[i];
				if(meeting && !meeting.is_preview && !meeting.disabled && meeting.is_active) {
					break;
				}
			}

			if(meeting && meeting.is_active && !meeting.is_preview && !meeting.disabled && meeting.entities) {
				this.universe.transcribeInto(meeting.entities, entities.meeting, "entity");
			}

			// Combat
			if(this.skirmish && this.skirmish.entities) {
				this.universe.transcribeInto(this.skirmish.entities, entities.combat, "entity");
			}

			entities.combat.sort(rsSystem.utility.sortByInitiative);
			entities.list = mains.concat(minions, npcs, foes);
			entities.list.sort(rsSystem.utility.sortByInitiative);
			entities._keys = Object.keys(entities);
			return entities;
		}
	},
	"data": function() {
		var data = {},
			reference = this,
			getMeeting,
			i;

		data.tracking = {};
		data.tracking.player = {};
		for(i=0; i<this.universe.listing.player.length; i++) {
			data.tracking.player[this.universe.listing.player[i].id] = this.universe.listing.player[i].connections || 0;
		}

		data.rolled = {};

		data.bucketIcon = {
			"list": "fas fa-user-friends",
			"mains": "fas fa-users",
			"meetings": "fas fa-calendar",
			"foes": "fas fa-bullseye-arrow",
			"npcs": "game-icon game-icon-character",
			"meeting": "fas fa-calendar",
			"combat": "fas fa-swords",
			"minions": "fas fa-dog"
		};

		data.itemHeadings = ["icon", "name", "is_template", "is_copy", "acquired", "created"];
		data.itemControls = [{
			"title": "Distribute Items",
			"icon": "fas fa-abacus",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					items = Object.keys(reference.storage.itemTable.selected);
				
				console.log("Give Items:\n", items, " > To >\n", entities);

				reference.universe.send("distribute:items", {
					"targets": entities,
					"items": items
				});
			}
		}, {
			"title": "Take Items",
			"icon": "game-icon game-icon-drop-weapon",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					items = Object.keys(reference.storage.itemTable.selected);
				
				console.log("Remove Items:\n", items, " > To >\n", entities);

				reference.universe.send("undistribute:items", {
					"targets": entities,
					"items": items
				});
			}
		}];

		data.entityHeadings = ["name", "played_by", "race", "npc_task", "npc_voice", "npc_personality", "created"];
		data.entityControls = [{
			"title": "Add to Meeting",
			"icon": "fas fa-user-plus rs-secondary-light-green",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					meeting = reference.getMeeting();
				if(entities.length && meeting) {
					reference.universe.send("meeting:add:entities", {
						"meeting": meeting.id,
						"entities": entities
					});
				} else {
					console.warn("Missing Information to Add to Meeting; Meeting: " + (meeting?meeting.id:"! No Meeting") + "\n - ", entities);
				}
			}
		}, {
			"title": "Remove from Meeting",
			"icon": "fas fa-user-minus rs-secondary-light-red",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					meeting = reference.getMeeting();
				if(entities.length && meeting) {
					reference.universe.send("meeting:remove:entities", {
						"meeting": meeting.id,
						"entities": entities
					});
				} else {
					console.warn("Missing Information to Remove to Meeting; Meeting: " + (meeting?meeting.id:"! No Meeting") + "\n - ", entities);
				}
			}
		}];

		data.spellHeadings = ["name", "damage", "type", "level", "range_normal", "cast_time", "created"];
		data.spellControls = [{
			"title": "Grant Spell",
			"icon": "fas fa-book-spells",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					spells = Object.keys(reference.storage.spellTable.selected);
				if(entities.length && spells.length) {
					reference.universe.send("spells:grant", {
						"entities": entities,
						"spells": spells
					});
				} else {
					console.warn("Missing Information to Add to Spells");
				}
			}
		}, {
			"title": "Revoke Spell",
			"icon": "fas fa-mind-share",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					spells = Object.keys(reference.storage.spellTable.selected);
				if(entities.length && spells.length) {
					reference.universe.send("spells:revoke", {
						"entities": entities,
						"spells": spells
					});
				} else {
					console.warn("Missing Information to Remove to Spells");
				}
			}
		}];

		data.knowledgeHeadings = ["name", "category", "level", "range_normal", "cast_time", "created"];
		data.knowledgeControls = [{
			"title": "Grant Knowledge",
			"icon": "fas fa-brain",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					knowledge = Object.keys(reference.storage.knowledgeTable.selected);
				if(entities.length && knowledge.length) {
					reference.universe.send("knowledge:grant", {
						"entities": entities,
						"knowledges": knowledge
					});
				} else {
					console.warn("Missing Information to Add to Knowledge");
				}
			}
		}, {
			"title": "Revoke Knowledge",
			"icon": "fas fa-mind-share",
			"process": function() {
				var entities = Object.keys(reference.storage.entityTable.selected),
					knowledge = Object.keys(reference.storage.knowledgeTable.selected);
				if(entities.length && knowledge.length) {
					reference.universe.send("knowledge:revoke", {
						"entities": entities,
						"knowledges": knowledge
					});
				} else {
					console.warn("Missing Information to Remove to Knowledge");
				}
			}
		}];

		
		data.formatter = {};
		data.formatter.held_by = (value, record, header) => {
			if(record) {
				return this.held_by[record.id];
			} else {
				return "";
			}
		};
		data.formatter.acquired = (value, record, header) => {
			if(typeof(value) === "number") {
				return this.universe.calendar.toDisplay(value, false, false);
			}
			return value;
		};
		data.formatter.created = (value, record, header) => {
			if(typeof(value) === "number") {
				return new Date(value).toLocaleDateString();
			}
			return value;
		};
		data.formatter.is_template = data.formatter.is_copy = (value, record, header) => {
			if(value) {
				return "<span class=\"fas fa-check rs-lightgreen\"></span>";
			}
			return "<span class=\"fas fa-times\"></span>";
		};
		data.formatter.age = (value, record, header) => {
			if(typeof(record.acquired) === "number") {
				return this.universe.calendar.displayDuration(this.universe.time - record.acquired, false, false);
			}
			return value;
		};
		data.formatter.icon = (value, record) => {
			var classes = "";
			if(record) {
			}
			return "<span class=\"" + classes + (value || "") + "\"></span>";
		};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

		// this.universe.$on("player-disconnected", this.playerDisconnected);
		// this.universe.$on("player-connected", this.playerConnected);
		this.universe.$on("entity:roll", this.entityRolled);

		if(this.storage && !this.storage.activeBucket) {
			Vue.set(this.storage, "activeBucket", "list");
		}
		if(this.storage && !this.storage.witnessed_limit) {
			Vue.set(this.storage, "witnessed_limit", 100);
		}
		if(this.storage && !this.storage.entityTable) {
			Vue.set(this.storage, "entityTable", {});
		}
		if(!this.storage.entityTable.label) {
			this.storage.entityTable.label = "Entity";
		}
		if(this.storage && !this.storage.itemTable) {
			Vue.set(this.storage, "itemTable", {});
		}
		if(!this.storage.itemTable.label) {
			this.storage.itemTable.label = "Items";
		}
		if(this.storage && !this.storage.spellTable) {
			Vue.set(this.storage, "spellTable", {});
		}
		if(!this.storage.spellTable.label) {
			this.storage.spellTable.label = "Spells";
		}
		if(this.storage && !this.storage.knowledgeTable) {
			Vue.set(this.storage, "knowledgeTable", {});
		}
		if(!this.storage.knowledgeTable.label) {
			this.storage.knowledgeTable.label = "Knowledge";
		}
	},
	"methods": {
		"checkToEditRecord": function(event) {
			var follow,
				i;
				
			for(i=0; i<event.path.length; i++) {
				if(event.path[i] && event.path[i] && event.path[i].attributes && (follow = event.path[i].getAttribute("data-id"))) {
					if(event.ctrlKey) {
						console.log("Copy...", follow);
						navigator.clipboard.writeText(follow);
					} else if(follow = this.universe.getObject(follow)) {
						console.log("Edit...", follow);
						this.editNoun(follow);
					}
					event.stopPropagation();
					event.preventDefault();
					break;
				}
			}
		},
		"getMeeting": function() {
			var meeting,
				i;
			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meeting = this.universe.listing.meeting[i];
				if(meeting && meeting.is_active && !meeting.is_preview) {
					return meeting;
				}
			}
			return null;
		},
		"getEntityClass": function(entity) {
			var classes = "";

			if(this.skirmish && this.skirmish.combat_turn === entity.id) {
				classes += "current_turn ";
			}

			return classes;
		},
		"removeEntity": function(entity) {
			var meeting = getMeeting();
			console.log("Remove Entity: ", entity, meeting);
			if(meeting) {
				this.universe.send("meeting:remove:entities", {
					"meeting": meeting.id,
					"entities": [entity.id]
				});
			}
		},
		"witnessLimit": function(mod) {
			Vue.set(this.storage, "witnessed_limit", this.storage.witnessed_limit + mod);
		},
		"entityRolled": function(event) {
			if(event) {
				var roll = Object.assign({}, event);
				if(!this.rolled[roll.entity]) {
					this.rolled[roll.entity] = [];
				}
				if(typeof(roll.skill) === "string") {
					if(this.universe.index.skill[roll.skill]) {
						roll.skill = this.universe.index.skill[roll.skill];
					}
				}
				this.rolled[roll.entity].push(roll);
			}
		},
		"bucketClass": function(bucket) {
			var classes = "";
			if(this.storage.activeBucket === bucket) {
				classes = "active ";
			}
			return classes;
		},
		"switchEntityBucket": function(bucket) {
			Vue.set(this.storage, "activeBucket", bucket);
			this.$forceUpdate();
		},
		"playerDisconnected": function(event) {
			console.log("Disconnect: ", event);
		},
		"playerConnected": function(event) {
			console.log("Connect: ", event);
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("entity:roll", this
		.entityRolled);
	},
	"template": Vue.templified("pages/dnd/master/screen.html")
});
