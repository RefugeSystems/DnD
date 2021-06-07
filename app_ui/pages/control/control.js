
/**
 *
 *
 * @class RSControl
 * @constructor
 * @module Pages
 */
rsSystem.component("RSControl", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSShowdown
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"tracked": function() {
			var tracked = this.universe.index[this.classification];
			if(tracked) {
				return tracked[this.classification + ":preview:" + this.player.id];
			}
			return null;
		}
	},
	"data": function() {
		var data = {};

		data.infoOptions = {};
		data.infoOptions.noMaster = true;

		data.modeling = null;
		data.description = "";
		data.built = {};

		data.classification = this.universe.listing.classes[0].id;

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
		"reclass": function(classification) {
			Vue.set(this, "classification", classification);
		}
	},
	"template": Vue.templified("pages/control.html")
});
