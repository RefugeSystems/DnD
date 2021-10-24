/**
 * 
 * 
 * @class RSChatCore
 * @constructor
 * @extends EventEmitter
 * @param {Universe} universe
 */
class RSChatCore extends EventEmitter {
	constructor(universe) {
		super();
		this._universe = universe;
		this._storageKey = "storage:chat";
		this.MAX_LENGTH = 50;
		this.player = null;
		this.viewing = false;

		this.chat = this.loadChat();
		window.addEventListener("beforeunload", () => {
			this.saveChat(this.chat);
		});
		universe.$on("chat", (event) => {
			this.receiveChat(event);
		});
	}

	setPlayer(player) {
		Vue.set(this, "player", player);
	}

	setViewed(group) {
		if(group) {
			Vue.set(this.chat._last, group, Date.now());
		} else {
			Vue.set(this.chat._last, "all", Date.now());
		}
		this.$emit("viewed");
	}

	opened() {
		// Vue.set(this, "viewing", true);
	}

	closed() {
		// Vue.set(this, "viewing", false);
	}

	deleteCache() {
		localStorage.removeItem(this._storageKey);
		Vue.set(this, "chat", {
			"_recent": {},
			"_last": {},
			"_active": "all",
			"master": [],
			"locale": [],
			"all": []
		});
	}

	/**
	 * 
	 * @method receiveChat
	 * @param {Object} event With chat data.
	 */
	receiveChat(event) {
		// console.log("Received Chat: ", _p(event));
		if(event.group) {
			// For direct messages, swap "my group" to point to "them"
			if(event.group === this.player.id) {
				event.group = event.from;
			}
			if(!this.chat[event.group]) {
				Vue.set(this.chat, event.group, []);
			}
		} else {
			event.group = "all";
		}
		event.received = Date.now();
		this.chat[event.group].push(event);
		if(this.chat[event.group].length > this.MAX_LENGTH) {
			this.chat[event.group].shift();
		}
		Vue.set(this.chat._recent, event.group, event.received);
		if(event.from === this.player.id) {
			Vue.set(this.chat._last, event.group, event.received);
		}
		this.saveChat(this.chat);
		this.$emit("received", event);
	}

	/**
	 * 
	 * @method saveChat
	 * @param {Object} chat Logs
	 */
	saveChat(chat) {
		if(!chat) {
			chat = this.chat;
		}
		localStorage.setItem("storage:chat", LZString.compressToUTF16(JSON.stringify(chat)));
	}

	/**
	 * 
	 * @method loadChat
	 * @returns {Object} Chat log
	 */
	loadChat() {
		var log = localStorage.getItem("storage:chat");
		if(log) {
			try {
				log = JSON.parse(LZString.decompressFromUTF16(log));
				if(!log._recent) {
					log._recent = 0;
				}
				if(!log._last) {
					log._last = 0;
				}
				return log;
			} catch(parseException) {
				rsSystem.log.warn("Failed to parse chat log");
			}
		}
		return {
			"_recent": {},
			"_last": {},
			"_active": "all",
			"master": [],
			"locale": [],
			"all": []
		};
	}

	/**
	 * 
	 * @method getCharStream
	 * @param {String} group 
	 */
	getChatStream(group) {
		if(this.chat[group]) {
			return this.chat[group];
		}
		console.warn("Unknown Chat Group: ", group);
		return this.chat.all;
	}

	/**
	 *
	 * @method sendMessage
	 * @param {String} group To send message to directly, could be a player ID or a Party ID.
	 * 		Omit or specify "all" to send to all. "master" to send to Game Masters.
	 * @param {String} message To send
	 * @param {*} options 
	 */
	sendMessage(group = "all", message, options) {
		if(this.player) {
			var message = {
				"from": this.player.id,
				"text": message,
				"sent": Date.now(),
				"group": group
			};

			if(!this.chat[group]) {
				Vue.set(this.chat, group, []);
			}

			this._universe.send("chat", message);
		} else {
			rsSystem.log.warn("Can not chat. Not logged in yet");
		}
	}
}
