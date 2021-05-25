
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
			},
			"profile": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};

			data.details_component = "system-dialog-basic";
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
				if(this.details && this.details.id === details.id) {
					this.closeDialog();
				} else {
					if(this.timeout) {
						clearTimeout(this.timeout);
						Vue.set(this, "timeout", null);
					}
					if(!details.component) {
						details.component = "system-dialog-basic";
					}
					Vue.set(this, "details", details);
					Vue.set(this, "container_classes", "active");
					Vue.set(this, "classes", "active");
				}
			});
			rsSystem.EventBus.$on("dialog-dismiss", (details) => {
				this.closeDialog();
			});
			rsSystem.EventBus.$on("close", () => {
				if(this.details) {
					this.closeDialog();
				}
			});
		},
		"methods": {
			"closeDialog": function() {
				Vue.set(this, "container_classes", "inactive");
				Vue.set(this, "classes", "active hiding");
				Vue.set(this, "timeout", setTimeout(() => {
					Vue.set(this, "classes", "inactive");
					Vue.set(this, "details", null);
				}, 600));
			}
		},
		"template": Vue.templified("components/system/dialog.html")
	});
})();
