
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
			if(event.id === this.info.id) {
				this.populateControls();
			}
		},
		"populateControls": function() {
			setTimeout(() => {
				var entity = this.playerCharacter || this.getPlayerCharacter(),
					character = this.info.character || this.info.caster || this.info.user, 
					object = this.info,
					loading;

				this.controls.splice(0);
				if(!this.info.is_preview && this.info._class) {
					if(this.player) {
						if(this.player.gm) {
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
										"icon": "fas fa-lock rs-light-red",
										"type": "button",
										"action": "unlock"
									});
								} else {
									this.controls.push({
										"title": "Lock",
										"icon": "fas fa-unlock rs-light-green",
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
									"title": "Public Knowledge",
									"icon": "fa-solid fa-cloud-slash",
									"type": "button",
									"action": "public"
								});
							} else {
								this.controls.push({
									"title": "Must be known",
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
								if(this.info.is_minion || this.info.is_npc || rsSystem.utility.isEmpty(this.info.owned)) {
									loading = {
										"title": "Color Code",
										"icon": "fas fa-palette",
										"action": "color",
										"property": "color_flag",
										"type": "select",
										"_value": this.info.color_flag,
										"options": ["", "red", "yellow", "green", "purple", "blue", "cyan", "black", "white"]
									};
									if(loading.options.indexOf[loading._value] === -1) {
										loading._missing = loading._value;
									}
									this.controls.push(loading);
								}
								switch(this.info._class) {
									case "entity":
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
								}
							}
						// } else if(this.info._class === "entity" && this.info.owned && this.info.owned[this.player.id] && this.player.attribute && this.player.attribute.playing_as !== this.info.id) {
						// 	this.controls.push({
						// 		"title": "Assume Entity in Overview",
						// 		"icon": "game-icon game-icon-console-controller",
						// 		"type": "button",
						// 		"action": "assume"
						// 	});
						}
						if(entity) {
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
												"title": "Pull up the map of this location",
												"icon": "fas fa-location-circle",
												"type": "button",
												"action": "goto"
											});
										} else if(this.info.links_to) {
											this.controls.push({
												"title": "Pull up the map of this location",
												"icon": "fas fa-location-circle",
												"type": "button",
												"action": "gotolink"
											});
										}
									}
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
											"title": "Open inventory of " + entity.name,
											"icon": "fas fa-backpack",
											"type": "button",
											"action": "inventory"
										});
										if((this.info.spells_known && this.info.spells_known.length) || !rsSystem.utility.isEmpty(this.info.spell_slot_max)) {
											this.controls.push({
												"title": "Open spellbook for " + entity.name,
												"icon": "fas fa-book-spells",
												"type": "button",
												"action": "spellbook"
											});
										}
										if(this.player.attribute && this.player.attribute.playing_as !== this.info.id) {
											this.controls.push({
												"title": "Play as this character",
												"icon": "fas fa-user",
												"type": "button",
												"action": "assume"
											});
										}
									}
									if(entity && this.info.interior && (!this.info.is_locked || this.info.is_open || this.info.hp === 0) && rsSystem.utility.isValid(this.universe.index.location[this.info.interior]) && rsSystem.utility.isKnownBy(entity, this.info)) {
										this.controls.push({
											"title": "Go to the interior map of " + rsSystem.utility.getKnownProperty(entity, this.info, "name"),
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
														"icon": "fal fa-hand-rock rot180",
														"type": "button",
														"action": "unmainhand"
													});
												} else {
													this.controls.push({
														"title": "Equip as Main Hand for " + entity.name,
														"icon": "fas fa-hand-rock",
														"type": "button",
														"action": "mainhand"
													});
												}
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
									break;
							}
						}
						this.controls.push({
							"title": "Create a personal knowledge entry for this",
							"icon": "fa-solid fa-thought-bubble",
							"type": "button",
							"action": "knowing"
						});
						if(this.player.gm || (character && !this.info.is_singular)) {
							this.controls.push({
								"title": "Edit description for " + this.info.name,
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
		"process": function(control) {
			var entity = this.playerCharacter || this.getPlayerCharacter(),
				object = this.info;

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
				case "power":
					this.universe.send("master:quick:set", {
						"object": object.id,
						"field": "is_powered",
						"value": true
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
				case "revoke":
					this.universe.send("effect:revoke", {
						"effects": [object.id],
						"from": [entity.id]
					});
					break;
				case "edit-description":
					Vue.set(this, "editDescription", object.description);
					if(this.player.gm) {
						Vue.set(this, "editNote", object.note);
					}
					Vue.set(this, "editing", true);
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
