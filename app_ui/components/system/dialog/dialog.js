
/**
 *
 *
 * @class systemMenu
 * @constructor
 * @module Components
 * @zindex 10
 */
(function() {
	rsSystem.component("systemDialog", {
		"inherit": true,
		"mixins": [
			
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
			"configuration": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};

			data.renderer = "system-dialog-basic";
			data.details = null;
			data.container_classes = "inactive";
			data.classes = "inactive";
			data.timeout = null;
			
			return data;
		},
		"watch": {
			"$route": {
				"deep": true,
				"handler": function() {
					this.$forceUpdate();
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			rsSystem.EventBus.$on("dialog-open", (details) => {
				if(this.timeout) {
					clearTimeout(this.timeout);
					Vue.set(this, "timeout", null);
				}
				Vue.set(this, "renderer", details.renderer || "system-dialog-basic");
				Vue.set(this, "details", details);
				Vue.set(this, "container_classes", "active");
				Vue.set(this, "classes", "active");
			});
			rsSystem.EventBus.$on("dialog-dismiss", (details) => {
				Vue.set(this, "container_classes", "inactive");
				Vue.set(this, "classes", "active hiding");
				Vue.set(this, "timeout", setTimeout(() => {
					Vue.set(this, "classes", "inactive");
					Vue.set(this, "details", null);
				}, 600));
			});
		},
		"methods": {
			
		},
		"template": Vue.templified("components/system/dialog.html")
	});
})();
