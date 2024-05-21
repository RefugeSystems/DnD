/**
 *
 *
 * @class dndDialogShortRest
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDialogLongRest", {
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
		"attunables": function() {
			var attunables = [],
				item,
				i;

			if(this.entity && this.entity.inventory) {
				for(i=0; i<this.entity.inventory.length; i++) {
					item = this.universe.index.item[this.entity.inventory[i]];
					if(item && !item.obscured && item.attunes && item.attuned !== this.entity.id) {
						attunables.push(item);
					}
				}
			}

			return attunables;
		}
	},
	"data": function () {
		var data = {},
			indexed,
			item,
			i;

		data.attune = null;
		if(typeof(this.details.entity) === "string") {
			data.entity = this.universe.getObject(this.details.entity);
		} else {
			data.entity = this.details.entity;
		}

		data.eattable = [];
		data.counts = {};
		data.food = null;
		indexed = {};
		for(i=0; i<data.entity.inventory.length; i++) {
			item = this.universe.index.item[data.entity.inventory[i]];
			if(rsSystem.utility.isValid(item) && item.types.includes("type:food")) {
				if(!indexed[item.id]) {
					indexed[item.id] = true;
					data.eattable.push(item);
				}
				if(!data.counts[item.id]) {
					data.counts[item.id] = 0;
				}
				data.counts[item.id]++;
			}
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"rest": function() {
			this.universe.send("action:perform", {
				"action": "action:rest:long",
				"entity": this.entity.id,
				"item": this.attune,
				"food": this.food
			});
			this.closeDialog();
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/rest/long.html")
});