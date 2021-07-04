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
			return this.universe.index.entity[this.player.attribute.playing_as];
		},
		"today": function() {
			return this.universe.calendar.toDisplay(this.universe.time, false);
		},
		"inventory": function() {
			var inventory = [],
				cats = {},
				entity,
				item,
				i,
				j;

			Vue.set(this, "held_by", {});
			if(this.entity) {
				for(i=0; i<this.entity.inventory.length; i++) {
					item = this.universe.getObject(this.entity.inventory[i]);
					if(item) {
						Vue.set(this.held_by, item.id, this.entity.nickname || this.entity.name);
						inventory.push(item);
					} else {
						console.warn("Item Missing: " + this.entity.inventory[i]);
					}
				}
			}
			if(this.meeting && this.meeting.entities) {
				for(j=0; j<this.meeting.entities.length; j++) {
					if(!this.entity || this.meeting.entities[j] !== this.entity.id) {
						entity = this.universe.getObject(this.meeting.entities[j]);
						if(entity.inventory_share) {
							for(i=0; i<entity.inventory.length; i++) {
								console.log("Hide: ", entity.inventory_hidden);
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

			return inventory;
		}
	},
	"watch": {
		"entity.inventory_share": function(set) {
			if(this.share) {
				if(set) {
					Vue.set(this.share, "icon", "fas fa-users-slash");
				} else {
					Vue.set(this.share, "icon", "fas fa-users");
				}
			}
		}
	},
	"data": function() {
		var reference = this,
			data = {};

		data.categories = [];
		data.headings = ["icon", "name", "types", "held_by", "acquired", "age"];
		data.held_by = {};
		data.actions = {};
		data.actions.held_by = (record) => {
			this.info(this.universe.named[this.held_by[record.id]]);
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
			if(record && this.entity.inventory_hidden && this.entity.inventory_hidden[record.id]) {
				return "<span class=\"hidden_item " + (value || "") + "\"></span>";
			} else {
				return "<span class=\"" + (value || "") + "\"></span>";
			}
		};
		data.formatter.category = (value) => {
			if(value && (value = this.universe.getObject(value))) {
				return value.name;
			}
			return "";
		};

		data.sorts = {};
		data.sorts.held_by = (a, b) => {
			a = this.universe.getObject(a) || {};
			b = this.universe.getObject(b) || {};
			if(a.name < b.name) {
				return -1;
			} else if(a.name > b.name) {
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

		data.controls = [data.share, {
			"name": "",
			"icon": "fas fa-eye-slash",
			"process": function() {
				console.log("Selected: ", reference.storage.selected);
				reference.universe.send("inventory:hide", {
					"items": Object.keys(reference.storage.selected),
					"entity": reference.entity.id
				});
			}
		}, {
			"name": "",
			"icon": "fas fa-eye",
			"process": function() {
				console.log("Selected: ", reference.storage.selected);
				reference.universe.send("inventory:reveal", {
					"items": Object.keys(reference.storage.selected),
					"entity": reference.entity.id
				});
			}
		}];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.entity.inventory_share) {
			Vue.set(this.share, "icon", "fas fa-users-slash");
		} else {
			Vue.set(this.share, "icon", "fas fa-users");
		}
	},
	"methods": {
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/inventory.html")
});
