/**
 *
 *
 * @class dndSkillsDialog
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndSkillsDialog", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {
		"entity": function() {
			return this.universe.get(this.details.entity);
		}
	},
	"data": function () {
		var data = {},
			items,
			i;
			


		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/skills.html")
});