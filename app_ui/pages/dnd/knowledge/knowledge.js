
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
		"knowledge": function() {
			var known = [],
				cats = {},
				knowledge,
				i;

			if(this.entity) {
				for(i=0; i<this.entity.knowledges.length; i++) {
					knowledge = this.universe.index.knowledge[this.entity.knowledges[i]];
					if(knowledge && !knowledge.disabled && !knowledge.concealed) {
						cats[knowledge.category] = true;
						known.push(knowledge);
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
		data.headings = ["icon", "name", "category", "acquired"];
		data.actions = {};
		data.actions.icon = data.actions.name = data.actions.acquired = (record) => {
			this.info(record);
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
