
/**
 *
 *
 * @class chatStream
 * @constructor
 * @module Components
 */
rsSystem.component("chatStream", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSShowdown
	],
	"props": {
		"player": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"stream": {
			"requried": true,
			"type": Array
		}
	},
	"data": function() {
		var data = {};

		data.names = {};
		data.date = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		// TODO: Clean up start at bottom, possibly also save scroll height in some fashion
		setTimeout(function() {
			var el = document.getElementsByClassName("chat-messages")[0];
			el.scrollTop = el.scrollHeight;
		}, 10);
	},
	"methods": {
		"processDrop": function(event) {
			console.log("Stream Drop: ", event);
		},
		"printPlayer": function(message) {
			if(this.names[message.from]) {
				return this.names[message.from];
			}
			var player = this.universe.index.player[message.from],
				entity,
				index;

			if(player) {
				if(player.gm) {
					this.names[message.from] = "Dungeon Master";
				} else {
					this.names[message.from] = player.name || player.id;
					entity = this.universe.getObject(player.attribute.playing_as);
					if(entity) {
						this.names[message.from] = entity.nickname || entity.name;
					} else {
						this.names[message.from] = player.name;
					}
					index = this.names[message.from].indexOf(" ");
					if(index !== -1) {
						this.names[message.from] = this.names[message.from].substring(0, index).trim();
					}
				}
			} else {
				return "Unknown";
			}
			return this.names[message.from];
		},
		"printTime": function(message) {
			var minutes;

			if(message.received && !this.date[message.id]) {
				this.date[message.id] = new Date(message.received);
			}
			
			if(this.date[message.id]) {
				minutes = this.date[message.id].getMinutes();
				if(minutes < 10) {
					minutes = "0" + minutes;
				}
				return this.date[message.id].getHours() + ":" + minutes;
			} else {
				return "--:--";
			}
		}
	},
	"beforeDestroy": function() {
		// universe.$off("chat", this.receiveChat);
	},
	"template": Vue.templified("components/chat/stream.html")
});
