/**
 *
 *
 * @class rsDialogReleased
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("rsDialogReleased", {
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
	"data": function () {
		var data = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"confirmed": function() {
			if(this.details.send) {
				var data = this.details.data;
				if(!data) {
					data = {};
					if(this.entity) {
						data.character = this.entity.id || this.entity;
					}
					if(this.character) {
						data.character = this.character.id || this.character;
					}
					data.entity = data.character;
					data.source = data.character;
				}
				this.universe.send(this.details.send, data);
				this.closeDialog();
			}
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/display/dialogs/released.html")
});
