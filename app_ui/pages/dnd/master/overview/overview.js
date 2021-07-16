/**
 *
 *
 * @class DNDMasterOverview
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMasterOverview", {
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
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"viewing": function() {
			return this.selectedPlayer || this.universe.index.player[this.$route.params.player];
		}
	},
	"watch": {
		"$route.params.player": function(player) {
			
		},
		"$route.params.entity": function(entity) {

		}
	},
	"data": function() {
		var data = {};

		data.overviewComponent = "DNDEntities";
		data.selectedPlayer = null;
		data.selectedEntity = null;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {

	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/master/overview.html")
});
