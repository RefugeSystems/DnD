
/**
 *
 *
 * @class sysInfoGeneral
 * @constructor
 * @module Components
 */
rsSystem.component("sysInfoGeneral", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDControlEquipment,
		rsSystem.components.RSShowdown,
		rsSystem.components.RSCore
	],
	"props": {
		"info": {
			"requried": true,
			"type": Object
		},
		"player": {
			"type": Object
		},
		"size": {
			"type": Number,
			"default": 90
		},
		"cacheSuffix": {
		}
	},
	"computed": {
		"description": function() {
			return this.rsshowdown(this.info.description || "", this.info, this.profile?this.profile.inline_javascript:false);
		},
		"image": function() {
			if(this.info.portrait && this.universe.index.image[this.info.portrait]) {
				return this.universe.index.image[this.info.portrait];
			}
		}
	},
	"watch": {
		"info": function() {
			this.populateControls();
		}
	},
	"data": function() {
		var data = {};
		data.controls = [];
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.populateControls();
	},
	"methods": {
		"populateControls": function() {
			var loading;

			this.controls.splice(0);
			if(!this.info.is_preview && this.info._class) {
				if(this.player) {
					if(this.player.gm) {
						if(this.info.obscured) {
							this.controls.push({
								"title": "Unobscure object",
								"icon": "fas fa-eye",
								"type": "button",
								"action": "unobscure"
							});
						} else {
							this.controls.push({
								"title": "Obscure object",
								"icon": "fas fa-eye-slash",
								"type": "button",
								"action": "obscure"
							});
						}
						if(this.info._class === "entity") {
							this.controls.push({
								"title": "Assume Entity in Overview",
								"icon": "game-icon game-icon-console-controller",
								"type": "button",
								"action": "assume"
							});
							loading = {
								"title": "Color Code",
								"icon": "fas fa-palette",
								"action": "color",
								"property": "color_flag",
								"type": "select",
								"_value": this.info.color_flag,
								"options": ["red", "yellow", "green", "purple", "blue", "cyan", "black", "white"]
							};
							if(loading.options.indexOf[loading._value] === -1) {
								loading._missing = loading._value;
							}
							this.controls.push(loading);
						}
					}
				}
			}
		},
		"process": function(control) {
			switch(control.action) {
				case "assume":
					this.universe.send("master:assume", {"entity": this.info.id});
					rsSystem.toPath("/home", {"entity": this.info.id});
					break;
				case "obscure":
					this.universe.send("master:obscure", {
						"object": this.info.id,
						"obscured": true
					});
					break;
				case "unobscure":
					this.universe.send("master:obscure", {
						"object": this.info.id,
						"obscured": false
					});
					break;
				case "color":
					this.universe.send("master:recolor", {
						"object": this.info.id,
						"color": control._value
					});
					if(control.options.indexOf[control._value] === -1) {
						control._missing = control._value;
					} else {
						Vue.delete(control, "_missing");
					}
					break;
			}
		},
		"option": function(contorl) {

		},
		"getImageURL": function(record) {
			if(record.data) {
				return record.data;
			} else if(this.cacheSuffix) {
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + record.id + "?ctrl=" + this.cacheSuffix;
			} else {
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + record.id + "?ctrl=" + Date.now();
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/system/info/render/general.html")
});
