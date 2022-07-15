/**
 * 
 * 
 * @class systemUserBar
 * @constructor
 * @module common
 * @zindex 50
 */
(function() {
	
	var default_icon = {
		"*": "fa-solid fa-block-question",
		"entity": "fa-solid fa-user",
		"knowledge": "fa-solid fa-brain-circuit",
		"location": "fa-solid fa-location-dot",
		"spell": "fa-solid fa-book-spells",
		"effect": "game-icon game-icon-aura"
	};

	var barSource = {
		"name": "Device Bar",
		"icon": "fa-regular fa-tablet-rugged",
		"userbar_actions": [{},{},{},{},{},{},{},{},{},{},{},{}]
	};

	var keys = [
		"id",
		"targets",
		"source",
		"icon",
		"name",
		"type",
		"use"
	];

	rsSystem.component("systemUserBar", {
		"inherit": true,
		"mixins": [
			rsSystem.components.DNDControlEquipment,
			rsSystem.components.DNDWidgetCore
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
			}
		},
		"computed": {
			// "userbar": function() {
			// 	if(this.entity && this.entity.userbars && this.entity.userbars.length) {
			// 		if(this.entity.userbars.length <= this.storage.index) {
			// 			Vue.set(this.storage, "index", 0);
			// 		}
			// 		if(this.entity.userbars[this.storage.index] && this.universe.index.userbar[this.entity.userbars[this.storage.index]]) {
			// 			return this.universe.index.userbar[this.entity.userbars[this.storage.index]];
			// 		}
			// 	}
			// 	return null;
			// },
			"icon": function() {
				if(this.userbar) {
					return this.userbar.icon;
				}
				return "fa-solid fa-hourglass-empty";
			},
			"title": function() {
				if(this.userbar) {
					return this.userbar.name;
				}
				return "Temporary User Bar - Dies with end of session";
				/*
			},
			"bar": function() {
				var button,
					load,
					bar,
					i;

				
				if(this.userbar) {
					bar = this.userbar.userbar_actions;
				} else if(this.entity) {
					bar = this.storage[this.entity.id];
					if(bar) {
						
					}
				}

				for(i=0; i<bar.length; i++) {
					button = bar[i];
					if(button.id) {
						load = this.universe.getObject(button.id);
						if(button.id && (!button.object || !load || button.object.id !== load.id)) {
							button.status = this.statusIcon(load);
							this.respond[button.id] = true;
							button.object = load;
						} else if(!load && button.object) {
							delete(button.object);
						}
					}
				}


				return this.emptyBar;
				*/
			}
		},
		"data": function() {
			var data = {};

			// data.emptyBar = [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}];
			// data.emptyBar = [];
			data.storageBar = false;
			data.bar = new Array();
			data.inspect = false;
			data.entity = null;
			data.respond = {};
			
			if(this.entity && this.entity.userbars && this.entity.userbars.length) {
				if(this.entity.userbars.length <= this.storage.index) {
					Vue.set(this.storage, "index", 0);
				} else if(this.storage.index < 0) {
					Vue.set(this.storage, "index", this.entity.userbars.length - 1);
				}
				if(this.entity.userbars[this.storage.index] && this.universe.index.userbar[this.entity.userbars[this.storage.index]]) {
					data.userbar = this.universe.index.userbar[this.entity.userbars[this.storage.index]];
				} else {
					data.userbar = null;
				}
			} else {
				data.userbar = null;
			}

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("session:encounter:type", this.respondSessionEncounter);
			rsSystem.EventBus.$on("entity:bar", this.setEntity);
			this.universe.$on("updated", this.updateBar);

			if(this.storage) {
				if(this.storage.entity) {
					this.setEntity(this.universe.index.entity[this.storage.entity]);
				}
				if(typeof(this.storage.index) !== "number") {
					Vue.set(this.storage, "index", 0);
				}
			}

			this.changeBar(this.storage.index);
		},
		"methods": {
			"respondSessionEncounter": function(event) {
				if(!this.profile.encounter_ignore_type) {
					this.setBarByType(event.encounter);
				}
			},
			"getLink": function(index) {
				if(false) {
					if(this.bar && this.bar[index]) {
						return this.bar[index].id;
					}
					return undefined;
				} else {
					return () => {
						if(this.bar && this.bar[index]) {
							return this.bar[index].id;
						}
						return undefined;
					};
				}
			},
			"setBarByType": function(type) {
				var bar,
					i;

				if(this.entity && this.entity.userbars && this.entity.userbars.length) {
					for(i=0; i<this.entity.userbars.length; i++) {
						bar = this.universe.index.userbar[this.entity.userbars[i]];
						if(bar && bar.type === type) {
							Vue.set(this.storage, "type", type);
							this.changeBar(bar);
							return true;
						}
					}
				}

				return false;
			},
			"toggleInspect": function() {
				Vue.set(this, "inspect", !this.inspect);
			},
			"hasCharges": function(object) {
				switch(typeof(object.charges_max)) {
					case "number":
					case "string":
						return true;
				}
				return false;
			},
			"blockButton": function() {
				// No-op function for button drop points on bar
			},
			"addButton": function() {
				this.loadButton(this.userbar.userbar_actions.length);
			},
			"loadButton": function(index) {
				var dropped = rsSystem.dragndrop.general.drop(),
					current = this.userbar.userbar_actions[index],
					button = this.bar[index],
					send;
				console.log("Load Button[" + index + "]: ", dropped, button, current);
				if(!button) {
					button = {};
				}

				if(dropped && (dropped = this.universe.getObject(dropped)) && button) {
					if(this.storageBar) {
						if(button.object && button.object.has_channel) {
							Vue.set(button, "channel", dropped);
							Vue.set(current, "use", dropped.id);
						} else if(button.id !== dropped.id) {
							Vue.set(current, "name", dropped.name);
							Vue.set(current, "icon", dropped.icon);
							Vue.set(current, "type", dropped._class);
							Vue.set(current, "id", dropped.id);
							Vue.set(button, "name", dropped.name);
							Vue.set(button, "icon", dropped.icon);
							Vue.set(button, "type", dropped._class);
							Vue.set(button, "id", dropped.id);
							Vue.set(button, "object", dropped);
						}
					} else {
						send = {
							"bar": this.userbar.id,
							"index": index
						};
						if(button.object && button.object.has_channel) {
							send.object = button.id;
							send.type = button._class;
							send.name = button.name;
							send.icon = button.icon;
							send.channel = dropped.id;
							console.log("Add Channel: ", send);
						} else if(button.id !== dropped.id) {
							send.object = dropped.id;
							send.type = dropped._class;
							send.name = dropped.name;
							send.icon = dropped.icon;
							console.log("Set Button: ", send);
						}
						this.universe.send("userbar:button", send);
					}
				}
			},
			"clearButton": function(button, index) {
				console.log("Clear Button: ", button);
				if(button.id) {
					if(this.storageBar) {
						Vue.delete(button, "object");
						Vue.delete(button, "name");
						Vue.delete(button, "icon");
						Vue.delete(button, "type");
						Vue.delete(button, "id");
					} else {
						this.universe.send("userbar:button", {
							"bar": this.userbar.id,
							"object": null,
							"index": index
						});
					}
				}
			},
			"fireButton": function(button) {
				console.log("Fire Button: ", button);
				var channel,
					details,
					i;

				if(this.inspect) {
					this.info(button.id);
				} else {
					switch(button.activate) {
						// TODO: At the least the button should reference an action or activity that would have additional performance informaiton however an abstraction
						//		layer is maintained for future expansion to say things like weapon open info always or weapon attack always instead of the default
						//		auto interpretations
						case "info":
							this.info(button.id);
							break;
						case "equip":
							break;
						case "equip:mainhand":
							break;
						default:
							if(button.object) {
								switch(button.object._class) {
									case "action":
										switch(button.id) {
											case "action:main:attack":
												channel = button.channel || this.universe.index.item[this.entity.main_weapon];
												if(channel) {
													this.actionDialog(this.universe.index.action["action:main:attack"], channel, [channel.damage]);
												} else {
													this.actionDialog(this.universe.index.action["action:main:attack"]);
												}
												break;
											case "action:bonus:attack:main":
												channel = button.channel || this.universe.index.item[this.entity.main_weapon];
												if(channel) {
													this.actionDialog(this.universe.index.action["action:bonus:attack:main"], channel, [channel.damage]);
												} else {
													this.actionDialog(this.universe.index.action["action:bonus:attack:main"]);
												}
												break;
											case "action:bonus:attack:light":
												if(!button.channel) {
													channel = button.channel;
												} else {
													for(i=0; i<this.entity.equipped.length; i++) {
														channel = this.universe.index.item[this.entity.equipped[i]];
														if(this.isWeapon(channel) && channel !== this.entity.main_weapon) {
															break;
														}
														channel = null;
													}
												}
												if(channel) {
													this.actionDialog(this.universe.index.action["action:bonus:attack:light"], channel, [channel.damage]);
												} else {
													this.actionDialog(this.universe.index.action["action:bonus:attack:light"]);
												}
												break;
											default:
												if(button.object.type === "type:attack") {
													this.actionDialog(this.universe.index.action["action:main:attack"], button.channel, button.channel && button.channel.damage?[button.channel.damage]:undefined);
												} else if(button.object.type === "type:castspell") {
													this.spellDialog(button, button.channel, button.level, button.object);
												} else {
													rsSystem.EventBus.$emit("dialog-open", {
														"title": this.entity.name + " Acting",
														"component": "dndDialogDamage",
														"action": button.id,
														"entity": this.entity
													});
												}
										}
										break;
									case "skill":
										this.performSkillCheck(button.object);
										break;
									case "spell":
										this.spellDialog(button, button.object, button.level || button.object.level);
										break;
									case "item":
										if(button.object.consume) {
											this.consumeItem(button.object);
										} else if(this.entity.equipped && this.entity.equipped.indexOf(button.id) !== -1) {
											if(this.isWeapon(button.object)) {
												if(button.id === this.entity.main_weapon) {
													this.unequipItem(button.id);
												} else {
													this.mainhandItem(button.id);
												}
											} else {
												this.unequipItem(button.id);
											}
										} else if(this.entity.inventory && this.entity.inventory.indexOf(button.id) !== -1) {
											this.equipItem(button.id);
										} else {
											this.info(button.id);
										}
										break;
									default:
										this.info(button.id);
								}
							}
					}
				}
			},
			"actionDialog": function(action, channel) {
				var details = {};
				details.title = this.entity.name + " Acting";
				details.component = "dndDialogDamage";
				details.entity = this.entity;
				details.channel = channel;
				details.action = action;
				rsSystem.EventBus.$emit("dialog-open", details);
			},
			"spellDialog": function(button, spell, level, action) {
				var targets = null,
					details = {},
					damage = {},
					cost = {},
					cast,
					keys,
					i,
					j;


				/*
				* Legacy
				*/
				if(spell && spell.targets && spell.targets.length) {
					targets = spell.targets;
				}

				// Upcast if needed, stored to cast to avoid mutation of spell
				cast = Object.assign({}, spell);
				if(typeof(level) === "number" && spell.level && spell.level !== "0" /* Cantrip Bug/Bad-State handling */ && level > spell.level) {
					cast.level = level;
				} else {
					cast.level = 0;
				}
				console.log("Cast at " + level + ": ", _p(spell), action, cast);

				if(typeof(action) === "string") {
					action = this.universe.index.action[action];
				} else if(!action) {
					if(spell && spell.action_cost && spell.action_cost.main) {
						action = this.universe.index.action["action:main:cast"];
					} else if(spell && spell.action_cost && spell.action_cost.bonus) {
						action = this.universe.index.action["action:bonus:cast:spell"];
					} else if(spell && spell.action_cost && spell.action_cost.reaction) {
						action = this.universe.index.action["action:reaction:spell"];
					}
				} else {
					action = undefined;
				}

				if(spell.damage) {
					keys = Object.keys(spell.damage);
					for(i=0; i<keys.length; i++) {
						damage[keys[i]] = this.computeRoll(spell.damage[keys[i]], cast);
					}
				}

				/*
				* Damage Process UI
				*/
				details.title = this.entity.name + " Actions";
				details.component = "dndDialogDamage";
				details.entity = this.entity;
				details.channel = cast;
				details.action = action;
				details.finished = function(finished) {
					if(finished && finished.spell_level && finished.spell_level !== button.level && finished.spell_level !== spell.level) {
						if(this.storageBar) {
							Vue.set(button, "level", finished.spell_level);
						} else {
							this.universe.send("userbar:button", {
								"bar": this.userbar.id,
								"level": finished.spell_level,
								"index": button.index
							});
						}
					} else if(button.level) {
						if(this.storageBar) {
							Vue.set(button, "level", finished.spell_level);
						} else {
							this.universe.send("userbar:button", {
								"bar": this.userbar.id,
								"level": null,
								"index": button.index
							});
						}
					}
					if(finished.spell_level && finished.spell_level !== spell.level) {
						Vue.set(button, "level", finished.spell_level);
					} else if(button.level) {
						Vue.delete(button, "level");
					}
				};
				rsSystem.EventBus.$emit("dialog-open", details);
			},
			"buttonIcon": function(button) {
				var icon = [button.icon || ""];
				if(this.inspect) {
					icon.push("fa-bounce");
					// Required for bounce, doesn't seem to break the other fonts. Front loaded so that font-family comes from the button.icon (last set seems to win, may be a last loaded state as well)
					icon.unshift("fa");
				}
				return icon.join(" ");
			},
			"statusIcon": function(object) {
				// var classes = [];

				if(object) {
					switch(object._class) {
						case "item":
							if(this.entity.main_weapon === object.id) {
								// classes.push("fa-solid fa-hand-rock");
								return "fa-solid fa-hand-rock";
							} else if(this.entity.equipped && this.entity.equipped.indexOf(object.id) !== -1) {
								// classes.push("fa-light fa-hand-rock");
								return "fa-light fa-hand-rock";
							}
							break;
					}
				}

				// return classes.join(" ");
				return "";
			},
			"wheelIcons": function(event) {
				this.scrollIcons(event.deltaY > 0?1:-1);
				event.stopPropagation();
			},
			"scrollIcons": function(count) {
				var offset = this.$refs.buttons.scrollLeft + count * 65;
				offset = offset - (offset%65);
				this.$refs.buttons.scrollLeft = offset;
			},
			"wheelBar": function(event) {
				this.nextBar(event.deltaY < 0?1:-1);
				event.stopPropagation();
			},
			"nextBar": function(direction) {
				var next = this.storage.index + (direction || 1);
				if(this.entity && this.entity.userbars && this.entity.userbars.length) {
					if(next < 0) {
						next = this.entity.userbars.length - 1;
					} else if(this.entity.userbars.length <= next) {
						next = 0;
					}
				} else {
					next = 0;
				}
				this.changeBar(next);
			},
			"setEntity": function(entity) {
				if(entity && (!this.entity || this.entity.id !== entity.id)) {
					Vue.set(this, "entity", entity);
				} else {
					Vue.set(this, "entity", null);
				}
				if(this.storage) {
					Vue.set(this.storage, "entity", this.entity?this.entity.id:null);
					if(typeof(this.storage.index) === "number") {
						this.changeBar(this.storage.index);
					} else if(this.storage.type) {
						if(!this.setBarByType(this.storage.type)) {
							this.changeBar(0);
						}
					} else {
						this.changeBar(0);
					}
				} else {
					this.changeBar(0);
				}
				
			},
			"closeBar": function() {
				this.setEntity(null);
			},
			"detectEntityUpdate": function(event) {
				if(this.entity && event && (this.respond[event.id] || event.id === this.entity.id)) {
					this.updateBar();
				}
			},
			"changeBar": function(index) {
				var bar;
				if(this.entity) {
					switch(typeof(index)) {
						case "number":
							if(this.entity && this.entity.userbars && this.entity.userbars.length) {
								if(this.entity.userbars.length <= index) {
									index = 0;
								} else if(index < 0) {
									index = this.entity.userbars.length - 1;
								}
								bar = this.universe.getObject(this.entity.userbars[index]);
								if(!bar) {
									// TODO: Broadcast Important Warning
									console.warn("Unable to find bar at index " + index + " for " + this.entity.id);
								}
							}
							break;
						case "string":
							bar = this.universe.index.userbar[index];
							index = this.entity.userbars.indexOf(index);
							break;
						case "object":
							bar = index;
							index = this.entity.userbars.indexOf(bar.id);
							break;
					}

					if(bar) {
						if(this.storageBar) {
							Vue.set(this, "storageBar", false);
						}
					} else {
						bar = this.storage[this.entity.id];
						Vue.set(this, "storageBar", true);
						if(!bar) {
							bar = Object.assign({}, barSource);
							Vue.set(this.storage, this.entity.id, bar);
							bar = this.storage[this.entity.id];
							console.warn("Made New Device Bar: ", _p(bar));
						}
					}

					Vue.set(this.storage, "index", index);
					Vue.set(this, "userbar", bar);
					this.updateBar(true);
				}
			},
			"updateBar": function(rebuild) {
				if(this.entity) {
					var button,
						i,
						j;

					if(rebuild) {
						this.bar.length = this.userbar.userbar_actions.length;
						for(i=0; i<this.bar.length; i++) {
							if(typeof(this.bar[i]) !== "object" || this.bar[i] === null) {
								Vue.set(this.bar, i, {});
							}
							if(this.userbar.userbar_actions[i]) {
								for(j=0; j<keys.length; j++) {
									Vue.set(this.bar[i], keys[j], this.userbar.userbar_actions[i][keys[j]] || null);
								}
							} else {
								for(j=0; j<keys.length; j++) {
									Vue.delete(this.bar[i], keys[j]);
								}
							}
						}
					}
					
					for(i=0; i<this.bar.length; i++) {
						button = this.bar[i];
						button.index = i;
						if(button.id) {
							if(button.object !== false && (!button.object || button.object.id !== button.id)) {
								button.object = this.universe.getObject(button.id);
								button.type = button.object._class;
							}
							if(button.object) {
								Vue.set(button, "status", this.statusIcon(button.object));
							} else {
								Vue.delete(button, "status");
								Vue.delete(button, "icon");
							}
							if(button.use && (!button.channel || button.channel.id !== button.use)) {
								Vue.set(button, "channel", this.universe.getObject(button.use));
								if(!button.channel) {
									// TODO: Warn Masters
									console.warn("Button Channel Object " + button.use + " not found");
									// TODO: Delete `use` property
								}
							} else {
								Vue.delete(button, "channel");
							}
							if(!button.icon) {
								if(default_icon[button.type]) {
									button.icon = default_icon[button.type];
								} else {
									button.icon = default_icon;
								}
							}
						} else if(button.object) {
							Vue.delete(button, "channel");
							Vue.delete(button, "object");
							Vue.delete(button, "status");
							Vue.delete(button, "level");
						}
					}
				}
			},
			"getBarClasses": function() {
				var classes = [];
				if(!this.entity) {
					classes.push("collapsed");
				}
				return classes.join(" ");
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("session:encounter:type", this.respondSessionEncounter);
			rsSystem.EventBus.$off("entity:bar", this.setEntity);
			this.universe.$off("updated", this.updateBar);
		},
		"template": Vue.templified("components/system/userbar.html")
	});
})();
