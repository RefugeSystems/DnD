
/**
 *
 *
 * @class RSChronicle
 * @constructor
 * @module Pages
 */
rsSystem.component("RSChronicle", {
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

	},
	"data": function() {
		var data = {};

		return data;
	},
	"watch": {

	},
	"mounted": function() {
		rsSystem.register(this);

		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.getObject(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"sync": function() {
			
		}
	},
	"template": Vue.templified("pages/chronicle.html")
});
