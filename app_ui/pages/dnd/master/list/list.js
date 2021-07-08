/**
 *
 *
 * @class DNDMasterList
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMasterList", {
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
		"inventory": function() {
			var inventory = [],
				cats = {},
				entity,
				item,
				i,
				j;

			Vue.set(this, "held_by", {});
			if(this.entity.owned[this.player.id]) {
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
		},
		"entity.inventory_hidden": function() {
			this.buildControls();
		}
	},
	"data": function() {
		var reference = this,
			data = {};

		data.categories = [];
		data.headings = ["icon", "name", "types", "acquired"];
		data.held_by = {};
		data.actions = {};
		data.formatter.acquired = (value, record, header) => {
			if(typeof(value) === "number") {
				return this.universe.calendar.toDisplay(value, false, false);
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

		data.controls = [];
		data.preparable = [];
		data.forgettable = [];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.buildControls();
	},
	"methods": {
		"buildControls": function() {
			var selected = Object.keys(this.storage.selected),
				reference = this,
				forgettable = [],
				preparable = [],
				buffer,
				i;

			this.controls.splice(0);
			preparable.splice(0);
			forgettable.splice(0);

			for(i=0; i<selected.length; i++) {
				buffer = this.universe.index.spell[selected[i]];
				if(buffer && !buffer.disabled && !buffer.is_preview && buffer.caster === this.entity.id) {
					if(this.entity.spells_known[buffer.id]) {
						if(this.entity._data.spells.indexOf(buffer.id) === -1) {
							preparable.push(buffer.id);
						} else {
							forgettable.push(buffer.id);
						}
					}
				}
			}

			if(preparable.length) {
				this.controls.push({
					"title": "Prepare Spells",
					"icon": "fas fa-link",
					"process": function() {
						reference.universe.send("spells:prepare", {
							"spells": preparable,
							"entity": reference.entity.id
						});
					}
				});
			}
			if(forgettable.length) {
				this.controls.push({
					"title": "Unprepare Spells",
					"icon": "fas fa-unlink",
					"process": function() {
						reference.universe.send("spells:unprepare", {
							"spells": forgettable,
							"entity": reference.entity.id
						});
					}
				});
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/master/list.html")
});
