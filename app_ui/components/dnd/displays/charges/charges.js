
/**
 *
 *
 * @class dndObjectCharges
 * @constructor
 * @module Components
 * @param {Object} object From which to display the charges
 * @param {Object} [entity] Specified to facilitate controling the charges available
 * 		on this object
 * @param {Object} [universe] Specified to facilitate controling the charges available
 * 		on this object
 */
rsSystem.component("dndObjectCharges", {
	"inherit": true,
	"props": {
		"object": {
			"requried": true,
			"type": Object
		},
		"universe": {
			"type": Object
		},
		"entity": {
			"type": Object
		}
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"use": function() {
			if(this.entity && this.universe) {
				console.log("Use: ", this);
				this.universe.send("charges:use", {
					"entity": this.entity.id,
					"object": this.object.id,
					"expend": 1
				});
			}
		},
		"restore": function() {
			if(this.entity && this.universe) {
				console.log("Restore: ", this);
				this.universe.send("charges:gain", {
					"entity": this.entity.id,
					"object": this.object.id,
					"gained": 1
				});
			}
		}
	},
	"template": Vue.templified("components/dnd/displays/charges.html")
});
