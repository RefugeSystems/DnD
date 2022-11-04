/**
 *
 *
 * @class rsDialogHint
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("rsDialogHint", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"associations": function() {
			var associations = [],
				association,
				i;
			if(this.details.hint.associations) {
				for(i=0; i<this.details.hint.associations.length && associations.length < 6; i++) {
					association = this.universe.get(this.details.hint.associations[i]);
					if(rsSystem.utility.isValid(association)) {
						associations.push(association);
					}
				}
			}
			return associations;
		}
	},
	"data": function () {
		var data = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/display/dialogs/hint.html")
});
