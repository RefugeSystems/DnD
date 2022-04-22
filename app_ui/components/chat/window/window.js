/**
 *
 *
 * @class chatWindow
 * @constructor
 * @module Components
 * @param {RSUniverse} universe
 * @param {RSPlayer} player
 * @param {Object} configuration
 * @param {RSUniverse} profile
 * @param {ChatCore} chatCore
 */
rsSystem.component("chatWindow", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"requried": true,
			"type": Object
		},
		"player": {
			"requried": true,
			"type": Object
		},
		"configuration": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"forceChannel": {
			"required": false,
			"type": String
		},
		"chatCore": {
			"required": true,
			"type": RSChatCore
		}
	},
	"data": function() {
		var data = {},
			available = Object.keys(this.chatCore.chat),
			player,
			entity,
			index,
			i;

		data.groups = ["locale"];
		data.name = {};
		data.name.all = "All";
		data.name.locale = "Locale";
		for(i=0; i<this.universe.listing.player.length; i++) {
			player = this.universe.listing.player[i];
			if(player && !player.is_preview && !player.disabled && player.connections > 0 && player.id !== this.player.id) {
				if(player.gm) {
					data.groups.unshift(player.id);
					data.name[player.id] = "Master";
				} else {
					data.groups.push(player.id);
					if(player.attribute && (entity = this.universe.getObject(player.attribute.playing_as))) {
						data.name[player.id] = entity.nickname || entity.name || "Unnamed?";
					} else {
						data.name[player.id] = player.name || "Unnamed?";
					}
					index = data.name[player.id].indexOf(" ");
					if(index !== -1) {
						data.name[player.id] = data.name[player.id].substring(0, index).trim();
					}
				}
			}
		}
		data.groups.unshift("all");
		for(i=0; i<available.length; i++) {
			if(available[i][0] !== "_" && available[i] !== "master" && available[i] === "all" && available[i] === "locale") {
				data.groups.push(available[i]);
			}
		}

		
		data.stream = [];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		// this.chatCore.opened();
		if(this.storage && !this.storage.active) {
			Vue.set(this.storage, "active", "all");
		}
		if(this.storage && !this.storage.message) {
			Vue.set(this.storage, "message", "");
		}
		if(this.storage) {
			this.selectGroup(this.storage.active || "all");
		} else {
			this.selectGroup("all");
		}
		this.chatCore.$on("received", this.receive);
		if(this.forceChannel) {
			this.selectGroup(this.forceChannel);
		}
	},
	"methods": {
		"altSend": function() {
			this.$emit("altsend", this.storage.message);
		},
		"minimize": function() {
			this.$emit("minimize", this.storage.message);
		},
		"processDrop": function(event) {
			var data = rsSystem.dragndrop.general.drop();
			// if(data && (data = this.universe.getObject(data))) {
			// 	Vue.set(this.storage, "message", this.storage.message + "{{#" +  data.id + "}}");
			// }
			if(data) {
				Vue.set(this.storage, "message", this.storage.message + "{{#" +  data + "}}");
			}
			$("#message-text")[0].focus();
		},
		"send": function(event) {
			if(!event || !event.ctrl) {
				var message = this.storage.message.trim();
				if(message) {
					this.chatCore.sendMessage(this.storage.active, this.storage.message);
					Vue.set(this.storage, "message", "");
				}
			} else if(event && event.ctrl) {
				Vue.set(this.storage, "message", this.storage.message + "\n");
			}
		},
		"receive": function(message) {
			if(message.group === this.storage.active) {
				this.stream.push(message);
				this.chatCore.setViewed(this.storage.active);
			}
			setTimeout(() => {
				var found = $(this.$el).find("#" + message.id);
				if(found && found.length) {
					found[0].scrollIntoView();
				}
			}, 0);
		},
		"getGroupName": function(group) {
			if(this.name[group]) {
				return this.name[group];
			}
			var object = this.universe.getObject(group);
			if(object) {
				this.name[group] = object.name || group;
			} else {
				return "Unknown";
			}
			return this.name[group];
		},
		"selectGroup": function(group) {
			var source,
				i;

			Vue.set(this.storage, "active", group);
			this.stream.splice(0);
			
			source = this.chatCore.chat[group];
			if(source) {
				for(i=0; i<source.length; i++) {
					this.stream.push(source[i]);
				}
			}

			this.chatCore.setViewed(group);
		}
	},
	"beforeDestroy": function() {
		// universe.$off("chat", this.receiveChat);
		this.chatCore.$off("receive", this.receive);
		// this.chatCore.closed();
	},
	"template": Vue.templified("components/chat/window.html")
});
