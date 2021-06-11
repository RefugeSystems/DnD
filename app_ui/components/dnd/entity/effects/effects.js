
/**
 *
 *
 * @class dndEntityEffects
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityEffects", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DNDCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.index.index[follow.value]) && this.isOwner(follow)) {
				rsSystem.EventBus.$emit("display-info", {
					"record": follow,
					"base": this.viewing
				});
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/effects.html")
});
