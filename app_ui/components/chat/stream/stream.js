
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
	},
	"methods": {
		"printPlayer": function(message) {
			if(this.names[message.from]) {
				return this.names[message.from];
			}
			var player = this.universe.index.player[message.from],
				entity,
				index;

			if(player) {
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
			} else {
				return "Unknown";
			}
			return this.names[message.from];
		},
		"printTime": function(message) {
			if(message.received && !this.date[message.mid]) {
				this.date[message.mid] = new Date(message.received);
			}
			
			if(this.date[message.mid]) {
				return this.date[message.mid].getHours() + ":" + this.date[message.mid].getMinutes();
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
