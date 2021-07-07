
/**
 *
 *
 * @class RSCore
 * @constructor
 * @module Components
 */
rsSystem.component("RSCore", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"storage_id": {
			"type": String
		},
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		}
	},
	"watch": {
	},
	"mounted": function() {
		/*
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value)) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
		*/
	},
	"methods": {
		"closeDialog": function() {
			rsSystem.EventBus.$emit("dialog-dismiss");
		},
		"getPlayer": function() {
			return this.universe.nouns.player[this.user.id];
		}
	}
});