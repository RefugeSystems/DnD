
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
		}
	},
	"data": function() {
		var data = {};
		data.image = {};
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("master:control", this.controlResponse);
	},
	"methods": {
		"controlResponse": function(control) {
			switch(control.control) {
				case "map":
					if(this.storage.follow) {
						rsSystem.toPath("/map/" + control.data.location);
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
