/**
 *
 *
 * @class sysInfoGeneral
 * @constructor
 * @module Components
 */
rsSystem.component("sysInfoGeneral", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDControlEquipment,
		rsSystem.components.RSShowdown,
		rsSystem.components.RSCore
	],
	"props": {
		"info": {
			"requried": true,
			"type": Object
		},
		"player": {
			"type": Object
		},
		"size": {
			"type": Number,
			"default": 90
		},
		"cacheSuffix": {
		}
	},
	"computed": {
		"description": function() {
			return this.rsshowdown(this.info.description || "", this.info, this.profile?this.profile.inline_javascript:false);
		},
		"activeMeeting": function() {
			return this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value] || null;
		},
		"note": function() {
			if(this.player.gm) {
				return this.rsshowdown(this.info.note || "", this.info, this.profile?this.profile.inline_javascript:false);
			}
			return null;
		},
		"image": function() {
			if(this.info.portrait && this.universe.index.image[this.info.portrait]) {
				return this.universe.index.image[this.info.portrait];
			}
		},
		"entity": function() {
			return this.playerCharacter || this.getPlayerCharacter();
		}
	},
	"watch": {
		"info": function() {
			this.populateControls();
			if(this.editing) {
				Vue.set(this, "editing", false);
			}
		}
	},
	"data": function() {
		var data = {};
		data.editDescription = "";
		data.editNote = "";
		data.editing = false;
		data.controls = [];
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.populateControls();
		this.universe.$on("updated", this.repopulateControls);
	},
	"methods": {
		"repopulateControls": function(event) {
			if(event && this.info && (event.id === this.info.id || event.id === this.info.character || event.id === this.info.user || event.id === this.info.caster || event.id === this.info.attuned || (this.entity && event.id === this.entity.id))) {
				this.populateControls();
			}
		},
		"getEntityLocality": function(current, entity) {
			var places = [],
				added = {},
				buffer,
				id,
				i;

			current = current || (this.activeMeeting?this.activeMeeting.location:null);
			if(typeof(current) === "string") {
				current = this.universe.get(current);
			}
			entity = entity || this.entity;
			if(typeof(entity) === "string") {
				entity = this.universe.get(entity);
			}

			if(current) {
				places.push(current);
				places.push("-- [Nearby Locations] --");
				// Parent
				if(current.location && (buffer = this.universe.get(current.location))) {
					places.push(buffer);
				}
				// Available Transitions
				for(i=0; i<this.universe.listing.location.length; i++) {
					buffer = this.universe.listing.location[i];
					if(buffer && (buffer.location === current.id || (current.location && buffer.location === current.location)) && buffer.id !== current.id) {
						if(buffer.links_to) {
							added[buffer.links_to] = true;
							if(buffer = this.universe.get(buffer.links_to)) {
								places.push(buffer);
							}
						} else {
							added[buffer.id] = true;
							places.push(buffer);
						}
					}
				}
			}

			// Meeting Relevent Specified Locations
			places.push("-- [Meeting Locations] --");
			if(this.activeMeeting && this.activeMeeting.locations) {
				for(i=0; i<this.activeMeeting.locations.length; i++) {
					id = this.activeMeeting.locations[i];
					if(id !== current.id && !added[id] && (buffer = this.universe.get(id))) {
						places.push(buffer);
					}
				}
			}

			places.push("-- [Active Entities] --");
			if(this.activeMeeting && this.activeMeeting.entities && this.activeMeeting.entities.length) {
				for(i=0; i<this.activeMeeting.entities.length; i++) {
					if(buffer = this.universe.get(this.activeMeeting.entities[i])) {
						added[buffer.id] = true;
						places.push(buffer);
					}
				}
			}

			
			places.push("-- [Location Entities] --");
			if(this.location) {
				for(i=0; i<this.universe.listing.entity.length; i++) {
					buffer = this.universe.listing.entity[i];
					if(buffer && buffer.location === this.location.id && !added[buffer.id]) {
						added[buffer.id] = true;
						places.push(buffer);
					}
				}
			}

			return places;
		},
		"populateControls": function() {
			setTimeout(() => {
				var entity = this.playerCharacter || this.getPlayerCharacter(),
					character = this.info.character || this.info.caster || this.info.user, 
					object = this.info,
					loading,
					name;

				this.controls.splice(0);
				if(!this.info.is_preview && this.info._class) {
					if(this.player) {
						if(this.info.is_shop && (this.player.gm || (entity && entity.location === this.info.location) || (this.activeMeeting && this.activeMeeting.entities && this.activeMeeting.entities.indexOf(this.info.id) !== -1))) {
							this.controls.push({
								"title": "Shop at this store",
								"icon": "fa-solid fa-cash-register",
								"type": "button",
								"action": "shop"
							});
						}
						if(this.player.gm) {
							if(object._class === "player") {
								this.controls.push({
									"title": "View Player Dashboard",
									"icon": "fa-solid fa-table-columns",
									"type": "button",
									"action": "player-overview"
								});
							}
							if(this.info.obscured) {
								this.controls.push({
									"title": "Unobscure object",
									"icon": "fas fa-eye",
									"type": "button",
									"action": "unobscure"
								});
							} else {
								this.controls.push({
									"title": "Obscure object",
									"icon": "fas fa-eye-slash",
									"type": "button",
									"action": "obscure"
								});
							}
							if(this.info.is_active !== undefined && this.info.is_active !== null) {
								if(this.info.is_active) {
									this.controls.push({
										"title": "Deactivate",
										"icon": "fad fa-toggle-off rs-red rs-secondary-white rs-secondary-solid",
										"type": "button",
										"action": "deactivate"
									});
								} else {
									this.controls.push({
										"title": "Activate",
										"icon": "fad fa-toggle-on rs-secondary-green rs-secondary-solid",
										"type": "button",
										"action": "activate"
									});
								}
							}
							if(this.info.is_locked !== undefined && this.info.is_locked !== null) {
								if(this.info.is_locked) {
									this.controls.push({
										"title": "Unlock",
										"icon": "fas fa-lock",
										"type": "button",
										"action": "unlock"
									});
								} else {
									this.controls.push({
										"title": "Lock",
										"icon": "fas fa-unlock",
										"type": "button",
										"action": "lock"
									});
								}
							}
							if(this.info.is_open !== undefined && this.info.is_open !== null) {
								if(this.info.is_open) {
									this.controls.push({
										"title": "Close",
										"icon": "fa-solid fa-door-closed",
										"type": "button",
										"action": "closeopennable"
									});
								} else {
									this.controls.push({
										"title": "Open",
										"icon": "fa-solid fa-door-open",
										"type": "button",
										"action": "openopennable"
									});
								}
							}
							if(this.info.is_powered !== undefined && this.info.is_powered !== null) {
								if(this.info.is_powered) {
									this.controls.push({
										"title": "Unpower",
										"icon": "fa-thin fa-bolt rs-light-red",
										"type": "button",
										"action": "unpower"
									});
								} else {
									this.controls.push({
										"title": "Power",
										"icon": "fa-solid fa-bolt rs-light-green",
										"type": "button",
										"action": "power"
									});
								}
							}
							if(this.info.must_know) {
								this.controls.push({
									"title": "Change to Public Knowledge",
									"icon": "fa-solid fa-cloud-slash",
									"type": "button",
									"action": "public"
								});
								if(this.profile.override_must_know) {
									this.controls.push({
										"title": "Unset profile control for knowledge override",
										"icon": "game-icon game-icon-clover-spiked",
										"type": "button",
										"action": "unoverrideknow"
									});
								} else {
									this.controls.push({
										"title": "Set profile control for knowledge override",
										"icon": "game-icon game-icon-clover",
										"type": "button",
										"action": "overrideknow"
									});
								}
							} else {
								this.controls.push({
									"title": "Change to must be known",
									"icon": "fa-solid fa-cloud",
									"type": "button",
									"action": "private"
								});
							}
							// if(this.info.must_know && this.info.is_position_hidden !== undefined && this.info.is_position_hidden !== null) {
							if(this.info.is_position_hidden) {
								this.controls.push({
									"title": "Reveal Position",
									"icon": "fa-solid fa-location-crosshairs",
									"type": "button",
									"action": "showposition"
								});
							} else {
								this.controls.push({
									"title": "Hide Position",
									"icon": "fa-solid fa-location-crosshairs-slash",
									"type": "button",
									"action": "hideposition"
								});
							}
							// }
							if(this.info._class === "entity") {
								this.controls.push({
									"title": "Move to Location or Place",
									"icon": "fas fa-right-to-bracket",
									"action": "movetoplace",
									"property": "location",
									"type": "selectobj",
									"_value": this.info.location,
									"options": this.getEntityLocality()
								});
								
								if(this.player.attribute && this.player.attribute.playing_as !== this.info.id) {
									this.controls.push({
										"title": "Assume entity in Overview",
										"icon": "game-icon game-icon-console-controller",
										"type": "button",
										"action": "assume"
									});
								}
								if(this.info.is_npc || this.info.is_minion) {
									if(this.info.is_hostile) {
										this.controls.push({
											"title": "Declare Entity as no longer Hostile",
											"icon": "fas fa-smile-beam",
											"type": "button",
											"action": "nonhostile"
										});
									} else {
										this.controls.push({
											"title": "Declare Entity as Hostile",
											"icon": "fas fa-angry",
											"type": "button",
											"action": "hostile"
										});
									}
								}
								if(this.info.is_chest || this.info.is_shop) {
									if(this.info.is_locked) {
										this.controls.push({
											"title": "Unlock Entity",
											"icon": "fas fa-unlock",
											"type": "button",
											"action": "unlock"
										});
									} else {
										this.controls.push({
											"title": "Lock Entity",
											"icon": "fas fa-lock",
											"type": "button",
											"action": "lock"
										});
									}
								}
								if(!rsSystem.utility.isEmpty(this.info.owned) && (this.info.is_npc || this.info.is_minion)) {
									this.controls.push({
										"title": "Declare as a rampaging NPC by clearing owner",
										"icon": "fa-regular fa-face-angry-horns",
										"type": "button",
										"action": "rampage"
									});
								}
								loading = {
									"title": "Color Code",
									"icon": "fas fa-palette",
									"action": "color",
									"property": "color_flag",
									"type": "select",
									"_value": this.info.color_flag,
									"options": ["", "transparent", "red", "yellow", "green", "purple", "blue", "cyan", "black", "white", "gray", "bordered-red", "bordered-yellow", "bordered-green", "bordered-purple", "bordered-blue", "bordered-cyan", "bordered-white", "bordered-gray", "bordered-black"]
								};
								if(loading.options.indexOf[loading._value] === -1) {
									loading._missing = loading._value;
								}
								this.controls.push(loading);
								if(this.info.token_image) {
									this.controls.push({
										"title": "Rotation",
										"icon": "fas fa-palette",
										"action": "rotate",
										"property": "token_rotation",
										"type": "select",
										"_value": this.info.token_rotation,
										"options": [0, 45, 60, 90, 120, 135, 180, 225, 240, 270, 300, 315]
									});
								}
								// if(this.info.is_minion || this.info.is_npc || rsSystem.utility.isEmpty(this.info.owned)) {
								// 	loading = {
								// 		"title": "Color Code",
								// 		"icon": "fas fa-palette",
								// 		"action": "color",
								// 		"property": "color_flag",
								// 		"type": "select",
								// 		"_value": this.info.color_flag,
								// 		"options": ["", "transparent", "red", "yellow", "green", "purple", "blue", "cyan", "black", "white", "gray"]
								// 	};
								// 	if(loading.options.indexOf[loading._value] === -1) {
								// 		loading._missing = loading._value;
								// 	}
								// 	this.controls.push(loading);
								// }
								if(this.info.hp === 0 && this.info.types.indexOf("type:dead") === -1) {
									this.controls.push({
										"title": "Declare Dead",
										"icon": "fas fa-skull",
										"type": "button",
										"action": "nowdead"
									});
								} else if(this.info.hp !== 0 && this.info.types.indexOf("type:dead") !== -1) {
									this.controls.push({
										"title": "Declare Revived",
										"icon": "game-icon game-icon-rod-of-asclepius",
										"type": "button",
										"action": "notdead"
									});
								}
								if(this.info.inside) {
									this.controls.push({
										"title": "Exit current occupancy",
										"icon": "fa-regular fa-person-to-door",
										"type": "button",
										"action": "exitentity"
									});
								}
								if(this.activeMeeting) {
									if(this.activeMeeting.entities && this.activeMeeting.entities.indexOf(this.info.id) === -1) {
										this.controls.push({
											"title": "Add entity to active party",
											"icon": "fa-solid fa-user-plus",
											"type": "button",
											"action": "partyentity"
										});
									} else {
										this.controls.push({
											"title": "Remove entity from active party",
											"icon": "fa-solid fa-user-minus",
											"type": "button",
											"action": "unpartyentity"
										});
									}
								}
								if(this.info.is_deletable) {
									this.controls.push({
										"title": "Clear Deletion Flag",
										"icon": "fa-regular fa-trash-slash",
										"type": "button",
										"action": "unremovingcharacter"
									});
									this.controls.push({
										"title": "Fully Strip Character",
										"icon": "fa-regular fa-eraser",
										"type": "button",
										"action": "stripcharacter"
									});
									this.controls.push({
										"title": "Fully Delete Character",
										"icon": "fa-regular fa-trash-xmark",
										"type": "button",
										"action": "removecharacter"
									});
								} else {
									this.controls.push({
										"title": "Start Deletion Process",
										"icon": "fa-regular fa-person-arrow-down-to-line",
										"type": "button",
										"action": "removingcharacter"
									});
								}
							} else if(this.info._class === "item") {
								this.controls.push({
									"title": "Give Item",
									"icon": "fas fa-people-carry",
									"action": "giveitemto",
									"type": "button"
								});
							} else if(this.info._class === "location") {
								if(this.activeMeeting && this.info.map) {
									if(this.activeMeeting.location !== this.info.id) {
										this.controls.push({
											"title": "Set Meeting Location",
											"icon": "fa-solid fa-map-pin",
											"type": "button",
											"action": "meeting-location"
										});
									} else {
										this.controls.push({
											"title": "Unset as Meeting Location",
											"icon": "fa-solid fa-map-pin rs-light-red",
											"type": "button",
											"action": "meeting-unlocation"
										});
									}
								}
							} else if(this.info._class === "event") {
								// TODO: Consider tying this directly into the push to player entities for active action tracking
								this.controls.push({
									"title": "Set the start time for this event",
									"icon": "fa-regular fa-hourglass-start",
									"type": "button",
									"action": "setstart"
								});
								this.controls.push({
									"title": "Set the end time for this event",
									"icon": "fa-regular fa-hourglass-end",
									"type": "button",
									"action": "setend"
								});
							}
							if((this.info._class === "event" || this.info.locations) && this.activeMeeting && this.activeMeeting.location) {
								this.controls.push({
									"title": "Add Current Location to locations list",
									"icon": "fa-solid fa-location-plus",
									"type": "button",
									"action": "addcurrentlocation"
								});
							}
							this.controls.push({
								"title": "Add Info Activity",
								"icon": "fa-solid fa-person-circle-plus",
								"type": "button",
								"action": "addinfoactivity"
							});
							this.controls.push({
								"title": "Remove Info Activity",
								"icon": "fa-solid fa-person-circle-minus",
								"type": "button",
								"action": "subinfoactivity"
							});
						// } else if(this.info._class === "entity" && this.info.owned && this.info.owned[this.player.id] && this.player.attribute && this.player.attribute.playing_as !== this.info.id) {
						// 	this.controls.push({
						// 		"title": "Assume Entity in Overview",
						// 		"icon": "game-icon game-icon-console-controller",
						// 		"type": "button",
						// 		"action": "assume"
						// 	});
						}
						if(entity) {
							name = rsSystem.utility.getKnownProperty(entity, this.info, "name") || "Unknown";
							// this.controls.push({
							// 	"title": "Create knowledge for this " + entity.name,
							// 	"icon": "fas fa-brain",
							// 	"type": "button",
							// 	"action": "knowing"
							// });
							switch(this.info._class) {
								case "location":
									if(!this.info.is_locked || this.info.is_open) {
										if(this.info.map) {
											this.controls.push({
												"title": "Pull up the map of " + name,
												"icon": "fas fa-location-circle",
												"type": "button",
												"action": "goto"
											});
										} else if(this.info.links_to) {
											this.controls.push({
												"title": "Pull up the map of " + name,
												"icon": "fas fa-location-circle",
												"type": "button",
												"action": "gotolink"
											});
										}
									}
									if(this.info.is_marker) {
										this.controls.push({
											"title": "Set " + name + " as not a marker",
											"icon": "fas fa-map-marker-alt-slash",
											"type": "button",
											"action": "notmarker"
										});
									} else {
										this.controls.push({
											"title": "Set " + name + " as a marker",
											"icon": "fas fa-map-marker-alt",
											"type": "button",
											"action": "ismarker"
										});
									}
									break;
								case "recipe":
									this.controls.push({
										"title": "Begin crafting this recipe",
										"icon": "game-icon game-icon-anvil-impact",
										"type": "button",
										"action": "craft"
									});
									break;
								case "effect":
									if(this.player.gm || (entity.effects.indexOf(this.info.id) !== -1 && !this.info.is_locked)) {
										this.controls.push({
											"title": "Revoke effect " + this.info.name + " from " + entity.name,
											"icon": "fas fa-ban",
											"type": "button",
											"action": "revoke"
										});
									}
									break;
								case "entity":
									if(this.info.owned && this.info.owned[this.player.id]) {
										this.controls.push({
											"title": "Open inventory of " + name,
											"icon": "fas fa-backpack",
											"type": "button",
											"action": "inventory"
										});
										if((this.info.spells_known && this.info.spells_known.length) || !rsSystem.utility.isEmpty(this.info.spell_slot_max)) {
											this.controls.push({
												"title": "Open spellbook for " + name,
												"icon": "fas fa-book-spells",
												"type": "button",
												"action": "spellbook"
											});
										}
										if(this.player.attribute && this.player.attribute.playing_as !== this.info.id) {
											this.controls.push({
												"title": "Play as " + name,
												"icon": "fas fa-user",
												"type": "button",
												"action": "assume"
											});
										}
									}
									if(entity && this.info.interior && (!this.info.is_locked || this.info.is_open || this.info.hp === 0) && rsSystem.utility.isValid(this.universe.index.location[this.info.interior]) && rsSystem.utility.isKnownBy(entity, this.info)) {
										this.controls.push({
											"title": "Go to the interior map of " + name,
											"icon": "fas fa-location-circle",
											"type": "button",
											"action": "interior"
										});
									}
									break;
								case "item":
									if(entity.inventory.indexOf(this.info.id) !== -1) {
										if(entity.equipped.indexOf(object.id) === -1) {
											this.controls.push({
												"title": "Equip Item to " + entity.name,
												"icon": "game-icon game-icon-sword-brandish",
												"type": "button",
												"action": "equip"
											});
										} else {
											this.controls.push({
												"title": "Unequip Item from " + entity.name,
												"icon": "game-icon game-icon-drop-weapon",
												"type": "button",
												"action": "unequip"
											});
											if(object.melee || object.ranged || object.thrown) {
												if(entity.main_weapon === object.id) {
													this.controls.push({
														"title": "Remove as Main Hand for " + entity.name,
														"icon": "fa-light fa-hand-rock rot180",
														"type": "button",
														"action": "unmainhand"
													});
												} else {
													this.controls.push({
														"title": "Equip as Main Hand for " + entity.name,
														"icon": "fa-solid fa-hand-rock",
														"type": "button",
														"action": "mainhand"
													});
												}
											}
										}
										if(this.info.consume) {
											this.controls.push({
												"title": this.info.consume_hint || ("Consume " + this.info.name),
												"icon": this.info.consume_icon || ("fa-solid fa-drumstick-bite"),
												"type": "button",
												"action": "consume"
											});
										}
										this.controls.push({
											"title": "Give item to another creature near " + entity.name,
											"icon": "fas fa-people-carry",
											"type": "button",
											"action": "give"
										});
										this.controls.push({
											"title": "Drop item from " + entity.name,
											"icon": "fas fa-arrow-alt-to-bottom",
											"type": "button",
											"action": "drop"
										});
									}
									break;
							}
						}
						this.controls.push({
							"title": "Create a personal knowledge entry for " + name,
							"icon": "fa-solid fa-thought-bubble",
							"type": "button",
							"action": "knowing"
						});
						if(this.player.gm || (character && !this.info.is_singular)) {
							this.controls.push({
								"title": "Edit description for " + name,
								"icon": "fas fa-edit",
								"type": "button",
								"action": "edit-description"
							});
						}
					}
				}
			});
		},
		"submitDescription": function() {
			this.process("send-description");
		},
		"cancelDescription": function() {
			this.process("cancel-description");
		},
		"editTopData": function() {
			if(this.player && this.player.gm) {
				Vue.set(this, "editDescription", this.info.description);
				Vue.set(this, "editNote", this.info.note);
				Vue.set(this, "editing", true);
			} else if(this.entity && (this.info.character === this.entity.id || this.info.user === this.entity.id || this.info.caster === this.entity.id)) {
				Vue.set(this, "editDescription", this.info.description);
				Vue.set(this, "editing", true);
			}
		},
		"process": function(control) {
			var entity = this.playerCharacter || this.getPlayerCharacter(),
				object = this.info,
				buffer;

			switch(control.action || control) {
				case "goto":
					rsSystem.toPath("/map/" + object.id);
					break;
				case "gotolink":
					rsSystem.toPath("/map/" + object.links_to);
					break;
				case "interior":
					rsSystem.toPath("/map/" + object.interior);
					break;
				case "assume":
					if(this.player.gm) {
						this.universe.send("master:assume", {"entity": object.id});
					} else if(object.played_by === this.player.id) {
						this.universe.send("entity:assume", {"entity": object.id});
					}
					break;
				case "obscure":
					this.universe.send("master:obscure", {
						"object": object.id,
						"obscured": true
					});
					break;
				case "unobscure":
					this.universe.send("master:obscure", {
						"object": object.id,
						"obscured": false
					});
					break;
				case "lock":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_locked",
						"value": true
					});
					break;
				case "unlock":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_locked",
						"value": false
					});
					break;
				case "ismarker":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_marker",
						"value": true
					});
					break;
				case "notmarker":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_marker",
						"value": false
					});
					break;
				case "setstart":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "time_start",
						"value": this.universe.time
					});
					break;
				case "setend":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "time_end",
						"value": this.universe.time
					});
					break;
				case "addcurrentlocation":
					if(this.activeMeeting && this.activeMeeting.location) {
						buffer = object.locations || [];
						buffer.push(this.activeMeeting.location);
						this.universe.send("master:quick:set", {
							"object": object.id,
							"field": "locations",
							"value": buffer
						});
					}
					break;
				case "closeopennable":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_open",
						"value": false
					});
					break;
				case "openopennable":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_open",
						"value": true
					});
					break;
				case "public":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "must_know",
						"value": null
					});
					break;
				case "private":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "must_know",
						"value": 1
					});
					break;
				case "hostile":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_hostile",
						"value": true
					});
					break;
				case "nonhostile":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_hostile",
						"value": false
					});
					break;
				case "hideposition":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_position_hidden",
						"value": true
					});
					break;
				case "showposition":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_position_hidden",
						"value": false
					});
					break;
				case "rotate":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "token_rotation",
						"value": control._value
					});
					break;
				case "power":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_powered",
						"value": true
					});
					break;
				case "unremovingcharacter":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_deletable",
						"value": false
					});
					break;
				case "removingcharacter":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_deletable",
						"value": true
					});
					break;
				case "removecharacter":
					this.universe.send("delete:character", {
						"character": object.id
					});
					break;
				case "stripcharacter":
					this.universe.send("strip:character", {
						"character": object.id
					});
					break;
				case "giveitemto":
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogGive",
						"finish": (target) => {
							if(target && target.id) {
								this.universe.send("inventory:give", {
									"items": [object.id],
									"target": target.id
								});
							}
						}
					});
					break;
				case "craft":
					this.closeInfo();
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogCraft",
						"entity": entity.id,
						// "source": entity.id,
						// "target": entity.id,
						"initial_recipe": object.id,
						// "ingredients": parts,
						"recipes": this.universe.transcribeInto(entity.recipes || [])
					});
					break;
				case "rampage":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "owned",
						"value": null
					});
					break;
				case "unpower":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_powered",
						"value": false
					});
					break;
				case "activate":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_active",
						"value": true
					});
					break;
				case "deactivate":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_active",
						"value": false
					});
					break;
				case "exitentity":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "inside",
						"value": null
					});
					break;
				case "nowdead":
					this.universe.send("master:quick:add", {
						"object": object.id,
						"field": "types",
						"value": ["type:dead"]
					});
					break;
				case "notdead":
					this.universe.send("master:quick:sub", {
						"object": object.id,
						"field": "types",
						"value": ["type:dead"]
					});
					break;
				case "shop":
					if(entity) {
						rsSystem.EventBus.$emit("dialog-open", {
							"component": "dndDialogShop",
							"entity": entity.id,
							"shop": this.info.id
						});
					} else {
						console.warn("Player Character not found: " + this.player.attribute.playing_as);
					}
					break;
				case "partyentity":
					if(this.activeMeeting) {
						this.universe.send("meeting:add:entities", {
							"meeting": this.activeMeeting.id,
							"entities": [object.id]
						});
					}
					break;
				case "unpartyentity":
					if(this.activeMeeting) {
						this.universe.send("meeting:remove:entities", {
							"meeting": this.activeMeeting.id,
							"entities": [object.id]
						});
					}
					break;
				case "partyentities":
					if(this.activeMeeting) {
						this.universe.send("meeting:add:entities", {
							"meeting": this.activeMeeting.id,
							"entities": object.entities
						});
					}
					break;
				case "unpartyentities":
					if(this.activeMeeting) {
						this.universe.send("meeting:remove:entities", {
							"meeting": this.activeMeeting.id,
							"entities": object.entities
						});
					}
					break;
				case "addinfoactivity":
					if(this.activeMeeting) {
						this.universe.send("meeting:activity:info:add", {
							"meeting": this.activeMeeting.id,
							"info": object.id
						});
					}
					break;
				case "subinfoactivity":
					if(this.activeMeeting) {
						this.universe.send("meeting:activity:info:sub", {
							"meeting": this.activeMeeting.id,
							"info": object.id
						});
					}
					break;
				case "meeting-location":
					if(this.activeMeeting) {
						/*
						this.universe.send("master:quick:set", {
							"object": this.activeMeeting.id,
							"field": "location",
							"value": object.id
						});
						*/
						this.universe.send("meeting:location", {
							"meeting": this.activeMeeting.id,
							"location": object.id
						});
					}
					break;
				case "meeting-unlocation":
					if(this.activeMeeting) {
						/*
						this.universe.send("master:quick:set", {
							"object": this.activeMeeting.id,
							"field": "location",
							"value": null
						});
						*/
						this.universe.send("meeting:location", {
							"meeting": this.activeMeeting.id,
							"location": null
						});
					}
					break;
				case "revoke":
					this.universe.send("effect:revoke", {
						"effects": [object.id],
						"from": [entity.id]
					});
					break;
				case "edit-description":
					this.editTopData();
					break;
				case "cancel-description":
					Vue.set(this, "editing", false);
					break;
				case "send-description":
					console.log(" [Edit]>> ", control, this.editDescription);
					Vue.set(this, "editing", false);
					if(this.player.gm) {
						this.universe.send("object:describe", {
							"id": object.id,
							"description": this.editDescription,
							"note": this.editNote
						});
					} else {
						this.universe.send("object:describe", {
							"id": object.id,
							"description": this.editDescription
						});
					}
					break;
				case "give":
					this.closeInfo();
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogGive",
						"entity": entity.id,
						"finish": (target) => {
							console.log("Giving: ", target.id, {
								"items": [object.id],
								"entity": entity.id,
								"target": target.id
							});
							if(target && target.id) {
								this.universe.send("inventory:give", {
									"items": [object.id],
									"entity": entity.id,
									"target": target.id
								});
							}
						}
					});
					break;
				case "knowing":
					this.closeInfo();
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogKnowing",
						"entity": entity.id,
						"associations": [this.info.id],
						"can_share": this.info._class === "entity",
						"finish": (target) => {
							console.log("Finish: ", target);
						}
					});
					break;
				case "consume":
					this.closeInfo();
					rsSystem.EventBus.$emit("dialog-open", {
						"title": this.entity.name + " Actions",
						"component": "dndDialogDamage",
						"action": "channel:use",
						"entity": entity,
						"channel": object
					});
					break;
				case "player-overview":
					rsSystem.toPath("/overview/" + object.id);
					break;
				case "inventory":
					rsSystem.toPath("/inventory/" + object.id);
					break;
				case "spellbook":
					rsSystem.toPath("/spells/" + object.id);
					break;
				case "equip":
					this.equipItem(object.id, entity);
					break;
				case "mainhand":
					this.mainhandItem(object.id, entity);
					break;
				case "unmainhand":
					this.mainhandItem(null, entity);
					break;
				case "unequip":
					this.unequipItem(object.id, entity);
					break;
				case "drop":
					this.dropItem(object.id, entity);
					break;
				case "unoverrideknow":
					Vue.set(this.profile, "override_must_know", false);
					this.populateControls();
					break;
				case "overrideknow":
					Vue.set(this.profile, "override_must_know", true);
					this.populateControls();
					break;
				case "color":
					this.universe.send("master:recolor", {
						"object": object.id,
						"color": control._value
					});
					if(control.options.indexOf[control._value] === -1) {
						control._missing = control._value;
					} else {
						Vue.delete(control, "_missing");
					}
					break;
				case "movetoplace":
					if(buffer = this.universe.get(control._value)) {
						if(buffer._class === "location") {
							this.universe.send("master:quick:set", {
								"object": object.id,
								"field": "location",
								"value": control._value
							});
						} else if(buffer._class === "entity") {
							this.universe.send("master:quick:set", {
								"object": object.id,
								"field": "inside",
								"value": control._value
							});
						}
					}
					break;
				default:
					console.warn("Unknown Command: " + (control.action || control));
			}
		},
		"option": function(control) {

		},
		"getImageURL": function(record) {
			if(record.data) {
				return record.data;
			} else if(this.cacheSuffix) {
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + record.id + "?ctrl=" + this.cacheSuffix;
			} else {
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + record.id + "?ctrl=" + Date.now();
			}
		},
		/**
		 *
		 * @method closeInfo
		 */
		"closeInfo": function() {
			rsSystem.manipulateQuery({
				"info": null,
				"view": null
			});
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.repopulateControls);
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/system/info/render/general.html")
});
