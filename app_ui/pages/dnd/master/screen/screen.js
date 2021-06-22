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

			entities.combat = mains.concat(minions, npcs, foes);
			entities.combat.sort(rsSystem.utility.sortByInitiative);
			entities.list = mains.concat(minions, npcs, foes);
			entities.list.sort(rsSystem.utility.sortByInitiative);
			return entities;
		}
	},
	"data": function() {
		var data = {},
			i;

		data.tracking = {};
		data.tracking.player = {};
		for(i=0; i<this.universe.listing.player.length; i++) {
			data.tracking.player[this.universe.listing.player[i].id] = this.universe.listing.player[i].connections || 0;
		}

		data.rolled = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
		// this.universe.$on("player-disconnected", this.playerDisconnected);
		// this.universe.$on("player-connected", this.playerConnected);
		this.universe.$on("entity:roll", this.entityRolled);
	},
	"methods": {
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
		"playerDisconnected": function(event) {
			console.log("Disconnect: ", event);
		},
		"playerConnected": function(event) {
			console.log("Connect: ", event);
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("entity:roll", this.entityRolled);
	},
	"template": Vue.templified("pages/dnd/master/screen.html")
});
