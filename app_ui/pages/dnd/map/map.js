
/**
 *
 *
 * @class DNDMap
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMap", {
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
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"location": function() {
			var location,
				i;

			if(this.$route.params.location) {
				return this.universe.index.location[this.$route.params.location];
			}

			if(this.activeMeeting && this.activeMeeting.location && this.activeMeeting.is_active && (location = this.universe.index.location[this.activeMeeting.location])) {
				return location;
			}

			for(i=0; i<this.universe.listing.location.length; i++) {
				location = this.universe.listing.location[i];
				if(location && !location.disabled && !location.is_disabled && !location.is_preview && location.is_default) {
					return location;
				}
			}
		},
		"activeMeeting": function() {
			return this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value] || null;
		},
		"flyoutClass": function() {
			var classes = "";
			if(this.displayCharacter) {
				classes += "open ";
			}
			return classes;
		},
		"playerCharacter": function() {
			var entity;
			if(this.$route.params.entity) {
				entity = this.universe.index.entity[this.$route.params.entity];
			} else if(this.$route.query.entity) {
				entity = this.universe.index.entity[this.$route.query.entity];
			} else {
				entity = this.universe.index.entity[this.universe.index.player[this.universe.connection.session.player].attribute.playing_as];
			}
			if(entity) {
				if(this.player.gm || entity.owned[this.player.id]) {
					return entity;
				} else {
					console.warn("Invalid access to entity in map; Player[" + this.player.id + "] does not have access to Entity[" + entity.id + "]");
					return null;
				}
			} else {
				console.warn("Player[" + this.player.id + "] is not currently playing_as any entity");
			}
		}
	},
	"data": function() {
		var data = {};
		data.displayCharacter = false;
		data.image = {};
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("master:control", this.controlResponse);
		if(!this.storage.boundries) {
			Vue.set(this.storage, "boundries", {});
		}
	},
	"methods": {
		"hoveredObject": function(object) {
			Vue.set(this.storage, "hovering", object);
		},
		"toggleBoundry": function(event) {
			if(event && event.object && event.field) {
				if(this.storage.boundries[event.object]) {
					Vue.delete(this.storage.boundries, event.object);
				} else {
					Vue.set(this.storage.boundries, event.object, event);
				}
				Vue.set(this.storage, "boundry_keys", Object.keys(this.storage.boundries));
			}
		},
		"toggleCharacter": function() {
			Vue.set(this, "displayCharacter", !this.displayCharacter);
		},
		"controlResponse": function(control) {
			console.log("Map Control: ", control);
			switch(control.control) {
				case "map":
					if(this.storage.follow) {
						rsSystem.toPath("/map/" + control.data.location);
					}
					break;
				case "mapview":
					if(this.storage.follow) {
						rsSystem.toPath("/map/" + control.data.location, {
							"viewing": control.data.location,
							"zoom": control.data.zoom,
							"x": control.data.x,
							"y": control.data.y
						});
					}
					break;
			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("master:control", this.controlResponse);
	},
	"template": Vue.templified("pages/dnd/map.html")
});
