/**
 * 
 * @class dndDialogGive
 * @constructor
 * @module Components
 * @param {Universe} universe
 * @param {Player} player
 * @param {Configuraiton} configuration
 * @param {UIProfile} profile
 * @param {Object} details
 * @param {String | Object} details.entity Source of the giving. Optional if the player is a Game Master.
 * @param {Function} details.finish Receives an Object that is the selected target if one is chosen
 */
rsSystem.component("dndDialogGive", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSShowdown,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"entity": function() {
			if(typeof(this.details.entity) === "string") {
				return this.universe.index.entity[this.details.entity];
			}
			return this.details.entity;
		},
		"meeting": function() {
			var meet,
				i;

			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meet = this.universe.listing.meeting[i];
				if(meet.is_active && !meet.disabled && !meet.is_preview) {
					return meet;
				}
			}
			
			return null;
		},
		"entities": function() {
			var entities = [],
				entity,
				i;

			if(this.meeting && this.meeting.entities) {
				for(i=0; i<this.meeting.entities.length; i++) {
					entity = this.universe.index.entity[this.meeting.entities[i]];
					if(entity) {
						entities.push(entity);
					} else {
						console.warn("Unknown Entity: ", this.meeting.entities[i]);
					}
				}
			}

			return entities;
		}
	},
	"data": function () {
		var data = {};

		data.filter = "";

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"getEntityClassing": function(entity) {
			var classes = "";
			if(entity.is_npc) {
				classes += " is_npc";
			}
			if(entity.is_hostile) {
				classes += " is_hostile";
			}
			if(entity.is_shop) {
				classes += " is_shop";
			}
			if(entity.is_chest) {
				classes += " is_chest";
			}
			return classes;
		},
		"isVisible": function(entity) {
			if(entity && this.entity.id !== entity.id && !entity.is_locked && (!this.filter || (entity._search && entity._search.indexOf(this.filter) !== -1))) {
				return true;
			}
			return false;
		},
		"getRelationIcon": function(entity) {
			
		},
		"giveTo": function(entity) {
			if(typeof(this.details.finish) === "function") {
				this.details.finish(entity);
			} else {
				console.error("Invalid or missing value for details.finish in dialog: ", this);
			}
			this.closeDialog();
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/give.html")
});