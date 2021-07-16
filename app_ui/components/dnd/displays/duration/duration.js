
/**
 *
 *
 * @class dndObjectDuration
 * @constructor
 * @module Components
 * @param {Object} object Whose duration should be displayed
 * @param {Object} [universe] Specified to facilitate showing remaining duration.
 */
rsSystem.component("dndObjectDuration", {
	"inherit": true,
	"props": {
		"object": {
			"requried": true,
			"type": Object
		},
		"universe": {
			"type": Object
		}
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"hasDuration": function() {
			return (typeof(this.object.duration) === "number" && this.object.duration > 0) || typeof(this.object.duration) === "string";
		},
		"remaining": function() {
			if(this.universe && this.object.expiration) {
				var remaining = this.object.expiration - this.universe.time;
				if(remaining > 0) {
					return this.universe.calendar.displayDuration(remaining, true, false) + "s";
				} else {
					return "Expired";
				}
			}
			return "";
		},
		"duration": function() {
			if(this.universe && this.object.duration) {
				return this.universe.calendar.displayDuration(this.object.duration, true, false) + "s";
			}
			return this.object.duration;
		},
		"revoke": function() {
			if(this.object._class === "effect" && this.universe) {
				console.log("Revoke: ", this);
				this.universe.send("effect:revoke", {
					"effects": [this.object.id]
				});
			}
		}
	},
	"template": Vue.templified("components/dnd/displays/duration.html")
});
