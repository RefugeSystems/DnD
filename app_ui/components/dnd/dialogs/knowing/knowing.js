/**
 *
 *
 * @class dndDialogKnowing
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogKnowing", {
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
		"character": function() {
			if(this.player.gm && this.$route.query.entity) {
				return this.universe.index.entity[this.$route.query.entity];
			} else if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
		},
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
		"available": function() {
			var available = [],
				object,
				i;
			
			if(this.character) {
				available.push(this.character);
			}
			if(this.meeting) {
				for(i=0; i<this.meeting.entities.length; i++) {
					object = this.universe.index.entity[this.meeting.entities[i]];
					if(object) {
						available.push(object);
					}
				}
			}
			if(this.character && this.character.inventory && this.character.inventory.length) {
				for(i=0; i<this.character.inventory.length; i++) {
					object = this.universe.index.item[this.character.inventory[i]];
					if(object) {
						available.push(object);
					}
				}
			}

			return available;
		}
	},
	"data": function () {
		var data = {};

		data.creating = {};

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
		"resetKnown": function() {
			var keys = Object.keys(this.creating),
				i;
			for(i=0; i<keys.length; i++) {
				Vue.delete(this.creating, keys[i]);
			}
		},
		"isVisible": function(field) {
			if(typeof(this.card[field.id]) === "object") {
				return this.card[field.id] !== null && Object.keys(this.card[field.id]).length;
			} else {
				return this.card[field.id] !== null && this.card[field.id] !== undefined && this.card[field.id] !== 0 && this.card[field.id] !== "";
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