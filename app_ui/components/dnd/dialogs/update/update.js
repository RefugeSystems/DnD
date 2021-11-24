/**
 * 
 * @class dndUpdateObjects
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {UIProfile} profile
 */
rsSystem.component("dndUpdateObjects", {
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
	},
	"data": function () {
		var data = {};

		data.objects = this.details.objects;
		data.fields = this.details.fields;
		data.root = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"sendUpdate": function() {
			// Loop through and update
			var object,
				i;

			for(i=0; i<this.objects.length; i++) {
				object = this.objects[i];
				if(object) {
					this.universe.send("update:object", {
						"id": object.id,
						"set": this.root
					});
				}
			}
			this.closeDialog();
		}
	},
	"beforeDestroy": function () {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/update.html")
});