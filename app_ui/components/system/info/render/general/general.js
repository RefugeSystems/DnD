
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
			if(event.id === this.entity.id) {
				this.populateControls();
			}
		},
		"populateControls": function() {
			var entity = this.playerCharacter || this.getPlayerCharacter(),
				character = this.info.character || this.info.caster || this.info.user, 
				object = this.info,
				loading;

			this.controls.splice(0);
			if(!this.info.is_preview && this.info._class) {
				if(this.player) {
					if(this.info._class === "location") {
						if(this.info.map) {
							this.controls.push({
								"title": "Pull up the map of this location",
								"icon": "fas fa-location-circle",
								"type": "button",
								"action": "goto"
							});
						}
					}
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
						if(this.info._class === "entity") {
							this.controls.push({
								"title": "Assume Entity in Overview",
								"icon": "game-icon game-icon-console-controller",
								"type": "button",
								"action": "assume"
							});
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
					} else if(this.info._class === "entity" && this.info.owned && this.info.owned[this.player.id]) {
						this.controls.push({
							"title": "Assume Entity in Overview",
							"icon": "game-icon game-icon-console-controller",
							"type": "button",
							"action": "assume"
						});
					}
					if(entity) {
						// this.controls.push({
						// 	"title": "Create knowledge for this " + entity.name,
						// 	"icon": "fas fa-brain",
						// 	"type": "button",
						// 	"action": "knowing"
						// });
						switch(this.info._class) {
							case "effect":
								if(entity.effects.indexOf(this.info.id) !== -1 && (!this.info.is_locked || this.player.gm)) {
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
									this.controls.push({
										"title": "Open spellbook for " + entity.name,
										"icon": "fas fa-book-spells",
										"type": "button",
										"action": "spellbook"
									});
									this.controls.push({
										"title": "Play as " + entity.name,
										"icon": "fas fa-user",
										"type": "button",
										"action": "assume"
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
					if(character && !this.info.is_singular) {
						this.controls.push({
							"title": "Edit description for " + this.info.name,
							"icon": "fas fa-edit",
							"type": "button",
							"action": "edit-description"
						});
					}
				}
			}
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
					rsSystem.toPath("/map/" + this.info.id);
					break;
				case "assume":
					if(this.player.gm) {
						this.universe.send("master:assume", {"entity": this.info.id});
					} else if(this.info.played_by === this.player.id) {
						this.universe.send("entity:assume", {"entity": this.info.id});
					}
					break;
				case "obscure":
					this.universe.send("master:obscure", {
						"object": this.info.id,
						"obscured": true
					});
					break;
				case "unobscure":
					this.universe.send("master:obscure", {
						"object": this.info.id,
						"obscured": false
					});
					break;
				case "revoke":
					this.universe.send("effect:revoke", {
						"effects": [this.info.id],
						"from": [entity.id]
					});
					break;
				case "edit-description":
					Vue.set(this, "editDescription", this.info.description);
					Vue.set(this, "editing", true);
					break;
				case "cancel-description":
					Vue.set(this, "editing", false);
					break;
				case "send-description":
					console.log(" [Edit]>> ", control, this.editDescription);
					Vue.set(this, "editing", false);
					this.universe.send("object:describe", {
						"id": this.info.id,
						"description": this.editDescription
					});
					break;
				case "give":
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogGive",
						"entity": entity.id,
						"finish": (target) => {
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
					rsSystem.EventBus.$emit("dialog-open", {
						"component": "dndDialogKnowing",
						"entity": entity.id,
						"finish": (target) => {
							console.log("Finish: ", target);
						}
					});
					break;
				case "inventory":
					rsSystem.toPath("/inventory/" + this.info.id);
					break;
				case "spellbook":
					rsSystem.toPath("/spells/" + this.info.id);
					break;
				case "equip":
					this.equipItem(this.info.id, entity);
					break;
				case "mainhand":
					this.mainhandItem(this.info.id, entity);
					break;
				case "unmainhand":
					this.mainhandItem(null, entity);
					break;
				case "unequip":
					this.unequipItem(this.info.id, entity);
					break;
				case "drop":
					this.dropItem(this.info.id, entity);
					break;
				case "color":
					this.universe.send("master:recolor", {
						"object": this.info.id,
						"color": control._value
					});
					if(control.options.indexOf[control._value] === -1) {
						control._missing = control._value;
					} else {
						Vue.delete(control, "_missing");
					}
					break;
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
