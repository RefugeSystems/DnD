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
		"entity": function() {
			if(this.details.entity) {
				return this.universe.index.entity[this.details.entity];
			} else if(this.player.attribute.playing_as && this.universe.index.entity[this.player.attribute.playing_as]) {
				return this.universe.index.entity[this.player.attribute.playing_as];
			}
			return null;
		},
		"knowledges": function() {
			var knowledges = [],
				knowledge,
				i;
			for(i=0; i<this.entity.knowledges.length; i++) {
				knowledge = this.universe.index.knowledge[this.entity.knowledges[i]];
				if(rsSystem.utility.isValid(knowledge) && knowledge.character === this.entity.id) {
					knowledges.push(knowledge);
				}
			}
			return knowledges;
		},
		"categories": function() {
			var categories = [],
				category,
				i;

			for(i=0; i<this.universe.listing.category.length; i++) {
				category = this.universe.listing.category[i];
				if(rsSystem.utility.isValid(category)) {
					categories.push(category);
				}
			}
			return categories;
		}
	},
	"data": function () {
		var data = {};

		data.page = "page1";
		data.target = "";

		data.knowledge = {};
		data.knowledge.name = "";
		data.knowledge.description = "";
		if(this.details.associations) {
			if(this.details.associations instanceof Array) {
				data.knowledge.associations = this.details.associations;
			} else {
				data.knowledge.associations = [this.details.associations];
			}
		} else {
			data.knowledge.associations = [];
		}

		data.choice = null;
		data.choices = [{
			"name": "Create a New Knowledge Entry for This",
			"icon": "fa-solid fa-thought-bubble rs-light-green",
			"title": "Create a new knowledge entry",
			"id": "create"
		}, {
			"name": "Append This to Something You Already Know",
			"icon": "game-icon game-icon-cloud-upload rs-light-green",
			"title": "Append to an existing entry",
			"id": "append"
		}];
		if(this.details.can_share) {
			data.choices.push({
				"name": "Share",
				"icon": "fa-solid fa-mind-share rs-light-blue",
				"title": "Share a selected knowledge entry with this",
				"id": "share"
			});
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
		"select": function(choice) {
			Vue.set(this, "choice", choice);
			Vue.set(this, "page", "page2");
		},
		"getName": function(object) {
			if(this.entity) {
				return rsSystem.utility.getName(this.entity, object);
			}
			return "Unknown [No Source Creature]"; // Shouldn't really happen
		},
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
		"submit": function() {
			switch(this.choice.id) {
				case "create":
					if(this.entity) {
						this.knowledge.entity = this.entity.id; // Reference for the event to anchor who is creating this as a player
						this.universe.send("knowledge:create", this.knowledge);
					} else {
						console.error("No Entity? ", this);
					}
					break;
				case "append":
					this.universe.send("knowledge:append", {
						"entity": this.entity.id,
						"associations": this.knowledge.associations,
						"knowledge": this.target
					});
					break;
				case "share":
					this.universe.send("knowledge:share", {
						"knowledge": this.target,
						"entity": this.entity.id,
						"targets": this.knowledge.associations
					});
					break;
				default:
					console.error("Unknown Knowing Choice: ", this.choice);
			}
			this.closeDialog();
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/knowing.html")
});