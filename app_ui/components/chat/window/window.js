/**
 *
 *
 * @class chatWindow
 * @constructor
 * @module Components
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
		"chatCore": {
			"requried": true,
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
			if(player && !player.is_preview && !player.disabled && player.id !== this.player.id) {
				if(player.gm) {
					data.groups.unshift(player.id);
					data.name[player.id] = "Master";
				} else {
					data.groups.push(player.id);
					entity = this.universe.getObject(player.attribute.playing_as);
					if(entity) {
						data.name[player.id] = entity.nickname || entity.name;
					} else {
						data.name[player.id] = player.name;
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
	},
	"methods": {
		"send": function(event) {
			console.log("Send Event: ", event);
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
				console.log("Scroll: ", found, message);
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
