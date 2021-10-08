
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

			for(i=0; i<this.universe.listing.location.length; i++) {
				location = this.universe.listing.location[i];
				if(location && !location.disabled && !location.is_preview && location.is_default) {
					return location;
				}
			}
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
	},
	"methods": {
		"hoveredObject": function(object) {
			Vue.set(this.storage, "hovering", object);
		},
		"flyoutClass": function() {
			var classes = "";
			if(this.displayCharacter) {
				classes += "open ";
			}
			return classes;
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
