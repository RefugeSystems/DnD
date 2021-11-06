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
				var prepared = this.universe.transcribeInto(this.entity.spells_prepared, [], "spell"),
					map = {},
					spell,
					i;

				if(this.prepared_spells && this.prepared_cantrips) {
					this.prepared_cantrips.splice(0);
					this.prepared_spells.splice(0);
					for(i=0; i<prepared.length; i++) {
						spell = prepared[i];
						map[spell.id] = true;
						if(spell.level === 0) {
							this.prepared_cantrips.push(spell);
						} else if(spell.level > 0) {
							this.prepared_spells.push(spell);
						}
					}
					return map;
				}
			}
			return {};
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

		data.prepared_cantrips = [];
		data.prepared_spells = [];

		data.categories = [];
		data.headings = ["icon", "name", "level", "damage", "acquired", "info"];
		data.additionalHeaders = ["info"];
		data.controls = [];
		data.held_by = {};
		data.actions = {};
		data.actions.info = (record) => {
			this.info(record);
		};

		data.formatter = {};
		data.formatter.acquired = (value, record, header) => {
			if(typeof(value) === "number") {
				return this.universe.calendar.toDisplay(value, false, false);
			}
			return value;
		};
		data.formatter.level = (value, record, header) => {
			if(typeof(value) === "number") {
				if(value === 0) {
					return "Cantrip";
				}
				return value;
			}
			return 0;
		};
		data.formatter.damage = (value, record, header) => {
			if(typeof(value) === "object") {
				var keys = Object.keys(value),
					html = [],
					damage,
					roll,
					i;

				for(i=0; i<keys.length; i++) {
					if(value[keys[i]] && (damage = this.universe.index.damage_type[keys[i]])) {
						roll = rsSystem.dnd.reducedDiceRoll(value[keys[i]], record);
						html.push("<span class=\"" + damage.icon + "\"></span> " + roll);
					}
				}
				
				return html.join("</br>");
			}
			return 0;
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
		data.formatter.info = () => {
			return "<span class=\"fas fa-info-circle\"></span>";
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
		data.sorts.prepared_by = (a, b) => {
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
		this.universe.$on("updated", this.checkUpdate);
	},
	"methods": {
		"checkUpdate": function(event) {
			if(this.entity && this.entity.id === event.id) {
				this.buildControls();
			}
		},
		"buildControls": function() {
			var selected = Object.keys(this.storage.selected),
				prepared = this.prepared,
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
						if(this.prepared[buffer.id]) {
							forgettable.push(buffer.id);
						} else {
							preparable.push(buffer.id);
						}
					}
				}
			}

			this.controls.push({
				"title": "Acquire Additional Spells",
				"icon": "fas fa-book-open",
				"process": () => {
					var knowns = this.universe.transcribeInto(this.entity.spells_known, []),
						details = {},
						known = {},
						object,
						i;
		
					details.title = this.entity.name;
					details.component = "dndDialogList";
					details.sections = ["no_school", "known"];
					details.cards = {
						"no_school": {
							"name": "No School",
							"icon": "fas fa-cube"
						},
						"known": {
							"name": "Already Known",
							"icon": "fas fa-cube"
						}
					};
					details.limit = 10,
					details.data = {
						"no_school": [],
						"known": []
					};
		
					details.activate = (section, object) => {
						if(!known[object.id]) {
							this.universe.send("spells:grant", {
								"entities": [this.entity.id],
								"spells": [object.id]
							});
						} else {
							this.info(object);
							console.log("Already Known");
						}
					};
					
					for(i=0; i<knowns.length; i++) {
						object = knowns[i];
						known[object.id] = true;
						if(object.parent) {
							known[object.parent] = true;
						}
					}

					for(i=0; i<this.universe.listing.spell.length; i++) {
						object = this.universe.listing.spell[i];
						if(object && !object.disabled && !object.is_disabled && !object.is_copy && !object.is_preview && !object.is_deprecated && (object.selectable || object.is_selectable)) {
							if(known[object.id]) {
								details.data.known.push(object);
							} else if(object.type) {
								if(!details.data[object.type]) {
									details.data[object.type] = [];
									details.cards[object.type] = {};
									if(this.universe.index.type[object.type]) {
										details.cards[object.type].icon = this.universe.index.type[object.type].icon || "fas fa-cube";
										details.cards[object.type].name = this.universe.index.type[object.type].name || object.type;
									} else {
										details.cards[object.type].icon = "fas fa-cube";
										details.cards[object.type].name = "Unknown: " + object.type;
									}
									details.sections.unshift(object.type);
								}
								details.data[object.type].push(object);
							} else {
								details.data.no_school.push(object);
							}
						}
					}
		
					console.log("Open Details: ", details);
					rsSystem.EventBus.$emit("dialog-open", details);
				}
			});
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
		this.universe.$off("updated", this.checkUpdate);
	},
	"template": Vue.templified("pages/dnd/spells.html")
});
