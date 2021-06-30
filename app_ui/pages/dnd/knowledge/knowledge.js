
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
		"entity": function() {
			return this.universe.index.entity[this.player.attribute.playing_as];
		},
		"today": function() {
			return this.universe.calendar.toDisplay(this.universe.time, false);
		},
		"knowledge": function() {
			var known = [],
				cats = {},
				knowledge,
				entity,
				i,
				j;

			Vue.set(this, "known_by", {});
			for(j=0; j<this.universe.listing.entity.length; j++) {
				entity = this.universe.listing.entity[j];
				if(entity && !entity.disabled && !entity.is_preview && entity.hp && (entity.played_by === this.player.id || (entity.owned && entity.owned[this.player.id])) && entity.knowledges && entity.knowledges.length) {
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

			return known;
		}
	},
	"data": function() {
		var data = {};

		data.categories = [];
		data.headings = ["icon", "name", "category", "known_by", "acquired", "age"];
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

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		
	},
	"methods": {
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/knowledge.html")
});
