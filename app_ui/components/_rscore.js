
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
			"type": Object,
			"default": function() {
				if(this.universe.connection && this.universe.connection.session && this.universe.connection.session.player) {
					return this.universe.index.player[this.universe.connection.session.player];
				}
				return {};
			}
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
		/**
		 * A loose check to determine if an entity has "sufficient" knowledge of an object for general
		 * display purposes.
		 * @method entityKnowsOf
		 * @param {Object} entity 
		 * @param {Object} object 
		 * @returns {Boolean}
		 */
		"entityKnowsOf": function(entity, object) {
			if(object && object.must_know) {
				if(entity && entity.knowledge_matrix && object && object.must_know && entity.knowledge_matrix[object.id]) {
					if(typeof(object.must_know) === "string" && object.must_know.startsWith("knowledge:")) {
						return entity.knowledge_matrix[object.id] && entity.knowledge_matrix[object.id].indexOf(object.must_know) !== -1;
					} else if(isNaN(object.must_know)) {
						return entity.knowledge_matrix[object.id].length !== 0;
					} else {
						return entity.knowledge_matrix[object.id].length >= parseInt(object.must_know);
					}
				} else {
					return false;
				}
			} else {
				return true;
			}
		},
		"editNoun": function(event, record) {
			var player = this.player;

			if(event instanceof MouseEvent) {
				if(!record) {
					for(var i=0; i<event.path.length; i++) {
						if(event.path[i] && event.path[i] && event.path[i].attributes && (record = event.path[i].getAttribute("data-id"))) {
							record = this.universe.getObject(record);
							if(record) {
								event.stopPropagation();
								event.preventDefault();
								break;
							}
						}
					}
				}
				if(record) {
					if(!player) {
						player = this.universe.index.player[this.universe.connection.session.player];
					}
					if(player) {
						if(event.altKey) {
							this.info(record);
						} else if(player.gm) {
							if(event.ctrlKey) {
								navigator.clipboard.writeText(record.id);
							} else {
								if(this.profile && this.profile.edit_new_window) {
									window.open(location.pathname + "#/control/" + record._class + "/" + record.id, "edit");
								} else {
									this.$router.push("/control/" + record._class + "/" + record.id);
								}
							}
						}
					} else {
						console.warn("Edit Noun Failed: Player not found");
					}
				} else {
					console.warn("Edit Noun Failed: No Record Found: ", event, record);
				}
			} else {
				console.warn("Edit Noun Failed: Requires MouseEvent as first parameter");
			}
		},
		"getPlayer": function() {
			return this.universe.nouns.player[this.user.id];
		}
	}
});
