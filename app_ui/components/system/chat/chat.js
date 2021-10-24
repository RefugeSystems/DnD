
/**
 * 
 * 
 * @class systemChat
 * @constructor
 * @module common
 * @zindex 50
 */
(function() {
	
	rsSystem.component("systemChat", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController
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
			"chatCore": {
				"required": true,
				"type": RSChatCore
			},
			"profile": {
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
			
			return data;
		},
		"watch": {
		},
		"mounted": function() {
			rsSystem.register(this);
			// this.universe.$on("error", this.update);
			if(this.storage.collapsed === undefined) {
				Vue.set(this.storage, "collapsed", false);
			}

			this.$el.onclick = (event) => {
				var follow = event.srcElement.attributes.getNamedItem("data-id");
				if(follow && (follow = this.universe.getObject(follow.value))) {
					rsSystem.EventBus.$emit("display-info", follow.id);
					rsSystem.EventBus.$emit("display:info", follow.id);
					event.stopPropagation();
					event.preventDefault();
				}
			};
		},
		"methods": {
			"hide": function() {
				Vue.set(this.storage, "collapsed", true);
			},
			"display": function() {
				Vue.set(this.storage, "collapsed", false);
			}
		},
		"beforeDestroy": function() {
			// this.universe.$off("error", this.update);
		},
		"template": Vue.templified("components/system/chat.html")
	});
})();
