/**
 *
 *
 * @class dndCard
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndCard", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {
		"bubbles": function() {
			var bubbles = [],
				field,
				i;
			
			if(this.details.bubbles) {
				for(i=0; i<this.details.bubbles.length; i++) {
					field = this.universe.index.fields[this.details.bubbles[i]];
					if(field && !field.disabled) {
						bubbles.push(field);
					}
				}
			}

			return bubbles;
		},
		"fields": function() {
			var fields = [],
				field,
				i;
			
			if(this.details.fields) {
				for(i=0; i<this.details.fields.length; i++) {
					field = this.universe.index.fields[this.details.fields[i]];
					if(field && !field.disabled) {
						fields.push(field);
					}
				}
			}

			return fields;
		}
	},
	"data": function () {
		var data = {};

		data.card = this.details.object || this.details.card;
		if(typeof(data.card) === "string") {
			data.card = this.universe.getObject(data.card);
		}
		data.entity = this.details.entity;
		if(typeof(data.entity) === "string") {
			data.entity = this.universe.getObject(data.entity);
		} else {
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"isVisible": function(field) {
			if(typeof(this.card[field.id]) === "object") {
				return this.card[field.id] !== null && Object.keys(this.card[field.id]).length;
			} else {
				return this.card[field.id] !== null && this.card[field.id] !== undefined;
			}
		},
		"formatDate": function(date) {
			return this.universe.calendar.toDisplay(date, true, false);
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/card.html")
});