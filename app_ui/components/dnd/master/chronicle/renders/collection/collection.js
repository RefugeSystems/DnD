
/**
 *
 *
 * @class dndChronicleReadoutCollection
 * @constructor
 * @module Components
 */
rsSystem.component("dndChronicleReadoutCollection", {
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"occurred": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		// Note: Index entities and activities and account for entities not having the skill
		"average": function() {

		}
	},
	"data": function() {
		var data = {};

		data.classing = occurred.classing || "collecting";

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/chronicle/renders/collection.html")
});
