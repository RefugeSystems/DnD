/**
 *
 *
 * @class DNDInventory
 * @constructor
 * @module Components
 */
rsSystem.component("DNDInventory", {
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
			"required": true,
			"type": Object
		}
	},
	"computed": {
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
		"entity": function() {
			return this.universe.index.entity[this.$route.params.entity || this.player.attribute.playing_as];
		},
		"today": function() {
			return this.universe.calendar.toDisplay(this.universe.time, false);
		},
		"slots": function() {
			var result = [],
				islots,
				slots,
				slot,
				item,
				e,
				i;

			if(this.entity.equip_slots) {
				slots = Object.keys(this.entity.equip_slots);
				for(i=0; i<slots.length; i++) {
					slot = this.universe.index.slot[slots[i]];
					if(slot) {
						if(this.sloted[slot.id]) {
							this.sloted[slot.id].splice(0);
						} else {
							Vue.set(this.sloted, slot.id, []);
						}
						result.push(slot);
					}
				}
				result.sort(rsSystem.utility.sortByName);

				if(this.entity.equipped) {
					for(i=0; i<this.entity.equipped.length; i++) {
						item = this.universe.index.item[this.entity.equipped[i]];
						if(item && item.equip_slots) {
							islots = Object.keys(item.equip_slots);
							for(e=0; e<islots.length; e++) {
								this.sloted[islots[e]].push(item);
							}
						}
					}

					islots = Object.keys(this.sloted);
					for(i=0; i<islots.length; i++) {
						this.sloted[islots[i]].sort(rsSystem.utility.sortByName);
					}
				}
			}

			return result;
		},
		"max_bag_weight": function() {
			return this.entity.encumberance_max?this.entity.encumberance_max:0;
		},
		"bag_weight_classing": function() {
			if(this.max_bag_weight < this.bag_weight) {
				Vue.set(this, "bag_weight_color", "light-red");
				return "fa-solid fa-scale-unbalanced-flip rs-light-red";
			} else if((.8 * this.max_bag_weight) < this.bag_weight) {
				Vue.set(this, "bag_weight_color", "yellow");
				return "fa-solid fa-scale-balanced rs-yellow";
			} else {
				Vue.set(this, "bag_weight_color", "light-green");
				return "fa-solid fa-scale-unbalanced rs-light-green";
			}
		},
		"inventory": function() {
			var inventory = [],
				weight = 0,
				cats = {},
				entity,
				item,
				i,
				j;

			Vue.set(this, "held_by", {});
			if(this.entity && this.entity.owned[this.player.id] || this.player.gm) {
				for(i=0; i<this.entity.inventory.length; i++) {
					item = this.universe.getObject(this.entity.inventory[i]);
					if(item) {
						Vue.set(this.held_by, item.id, this.entity.nickname || this.entity.name);
						// console.log("Add Weight: " + item.weight);
						weight += item.weight || 0;
						inventory.push(item);
					} else {
						console.warn("Item Missing: " + this.entity.inventory[i]);
					}
				}
				if(!this.$route.params.entity && this.storage.show_shared) {
					if(this.meeting && this.meeting.entities) {
						for(j=0; j<this.meeting.entities.length; j++) {
							if(!this.entity || this.meeting.entities[j] !== this.entity.id) {
								entity = this.universe.getObject(this.meeting.entities[j]);
								if(entity.inventory_share || entity.owned[this.player.id]) {
									for(i=0; i<entity.inventory.length; i++) {
										if(!entity.inventory_hidden || !entity.inventory_hidden[entity.inventory[i]]) {
											item = this.universe.getObject(entity.inventory[i]);
											if(item) {
												Vue.set(this.held_by, item.id, entity.nickname || entity.name);
												inventory.push(item);
											} else {
												console.warn("Item Missing: " + entity.inventory[i]);
											}
										}
									}
								}
							}
						}
					}
				}
			}

			// console.log("Bag Weight: " + weight);
			Vue.set(this, "bag_weight", weight);
			return inventory;
		}
	},
	"watch": {
		"entity.inventory_share": function(set) {
			if(this.share) {
				if(set) {
					Vue.set(this.share, "icon", "fas fa-users");
				} else {
					Vue.set(this.share, "icon", "fas fa-users-slash");
				}
			}
		},
		"entity.inventory_hidden": function() {
			this.buildControls();
		}
	},
	"data": function() {
		var reference = this,
			data = {},
			slots,
			slot,
			item,
			e,
			i;

		data.categories = [];
		data.headings = ["icon", "name", "types", "held_by", "acquired", "age", "info"];
		data.additionalHeaders = ["held_by", "info"];
		data.held_by = {};
		data.actions = {};
		data.actions.held_by = (record) => {
			this.info(this.universe.named[this.held_by[record.id]]);
		};
		data.actions.info = (record) => {
			this.info(record);
		};
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
		data.formatter.age = (value, record, header) => {
			if(typeof(record.acquired) === "number") {
				return this.universe.calendar.displayDuration(this.universe.time - record.acquired, false, false);
			}
			return value;
		};
		data.formatter.icon = (value, record) => {
			var classes = "";
			if(record) {
				if(this.entity.inventory_hidden && this.entity.inventory_hidden[record.id]) {
					classes += "hidden_item ";
				}
				if(this.entity.equipped && this.entity.equipped.indexOf(record.id) !== -1) {
					classes += "equipped_item ";
				}
				if(record.attuned === this.entity.id) {
					classes += "attuned_item ";
				}
			}
			return "<span class=\"" + classes + (value || "") + "\"></span>";
		};
		data.formatter.info = () => {
			return "<span class=\"fas fa-info-circle\"></span>";
		};
		data.formatter.damage = (value, record, header) => {
			if(typeof(value) === "object") {
				var keys = Object.keys(value),
					html = [],
					damage,
					roll,
					i;

				if(record) {
					for(i=0; i<keys.length; i++) {
						if(value[keys[i]] && (damage = this.universe.index.damage_type[keys[i]])) {
							roll = rsSystem.dnd.reducedDiceRoll(value[keys[i]], record);
							html.push("<span class=\"" + damage.icon + "\" title=\"" + keys[i] + "\"></span> " + roll);
						}
					}
				}
				
				return html.join("</br>");
			}
			return 0;
		};
		data.formatter.category = (value) => {
			if(value && (value = this.universe.getObject(value))) {
				return value.name;
			}
			return "";
		};

		data.sorts = {};
		data.sorts.damage = (a, b) => {
			var va = "",
				vb = "",
				keys,
				i;

			if(a) {
				keys = Object.keys(a);
				for(i=0; i<keys.length; i++) {
					if(a[keys[i]]) {
						va += keys[i] + ": " + a[keys[i]] + " ";
					}
				}
			}
			if(b) {
				keys = Object.keys(b);
				for(i=0; i<keys.length; i++) {
					if(b[keys[i]]) {
						vb += keys[i] + ": " + b[keys[i]] + " ";
					}
				}
			}
			if(va < vb) {
				return -1;
			} else if(va > vb) {
				return 1;
			}
			return 0;
		};
		data.sorts.held_by = (va, vb, a, b) => {
			a = this.held_by[a.id] || "";
			b = this.held_by[b.id] || "";
			if(a && !b) {
				return -1;
			} else if(!a && b) {
				return 1;
			} else if(!a && !b) {
				return 0;
			} else if(a < b) {
				return -1;
			} else if(a > b) {
				return 1;
			}
			return 0;
		};

		// TODO: Find a better way to place the share button
		data.share = {};
		data.share.title = "Toggle Inventory Sharing";
		data.share.process = function() {
			if(reference.entity) {
				reference.universe.send("inventory:sharing", {
					"entity": reference.entity.id,
					"state": !reference.entity.inventory_share
				});
			}
		};

		data.bag_weight_color = "white";
		data.controls = [];
		data.attunable = [];
		data.unattunable = [];
		data.bag_weight = 0;
		data.sloted = {};
		data.attuned = 0;

		data.recipes = [];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.entity) {
			if(this.entity.inventory_share) {
				Vue.set(this.share, "icon", "fas fa-users-slash");
			} else {
				Vue.set(this.share, "icon", "fas fa-users");
			}
		}
		if(this.entity.recipes && this.entity.recipes.length) {
			this.universe.transcribeInto(this.entity.recipes, this.recipes, "recipe");
		}
		if(this.storage.processing) {
			Vue.set(this.storage, "processing", null);
		}
		if(this.storage.show_shared === undefined) {
			Vue.set(this.storage, "show_shared", false);
		}
		this.universe.$on("updated", this.checkUpdate);
		this.buildControls();
	},
	"methods": {
		"checkUpdate": function(event) {
			if(this.entity && this.entity.id === event.id) {
				if(this.entity.recipes && this.entity.recipes.length !== this.recipes.length) {
					this.recipes.splice(0);
					this.universe.transcribeInto(this.entity.recipes, this.recipes, "recipe");
				}
				Vue.set(this.storage, "processing", null);
				this.buildControls();
			}
		},
		"displayNumber": function(number) {
			if(typeof(number) === "number") {
				return number.toFixed(2);
			}
			return number;
		},
		"viewEquiped": function() {
			var details = {};
			details.component = "dndDialogEquiped";
			details.entity = this.entity;
			rsSystem.EventBus.$emit("dialog-open", details);
		},
		"buildControls": function() {
			var selected = this.storage && this.storage.selected?Object.keys(this.storage.selected):[],
				reference = this,
				hide = false,
				show = false,
				v1h = false,
				v2h = false,
				unequip = [],
				recipes = [],
				attuned = 0,
				equip = [],
				items = [],
				types = [],
				parental,
				buffer,
				parts,
				item,
				i,
				j;

			this.unattunable.splice(0);
			this.attunable.splice(0);
			this.controls.splice(0);
			if(this.entity && this.share) {
				this.controls.push(this.share);
			}

			for(i=0; i<this.universe.listing.item.length; i++) {
				item = this.universe.listing.item[i];
				if(item && item.attuned === this.entity.id && rsSystem.utility.isValid(item)) {
					attuned++;
				}
			}
			Vue.set(this, "attuned", attuned);

			for(i=0; i<selected.length; i++) {
				buffer = this.universe.index.item[selected[i]];
				if(buffer && !buffer.disabled && !buffer.is_preview && (this.entity.owned[this.player.id] || this.player.gm) && this.entity.inventory.indexOf(buffer.id) !== -1) {
					if(buffer.types) {
						types = types.concat(buffer.types);
					}
					for(j=0; j<this.storage.selected[buffer.id]; j++) {
						items.push(buffer.id);
					}
					if(this.entity.inventory_hidden && this.entity.inventory_hidden[buffer.id]) {
						show = true;
					} else {
						hide = true;
					}
					if(buffer.equip_slots && Object.keys(buffer.equip_slots).length) {
						if(!this.entity.equipped || this.entity.equipped.indexOf(buffer.id) === -1) {
							equip.push(buffer.id);
						} else {
							unequip.push(buffer.id);
						}
						if(buffer.versatile && buffer.is_copy) {
							if(buffer.parent === buffer.versatility[1]) {
								v2h = true;
							} else if(buffer.parent === buffer.versatility[2]) {
								v1h = true;
							}
						}
					}
					if(buffer.attunes) {
						if(buffer.attuned === this.entity.id) {
							this.unattunable.push(buffer.id);
						} else {
							this.attunable.push(buffer.id);
						}
					}
				}
			}

			if(selected.length) {
				parental = rsSystem.utility.expandParentalKeys(selected);
				for(i=0; i<this.recipes.length; i++) {
					buffer = this.recipes[i];
					if(buffer.input_components && (buffer.input_components.hasCommon(parental) || buffer.input_components.hasCommon(types))) {
						recipes.push(buffer);
					}
				}
			}

			if(this.storage.show_shared) {
				this.controls.push({
					"title": "Click toggle shared items. They are currently shown.",
					"icon": "fas fa-backpack rs-green",
					"process": function() {
						Vue.set(reference.storage, "show_shared", false);
						reference.buildControls();
					}
				});
			} else {
				this.controls.push({
					"title": "Click toggle shared items. They are currently hidden.",
					"icon": "fas fa-backpack rs-light-red",
					"process": function() {
						Vue.set(reference.storage, "show_shared", true);
						reference.buildControls();
					}
				});
			}
			if(selected.length) {
				this.controls.push({
					"title": "Drop Items",
					"icon": "fas fa-arrow-alt-to-bottom",
					"process": function() {
						rsSystem.utility.clearObject(reference.storage.selected);
						reference.universe.send("inventory:drop", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
				this.controls.push({
					"title": "Give Items",
					"icon": "fas fa-people-carry",
					"process": function() {
						rsSystem.EventBus.$emit("dialog-open", {
							"component": "dndDialogGive",
							"entity": reference.entity.id,
							"finish": function(target) {
								if(target && target.id) {
									rsSystem.utility.clearObject(reference.storage.selected);
									reference.universe.send("inventory:give", {
										"items": items,
										"entity": reference.entity.id,
										"target": target.id
									});
								}
							}
						});
					}
				});
			}
			if(hide) {
				this.controls.push({
					"title": "Hide Items",
					"icon": "fas fa-eye-slash",
					"process": function() {
						reference.universe.send("inventory:hide", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(show) {
				this.controls.push({
					"title": "Reveal Items",
					"icon": "fas fa-eye",
					"process": function() {
						reference.universe.send("inventory:reveal", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(equip.length) {
				this.controls.push({
					"title": "Equip Items",
					"icon": "game-icon game-icon-sword-brandish",
					"process": function() {
						reference.universe.send("equip:items", {
							"items": equip,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(unequip.length) {
				this.controls.push({
					"title": "Unequip Items",
					"icon": "game-icon game-icon-drop-weapon",
					"process": function() {
						reference.universe.send("unequip:items", {
							"items": unequip,
							"entity": reference.entity.id
						});
					}
				});
				if(unequip.length === 1) {
					this.controls.push({
						"title": "Main Hand",
						"icon": "fas fa-hand-rock",
						"process": function() {
							reference.universe.send("item:mainhand", {
								"item": unequip[0],
								"entity": reference.entity.id
							});
						}
					});
				}
			}
			if(this.entity.main_weapon) {
				this.controls.push({
					"title": "Remove Main Weapon",
					"icon": "fal fa-hand-rock rot180",
					"process": function() {
						reference.universe.send("item:mainhand", {
							"item": null,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(v1h) {
				this.controls.push({
					"title": "Switch to 1 Handed",
					"icon": "fad fa-praying-hands rs-secondary-transparent",
					"process": function() {
						reference.universe.send("items:verstility:1handed", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(v2h) {
				this.controls.push({
					"title": "Switch to 2 Handed",
					"icon": "fas fa-praying-hands",
					"process": function() {
						reference.universe.send("items:verstility:2handed", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(this.attunable.length) {
				this.controls.push({
					"title": "Attune",
					"icon": "fas fa-user-lock",
					"process": function() {
						reference.universe.send("items:attune", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(this.unattunable.length) {
				this.controls.push({
					"title": "Unattune",
					"icon": "fas fa-user-unlock",
					"process": function() {
						reference.universe.send("items:unattune", {
							"items": items,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(recipes.length) {
				this.controls.push({
					"title": "Craft",
					"icon": "game-icon game-icon-anvil-impact",
					"process": () => {
						var parts = [],
							id,
							i,
							j;

						if(selected.length) {
							for(i=0; i<selected.length; i++) {
								id = selected[i];
								for(j=0; j<this.storage.selected[id]; j++) {
									parts.push(id);
								}
							}
							rsSystem.utility.clearObject(this.storage.selected);
							rsSystem.EventBus.$emit("dialog-open", {
								"component": "dndDialogCraft",
								"source": reference.entity.id,
								"target": reference.entity.id,
								"ingredients": parts,
								"recipes": recipes
							});
						}
					}
				});
			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.checkUpdate);
	},
	"template": Vue.templified("pages/dnd/inventory.html")
});
