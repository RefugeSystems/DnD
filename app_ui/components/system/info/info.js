
/**
 *
 *
 * @class systemInfo
 * @constructor
 * @module Components
 * @zindex 20
 */
(function() {
	var closeInfo = {
		"info": null,
		"view": null
	};

	rsSystem.component("systemInfo", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSCore
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
			"profile": {
				"type": Object,
				"default": function() {
					return {};
				}
			},
			"options": {
				"type": Object,
				"default": function() {
					return {};
				}
			}
		},
		"data": function() {
			var data = {};
			
			/**
			 *
			 * @property open
			 * @type Boolean
			 */
			data.open = false;
			/**
			 *
			 * @property view
			 * @type Object
			 */
			data.view = null;
			/**
			 * Used for calculations.
			 * @property info
			 * @type Object
			 */
			data.info = null;
			

			data.listEntities = false;

			data.scanning = false;
			data.contains = null;
			data.containNoLimit = {};
			data.containsList = {};

			data.count = 0;

			return data;
		},
		"computed": {
			"size": function() {
				return this.profile.info_size || 90;
			},
			"main": function() {
				if(this.player && this.player.attribute && this.player.attribute.playing_as) {
					return this.universe.index.entity[this.player.attribute.playing_as] || null;
				}
				return null;
			},
			"relatedKnowledge": function() {
				var related = [];

				if(this.main && this.info && this.main.knowledge_matrix && this.main.knowledge_matrix[this.info.id]) {
					this.universe.transcribeInto(this.main.knowledge_matrix[this.info.id], related, "knowledge");
				}

				return related;
			}
		},
		"watch": {
			"$route.query.info": function(nV, oV) {
				Vue.set(this, "contains", null);
				this.checkView();
			},
			"$route.query.view": function(nV, oV) {
				this.checkView();
			}
		},
		"mounted": function() {
			rsSystem.register(this);

			this.$el.onclick = (event) => {
				var follow = event.srcElement.attributes.getNamedItem("data-id");
				if(follow && (follow = this.universe.getObject(follow.value))) {
					rsSystem.EventBus.$emit("display-info", {
						"info": follow.id,
						"view": this.view
					});
					event.stopPropagation();
					event.preventDefault();
				}
			};

			rsSystem.EventBus.$on("display-info", this.displayRecord);
			rsSystem.EventBus.$on("key:escape", this.closeInfo);
			this.checkView();
		},
		"methods": {
			"scanObject": function() {
				if(!this.scanning) {
					Vue.set(this, "scanning", true);
					setTimeout(() => {
						if(this.info && this.player.gm) {
							if(this.info._class === "location") {
								Vue.set(this, "contains", rsSystem.utility.scanLocation(this.universe, this.info));
							} else if(this.info.interior && rsSystem.utility.isValid(this.universe.index.location[this.info.interior])) {
								Vue.set(this, "contains", rsSystem.utility.scanLocation(this.universe, this.universe.index.location[this.info.interior]));
							} else {
								Vue.set(this, "contains", null);
							}
						} else {
							Vue.set(this, "contains", null);
						}
						Vue.set(this, "scanning", false);
					}, 0);
				}
			},
			"toggleEntities": function() {
				Vue.set(this, "listEntities", !this.listEntities);
			},
			"processDrag": function(record) {
				rsSystem.dragndrop.general.drag(record.id);
			},
			"getTabIndex": function() {
				return this.open?5:-1;
			},
			"displayRecord": function(event) {
				if(typeof(event) === "string") {
					event = {"info":event};
				}
				if(this.$route.query.info !== event.info) {
					rsSystem.manipulateQuery({
						"view": event.view || null,
						"info": event.info
					});
				} else {
					rsSystem.manipulateQuery({
						"view": null,
						"info": null
					});
				}
			},
			"checkView": function() {
				var object;
				if(this.$route.query.info && (object = this.universe.getObject(this.$route.query.info))) {
					Vue.set(this, "view", this.$route.query.view || "sysInfoGeneral");
					Vue.set(this, "count", this.count + 1);
					Vue.set(this, "info", object);
					Vue.set(this, "open", true);
				} else {
					Vue.set(this, "open", false);
					Vue.set(this, "count", 0);
				}
			},
			"backOne": function() {
				this.$router.back();
			},
			/**
			 *
			 * @method closeInfo
			 */
			"showInfo": function(id) {
				rsSystem.manipulateQuery({"info":id});
			},
			/**
			 *
			 * @method closeInfo
			 */
			"closeInfo": function() {
				rsSystem.manipulateQuery(closeInfo);
			}
		},
		"beforeDestroy": function() {
			rsSystem.EventBus.$off("display-info", this.displayRecord);
			rsSystem.EventBus.$off("key:escape", this.closeInfo);
			/*
			this.universe.$off("universe:modified", this.update);
			rsSystem.EventBus.$off("key:escape", this.closeInfo);
			*/
		},
		"template": Vue.templified("components/system/info.html")
	});
})();
