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
		"damaging": function() {
			if(this.player.gm) {
				if(this.entity.played_by && this.entity.played_by !== this.player.id) {
					this.sendDamage();
				} else {
					this.takeDamage();
				}
			} else {
				console.error("Invalid entity control");
			}
		},
		"takeDamage": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"damage": {},
				"action": this.universe.index.action["action:damage:recv"],
				"closeAfterAction": true
			});
		},
		"sendDamage": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"target": this.entity.id,
				"damage": {},
				"sourcable": true,
				"action": this.universe.index.action["action:damage:send"],
				"closeAfterAction": true
			});
		},
		"openProperty": function(field) {
			// console.log("Field: ", field);
			this.$emit("property", field);
			this.$emit(field.id, this.entity[field.id]);
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
