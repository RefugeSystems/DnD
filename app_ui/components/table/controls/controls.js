
/**
 * 
 * 
 * @class rsTable
 * @constructor
 * @module Components
 * @zindex 1
 */
(function() {
	var storageKey = "_rs_menuComponentKey";
	
	rsSystem.component("rsTableControls", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSCore
		],
		"props": {
			"index": {
				"required": true,
				"type": Object
			},
			"controls": {
				"required": false,
				"type": Array
			},
			"corpus": {
				"required": true,
				"type": Array
			},
			"state": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {},
				x;

			data.start = 0;
			
			return data;
		},
		"watch": {
			"index": function(newIndex, oldIndex) {
				console.warn("Controls Index Updated: ", oldIndex, "\n -> \n", newIndex);
				oldIndex.$off("selection", this.update);
				oldIndex.$off("indexed", this.update);
				newIndex.$on("selection", this.update);
				newIndex.$on("indexed", this.update);
				this.update();
			},
			"state": {
				"deep": true,
				"handler": function() {
					this.update();
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			this.index.$on("selection", this.update);
			this.index.$on("indexed", this.update);
			this.update();
		},
		"methods": {
			"clearSelection": function() {
				
				this.index.clearSelection();
				this.update();
			},
			"allSelection": function() {
				this.index.select(this.corpus);
				this.update();
			},
			"infoSelection": function(record) {
				rsSystem.EventBus.$emit("display-info", record);
			},
			"update": function() {
				this.$forceUpdate();
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("universe:modified", this.update);
			this.index.$off("selection", this.update);
			this.index.$off("indexed", this.update);
		},
		"template": Vue.templified("components/table/controls.html")
	});
})();
