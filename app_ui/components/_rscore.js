
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
		"editNoun": function(record) {
			if(this.player.gm) {
				if(this.profile.edit_new_window) {
					window.open("/#/control/" + record._class + "/" + record.id, "edit");
				} else {
					this.$router.push("/control/" + record._class + "/" + record.id);
				}
			}
		},
		"getPlayer": function() {
			return this.universe.nouns.player[this.user.id];
		}
	}
});
