
/**
 *
 *
 * @class RSNounControls
 * @constructor
 * @module Pages
 */
rsSystem.component("RSNounControls", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSShowdown
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
		"user": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		data.infoOptions = {};
		data.infoOptions.noMaster = true;

		data.modeling = null;
		data.description = "";
		data.built = {};

		return data;
	},
	"watch": {

	},
	"mounted": function() {
		rsSystem.register(this);

		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.index.index[follow.value]) && rsSystem.utility.isOwner(follow)) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"changeModel": function(modeling) {
			// console.log("Change[" + (this.modeling?this.modeling.id:"null") + " -> " + (modeling?modeling.id:"null") + "]: ", this.modeling, modeling);
			Vue.set(this, "modeling", modeling);
		},
		"rerender": function() {
			this.$forceUpdate();
		}
	},
	"template": Vue.templified("pages/noun/controls.html")
});
