/**
 *
 *
 * @class dndPortrait
 * @constructor
 * @module Components
 * @param {Object} entity
 */
rsSystem.component("dndPortrait", {
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"universe": {
			"requried": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"getEntityClassing": function() {
			var classes = "";
			if(this.entity.npc || this.entity.is_npc) {
				classes += "npc ";
			}
			if(this.entity.hostile || this.entity.is_hostile) {
				classes += "hostile ";
			}
			if(this.entity.chest || this.entity.is_chest) {
				classes += "chest ";
			}
			if(this.entity.shop || this.entity.is_shop) {
				classes += "shop ";
			}
			return classes;
		}
	},
	"beforeDestroy": function() {
	},
	"template": Vue.templified("components/dnd/displays/portrait.html")
});
