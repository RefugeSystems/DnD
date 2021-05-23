
rsSystem.component("systemDialogBasic", {
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
		"details": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		data.renderer = "system-dialog-basic";
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"emitButton": function(button) {
			if(typeof(button.emission) === "string") {
				rsSystem.EventBus.$emit(button.emission);
			} else if(typeof(button.emission) === "object") {
				rsSystem.EventBus.$emit(button.emission.type, button.emission);
			} else {
				console.warn("Button has no emission property: ", button);
			}
		}
	},
	"template": Vue.templified("components/system/dialog/basic.html")
});
