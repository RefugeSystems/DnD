
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
			 * @type RSObject
			 */
			data.view = null;
			/**
			 * Used for calculations.
			 * @property info
			 * @type Object
			 */
			data.info = null;
			
			data.count = 0;

			data.size = 90;

			return data;
		},
		"watch": {
			"$route.query.info": function(nV, oV) {
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
			"closeInfo": function() {
				rsSystem.manipulateQuery(closeInfo);
			}
		},
		"beforeDestroy": function() {
			/*
			this.universe.$off("universe:modified", this.update);
			rsSystem.EventBus.$off("key:escape", this.closeInfo);
			*/
		},
		"template": Vue.templified("components/system/info.html")
	});
})();
