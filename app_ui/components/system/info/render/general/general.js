
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
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
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
