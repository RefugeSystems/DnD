/**
 *
 *
 * @class dndEntityProperties
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityProperties", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		data.properties = [];
		data.properties.push(this.universe.index.fields.played_by);
		data.properties.push(this.universe.index.fields.initiative);
		data.properties.push(this.universe.index.fields.passive_perception);
		data.properties.push(this.universe.index.fields.stealth);
		data.properties.push(this.universe.index.fields.investigation);
		data.properties.push(this.universe.index.fields.perception);
		data.properties.push(this.universe.index.fields.armor);
		data.properties.push(this.universe.index.fields.gold);

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"takeDamage": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"damage": {},
				"action": this.universe.index.action["action:free:damage"],
				"closeAfterAction": true
			});
		},
		"openProperty": function(field) {
			console.log("Field: ", field);
		},
		"getName": function(field, value) {
			if(field.inheritable && field.inheritable.length) {
				var load = this.universe.getObject(value);
				if(load) {
					return load.name || load.id;
				}
			}
			return value;
		}
	},
	"beforeDestroy": function() {
	},
	"template": Vue.templified("components/dnd/entity/properties.html")
});
