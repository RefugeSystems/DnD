
/**
 *
 *
 * @class DNDKnowledge
 * @constructor
 * @module Components
 */
rsSystem.component("DNDKnowledge", {
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
		"classifications": function() {
			// Include Categories from Obscured knowledge as well - This is to grant categories without cluttering knowledge
			var classifications = {},
				categories = {},
				states = {},
				category,
				state,
				i;

			for(i=0; i<this.knowledge.length; i++) {
				categories[this.knowledge[i].category] = true;
				states[this.knowledge[i].state] = true;
			}

			categories = Object.keys(categories);
			classifications.categories = [];
			for(i=0; i<categories.length; i++) {
				category = this.universe.index.category[categories[i]];
				if(category && !category.is_preview) {
					classifications.categories.push(category);
				}
			}
			states = Object.keys(states);
			classifications.states = [];
			for(i=0; i<states.length; i++) {
				state = this.universe.index.category[states[i]];
				if(state && !state.is_preview) {
					classifications.categories.push(state);
				}
			}

			return classifications;
		},
		"knowledge": function() {
			var known = [],
				cats = {},
				knowledge,
				entity,
				i,
				j;

			if(this.entity.owned[this.player.id] || this.player.gm) {
				Vue.set(this, "known_by", {});
				entity = this.entity;
				for(i=0; i<entity.knowledges.length; i++) {
					knowledge = this.universe.index.knowledge[entity.knowledges[i]];
					if(knowledge && !knowledge.disabled && !knowledge.concealed) {
						if(!this.known_by[knowledge.id]) {
							Vue.set(this.known_by, knowledge.id, [entity.name]);
							cats[knowledge.category] = true;
							known.uniquely(knowledge);
						} else {
							this.known_by[knowledge.id].uniquely(entity.name);
						}
					}
				}

				if(!this.$route.params.entity && this.meeting) {
					for(j=0; j<this.meeting.entities.length; j++) {
						entity = this.universe.index.entity[this.meeting.entities[j]];
						if(entity && !entity.disabled && !entity.is_preview && entity.hp && entity.id !== this.entity.id && (entity.played_by === this.player.id || (entity.owned && entity.owned[this.player.id]) || this.player.gm) && entity.knowledges && entity.knowledges.length) {
							for(i=0; i<entity.knowledges.length; i++) {
								knowledge = this.universe.index.knowledge[entity.knowledges[i]];
								if(knowledge && !knowledge.disabled && !knowledge.concealed) {
									if(!this.known_by[knowledge.id]) {
										Vue.set(this.known_by, knowledge.id, [entity.name]);
										cats[knowledge.category] = true;
										known.uniquely(knowledge);
									} else {
										this.known_by[knowledge.id].uniquely(entity.name);
									}
								}
							}
						}
					}
				}

				if(this.categories) {
					this.categories.splice(0);
					cats = Object.keys(cats);
					try {
						for(i=0; i<cats.length; i++) {
							this.categories.push(cats[i]);
						}
					} catch(vueException) {
						console.warn(vueException);
						this.categories.splice(0);
					}
				}
			}

			return known;
		}
	},
	"data": function() {
		var data = {};

		data.categories = [];
		data.headings = ["icon", "name", "category", "acquired", "age"];
		data.additionalHeaders = ["known_by"];
		data.known_by = {};
		data.actions = {};
		data.actions.icon = data.actions.name = data.actions.acquired = (record) => {
			this.info(record);
		};
		data.actions.known_by = (record) => {
			this.info(this.universe.named[this.known_by[record.id][0]]);
		};
		data.formatter = {};
		data.formatter.known_by = (value, record, header) => {
			if(record) {
				return this.known_by[record.id].join(", ");
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
		data.formatter.icon = (value) => {
			return "<span class=\"" + (value || "") + "\"></span>";
		};
		data.formatter.category = (value) => {
			if(value && (value = this.universe.getObject(value))) {
				return value.name;
			}
			return "";
		};

		data.available_types = [];
		data.selections = [];
		data.renderedKnowns = [];
		data.knowns = [];

		data.timeline = {};
		data.timeline.events = [];
		data.timeline.tags = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.selections.push({
			"id": "recategorize",
			"title": "Change the Category of selected knowledges",
			"null_option": "Change Category...",
			"options": this.classifications.categories
		});
		this.selections.push({
			"id": "restate",
			"title": "Change the State of selected knowledges",
			"null_option": "Change State...",
			"options": this.classifications.states
		});
		if(this.storage.type_known === undefined) {
			Vue.set(this.storage, "type_known", "");
		}

		this.sizeKnownList();
		this.buildEvents();
		this.update();
	},
	"methods": {
		"toggleTimeline": function() {
			Vue.set(this.storage, "hide_timeline", !this.storage.hide_timeline);
			this.sizeKnownList();
		},
		"sizeKnownList": function() {
			setTimeout(() => {
				var controls = this.$el.getElementsByClassName("known-listing-type")[0],
					table = this.$el.getElementsByClassName("knowledge-table")[0],
					listing = this.$el.getElementsByClassName("known-list")[0],
					timeline;

				if(this.storage.hide_timeline) {
					listing.style = "max-height: calc(100vh - " + (controls.clientHeight + 2) + "px);";
					table.style = "max-height: calc(100vh);";
				} else {
					timeline = this.$el.getElementsByClassName("rs-timeline")[0];
					listing.style = "max-height: calc(100vh - " + (controls.clientHeight + timeline.clientHeight + 2) + "px);";
					table.style = "max-height: calc(100vh - " + (timeline.clientHeight) + "px);";
				}
			});
		},
		"fillKnowns": function() {
			var matrix = Object.keys(this.entity.knowledge_matrix),
				mapped = {},
				knowledge,
				object,
				i,
				j;

			this.knowns.splice(0);
			if(this.storage.type_known) {
				for(i=0; i<matrix.length; i++) {
					if(!mapped[matrix[i]]) {
						mapped[matrix[i]] = true;
						object = this.universe.getObject(matrix[i]);
						if(object && (object.type === this.storage.type_known || (object.types && object.types.indexOf(this.storage.type_known) !== -1) || object._class === this.storage.type_known)) {
							this.knowns.push(object);
						}
					}
				}
				this.knowns.sort(rsSystem.utility.sortByName);
			}
			this.renderKnowns();
		},
		"renderKnowns": function() {
			var filtering,
				i;

			this.renderedKnowns.splice(0);

			if(this.storage.filter_knowns) {
				filtering = this.storage.filter_knowns.toLowerCase();
				for(i=0; i<this.knowns.length; i++)	 {
					if(this.knowns[i]._search.indexOf(filtering) !== -1) {
						this.renderedKnowns.push(this.knowns[i]);
					}
				}
			} else {
				this.renderedKnowns.push.apply(this.renderedKnowns, this.knowns);
			}
		},
		"buildEvents": function() {
			var event,
				i;

			this.timeline.events.splice(0);
			if(this.entity.owned[this.player.id] || this.player.gm) {
				for(i=0; i<this.universe.listing.event.length; i++) {
					event = this.universe.listing.event[i];
					if(event && event.associations && !event.is_disabled && !event.is_preview && !event.concealed && !event.is_concealed && event.associations.indexOf(this.entity.id) !== -1) {
						this.addEventPoint(event);
					}
				}

				for(i=0; i<this.universe.listing.skirmish.length; i++) {
					event = this.universe.listing.skirmish[i];
					if(event && !event.is_disabled && !event.is_preview && !event.concealed && !event.is_concealed && event.entities && event.entities.indexOf(this.entity.id) !== -1) {
						this.addEventPoint(event);
					}
				}

				for(i=0; i<this.entity.knowledges.length; i++) {
					event = this.universe.index.knowledge[this.entity.knowledges[i]];
					if(event && !event.is_disabled && !event.is_preview && !event.concealed && !event.is_concealed) {
						this.addEventPoint(event, event.name, "fa-solid fa-brain-circuit");
					}
				}
			}
		},
		"addEventPoint": function(object, name, icon, time, end) {
			time = time || object.time || object.acquired;
			if(time) {
				this.timeline.events.push({
					"name": name || object.name,
					"icon": icon || object.icon,
					"end": end || object.time_end,
					"id": object.id,
					"point": object,
					"time": time
				});
			}
		},
		"update": function(event) {
			if(!event) {
				var matrix = Object.keys(this.entity.knowledge_matrix),
					mapped = {},
					types = {},
					object,
					type,
					i,
					j;

				this.available_types.splice(0);
				this.knowns.splice(0);
				for(i=0; i<matrix.length; i++) {
					if(!mapped[matrix[i]]) {
						mapped[matrix[i]] = true;
						object = this.universe.getObject(matrix[i]);
						if(object) {
							if(object.type && !types[object.type]) {
								types[object.type] = true;
								this.available_types.push(this.universe.index.type[object.type]);
							}
							if(object._class && !types[object._class]) {
								types[object._class] = true;
								this.available_types.push(this.universe.index.classes[object._class]);
							}
							if(object.types && this.available_types.length < 50) {
								for(j=0; j<object.types.length; j++) {
									if(object.types[j] && !types[object.types[j]]) {
										types[object.types[j]] = true;
										if(type = this.universe.index.type[object.types[j]]) {
											this.available_types.push(type);
										} else {
											// this.available_types.push({
											// 	"name": object.types[j],
											// 	"id": object.types[j]
											// });
										}
									}		
								}
							}
							if(object.type === this.storage.type_known || (object.types && object.types.indexOf(this.storage.type_known) !== -1)) {
								this.knowns.push(object);
							}
						}
					}
				}
				this.available_types.sort(rsSystem.utility.sortByName);
				this.knowns.sort(rsSystem.utility.sortByName);
				this.fillKnowns();
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/knowledge.html")
});
