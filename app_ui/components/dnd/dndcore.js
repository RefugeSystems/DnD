rsSystem.component("DNDCore", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"utility": {
			"type": Object,
			"default": function() {
				return rsSystem.utility;
			}
		},
		"player": {
			"required": true,
			"type": Object
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
		"levelUpEntities": function(entities, amount) {
			this.universe.send("points:give", {
				"entities": entities,
				"type": "level",
				"amount": 1
			});
		}
	}
});
