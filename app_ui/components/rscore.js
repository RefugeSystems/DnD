
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
		"user": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"player": function() {
			return this.universe.nouns.player[this.user.id];
		}
	},
	"watch": {
	},
	"mounted": function() {
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.index.index[follow.value]) && this.isOwner(follow)) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"getPlayer": function() {
			return this.universe.nouns.player[this.user.id];
		}
	}
});
