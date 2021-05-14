
/**
 * 
 * 
 * @class rsRenderedText
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_rs_infoComponentKey";
	
	rsSystem.component("rsRenderedText", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSShowdown,
			rsSystem.components.RSCore
		],
		"props": {
			"text": {
				"required": true,
				"type": String
			},
			"universe": {
				"required": true,
				"type": Object
			},
			"entity": {
				"required": true,
				"type": Object
			},
			"target": {
				"type": Object
			},
			"base": {
				"type": Object
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
			
			
			
			return data;
		},
		"watch": {
			"state": {
				"deep": true,
				"handler": function() {
					this.saveStorage(this.storageKeyID, this.state);
				}
			}
		},
		"mounted": function() {
			this.$el.onclick = (event) => {
				var follow = event.srcElement.attributes.getNamedItem("data-id");
				if(follow && (follow = this.universe.index.index[follow.value])) {
					rsSystem.EventBus.$emit("display-info", follow);
				}
			};
			
			this.character.$on("modified", this.update);
			rsSystem.register(this);
			this.update();
		},
		"methods": {
			"update": function() {

			}
		},
		"beforeDestroy": function() {
			this.character.$off("modified", this.update);
		},
		"template": Vue.templified("components/info/text.html")
	});
})();
