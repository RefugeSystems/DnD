/**
 *
 *
 * @class DNDSpells
 * @constructor
 * @module Components
 */
rsSystem.component("DNDSpells", {
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
		"entity": function() {
			if(this.player && this.player.attribute) {
				return this.universe.index.entity[this.$route.params.entity || this.player.attribute.playing_as];
			}
			return null;
		},
		"today": function() {
			return this.universe.calendar.toDisplay(this.universe.time, false);
		},
		"spells": function() {
			if(this.entity && this.entity.spells) {
				return this.universe.transcribeInto(this.entity.spells, [], "spell");
			}
			return [];
		},
		"prepared": function() {
			if(this.entity && this.entity.spells_prepared) {
				return this.universe.transcribeInto(this.entity.spells_prepared, [], "spell");
			}
			return [];
		},
		"known": function() {
			if(this.entity && this.entity.spells_known) {
				return this.universe.transcribeInto(this.entity.spells_known, [], "spell");
			}
			return [];
		}
	},
	"data": function() {
		var data = {};

		data.categories = [];
		data.headings = ["icon", "name", "damage", "acquired"];
		data.controls = [];
		data.held_by = {};
		data.actions = {};

		data.formatter = {};
		data.formatter.acquired = (value, record, header) => {
			if(typeof(value) === "number") {
				return this.universe.calendar.toDisplay(value, false, false);
			}
			return value;
		};
		data.formatter.icon = (value, record) => {
			var classes = "";
			if(record) {
				if(this.spells.indexOf(record) !== -1) {
					classes += "prepared-spell ";
				} else if(this.known.indexOf(record) === -1) {
					classes += "inherited-spell ";
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
					if(this.entity.spells_known.indexOf(buffer.id) !== -1) {
						if(this.entity.spells.indexOf(buffer.id) === -1) {
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
	"template": Vue.templified("pages/dnd/spells.html")
});