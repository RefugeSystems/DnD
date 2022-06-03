/**
 *
 *
 * @class DNDMasterSoundboard
 * @constructor
 * @module Components
 */
rsSystem.component("DNDMasterSoundboard", {
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
		"profile": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"activeMeeting": function() {
			return this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value] || null;
		},
		"location": function() {
			var location,
				i;

			if(this.$route.params.location) {
				return this.universe.index.location[this.$route.params.location];
			}

			if(this.activeMeeting && this.activeMeeting.location && this.activeMeeting.is_active && (location = this.universe.index.location[this.activeMeeting.location])) {
				return location;
			}

			for(i=0; i<this.universe.listing.location.length; i++) {
				location = this.universe.listing.location[i];
				if(location && !location.disabled && !location.is_disabled && !location.is_preview && location.is_default) {
					return location;
				}
			}
		},
		"audios": function() {
			var audios = this.location.audios;
			if(this.storage.show_all) {
				return this.universe.listing.audio;
			}
			if(audios) {
				return this.universe.transcribeInto(audios);
			}
			return [];
		},
		"playlists": function() {
			var playlists = this.location.playlists;
			if(this.storage.show_all) {
				return this.universe.listing.playlist;
			}
			if(playlists) {
				return this.universe.transcribeInto(playlists);
			}
			return [];
		},
		"controls": function() {
			return this.universe.listing.roomctrl;
		}
	},
	"data": function() {
		var data = {},
			i;

		data.available = {};
		data.available.roomctrl = [];
		data.available.player = [];
		data.tracked = {};

		data.destination = {};
		data.destination.roomctrl = {};
		data.destination.player = {};
		data.destination.delay = 0;
		data.destination.sync = false;

		data.selected = {};
		data.selected.playlist = {};
		data.selected.audio = {};

		data.activations = {};

		data.activePatterns = {};

		data.field = {};
		data.field.arrangeRight = {

		};
		data.field.arrangeLeft = {

		};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

		// this.universe.$on("player-disconnected", this.playerDisconnected);
		// this.universe.$on("player-connected", this.playerConnected);

		if(!this.storage.destination) {
			Vue.set(this.storage, "destination", {});
		}
		if(!this.storage.destination.roomctrl) {
			Vue.set(this.storage.destination, "roomctrl", {});
		}
		if(!this.storage.destination.player) {
			Vue.set(this.storage.destination, "player", {});
		}
		if(!this.storage.swap) {
			Vue.set(this.storage, "swap", {});
		}
		if(!this.storage.saved) {
			Vue.set(this.storage, "saved", {});
		}
		if(!this.storage.arrangement) {
			Vue.set(this.storage, "arrangement", {});
		}
		if(!this.storage.arrangement.left) {
			Vue.set(this.storage.arrangement, "left", []);
		}
		if(!this.storage.arrangement.right) {
			Vue.set(this.storage.arrangement, "right", []);
		}
		this.refreshAvailable();
	},
	"methods": {
		"audioClass": function(audio) {
			var styling = "";
			if(audio && this.activations[audio.id]) {
				styling += " audio-playing ";
			}
			return styling;
		},
		"applyPlayerSelection": function() {
			this.clearObject(this.storage.swap);
			this.setToObject(this.storage.destination.player, this.storage.swap);
			this.clearObject(this.storage.destination.player);
			this.setToObject(this.storage.saved, this.storage.destination.player);
			Vue.set(this.storage, "swapped", true);
		},
		"swapPlayerSelection": function() {
			if(this.storage.swapped) {
				this.clearObject(this.storage.destination.player);
				this.setToObject(this.storage.swap, this.storage.destination.player);
			} else {
				this.clearObject(this.storage.swap);
				this.setToObject(this.storage.destination.player, this.storage.swap);
				this.clearObject(this.storage.destination.player);
				this.setToObject(this.storage.saved, this.storage.destination.player);
			}
			Vue.set(this.storage, "swapped", !this.storage.swapped);
		},
		"classPlayerSwap": function() {
			var classes = "fa-solid ";
			if(this.storage.swapped) {
				classes += "fa-arrow-rotate-left ";
			} else {
				classes += "fa-arrow-rotate-right ";
			}
			return classes;
		},
		"savePlayerSelection": function() {
			Vue.set(this.storage, "swapped", false);
			this.clearObject(this.storage.saved);
			this.setToObject(this.storage.destination.player, this.storage.saved);
		},
		"classPlayerSave": function() {
			var classes = "fa-solid fa-floppy-disk";
			return classes;
		},
		"clearPlayerSelection": function() {
			this.clearObject(this.storage.destination.player);
		},
		"clearObject": function(object) {
			var keys = Object.keys(object),
				i;
			for(i=0; i<keys.length; i++) {
				Vue.delete(object, keys[i]);
			}
		},
		"setToObject": function(source, object) {
			var keys = Object.keys(source),
				i;
			for(i=0; i<keys.length; i++) {
				Vue.set(object, keys[i], source[keys[i]]);
			}
		},
		"setArrangement": function(left, right) {
			this.storage.arrangement.right.splice(0);
			this.storage.arrangement.left.splice(0);
			this.storage.arrangement.right.push.apply(this.storage.arrangement.right, right);
			this.storage.arrangement.left.push.apply(this.storage.arrangement.left, left);
		},
		"toggleAll": function() {
			Vue.set(this.storage, "show_all", !this.storage.show_all);
		},
		"discoverySonos": function() {
			rsSystem.universe.send("master:discovery:audio:sonos", {});
		},
		"setVolume": function() {
			for(var control in this.storage.destination.roomctrl) {
				rsSystem.universe.send("master:roomctrl:play", {
					"control": control,
					"volume": this.storage.volume
				});
			}
		},
		"refreshAvailable": function() {
			var loading, 
				source,
				i;

			for(i=0; i<this.universe.listing.player.length; i++) {
				loading = this.universe.listing.player[i];
				if(loading && !this.tracked[loading.id] && !loading.is_preview &&  !loading.disabled && !loading.is_disabled && loading.connections) {
					if(!this.available[loading._class]) {
						this.available[loading._class] = [];
					}
					this.available[loading._class].push(loading);
				}
			}
			for(i=0; i<this.universe.listing.roomctrl.length; i++) {
				loading = this.universe.listing.roomctrl[i];
				if(loading && !this.tracked[loading.id] && !loading.is_preview && !loading.disabled && !loading.is_disabled) {
					if(!this.available[loading._class]) {
						this.available[loading._class] = [];
					}
					this.available[loading._class].push(loading);
				}
			}
		},
		"playPattern": function(pattern) {

		},
		"stopPattern": function(pattern) {

		},
		"toggleDestination": function(destination) {
			if(this.storage.destination[destination._class]) {
				if(this.storage.destination[destination._class][destination.id]) {
					Vue.delete(this.storage.destination[destination._class], destination.id);
				} else {
					Vue.set(this.storage.destination[destination._class], destination.id, true);
				}
			} else {
				console.warn("Unknown destination class: " + destination._class, destination);
			}
		},
		"toggleSelection": function(selected) {
			if(this.selection[selected._class]) {
				if(this.selection[selected._class][selected.id]) {
					Vue.delete(this.selection[selected._class], selected.id);
				} else {
					Vue.set(this.selection[selected._class], selected.id, true);
				}
			} else {
				console.warn("Unknown selection class: " + selected._class, selected);
			}
		},
		"classTargetted": function(destination) {
			var classes = "";
			if(this.isTargetted(destination)) {
				classes += "fa-solid fa-square-check";
			} else {
				classes += "fa-light fa-square";
			}
			return classes;
		},
		"isTargetted": function(destination) {
			return this.storage.destination[destination._class]?this.storage.destination[destination._class][destination.id]:false;
		},
		"isSelected": function(selectable) {
			return this.selection[selectable._class]?this.selection[selectable._class][selectable.id]:false;
		},
		"play": function(audio) {
			var keys,
				i;

			if(audio && !audio.is_preview && !audio.disabled && rsSystem.utility.isNotEmpty(this.storage.destination.player)) {
				if(audio.is_looped) {
					Vue.set(this.activations, audio.id, (this.activations[audio.id] || 0) + 1);
				}
				this.playPlayerAudio(this.storage.destination.player, audio.id);
			}
			if(rsSystem.utility.isNotEmpty(this.storage.destination.roomctrl)) {
				keys = Object.keys(this.storage.destination.roomctrl);
				for(i=0; i<keys.length; i++) {
					this.playRoomControl(keys[i], audio.id);
				}
			}
		},
		"stop": function(audio) {
			if(audio && !audio.is_preview && !audio.disabled && rsSystem.utility.isNotEmpty(this.storage.destination.player)) {
				Vue.set(this.activations, audio.id, (this.activations[audio.id] || 0) - 1);
				this.stopPlayerAudio(this.storage.destination.player, audio.id);
				if(this.activations[audio.id] < 0) {
					Vue.set(this.activations, audio.id, 0);
				}
			}
			if(rsSystem.utility.isNotEmpty(this.storage.destination.roomctrl)) {
				for(var controller in this.storage.destination.roomctrl) {
					this.stopRoomControl(controller);
				}
			}
		},
		"stopAll": function() {
			if(rsSystem.utility.isNotEmpty(this.storage.destination.player)) {
				this.stopPlayerAllAudio(this.storage.destination.player);
			}
		},
		"start": function(playlist) {
			for(var controller in this.storage.destination.roomctrl) {
				rsSystem.universe.send("master:roomctrl:play", {
					"control": controller,
					"playlist": playlist.id,
					"volume": this.storage.volume
				});
			}
		},
		"clear": function() {

		},

		"controllersReport": function() {
			for(var controller in this.storage.destination.roomctrl) {
				rsSystem.universe.send("master:roomctrl:report", {
					"control": controller
				});
			}
		},

		"controllersCreate": function() {
			for(var controller in this.storage.destination.roomctrl) {
				rsSystem.universe.send("master:roomctrl:create", {
					"control": controller
				});
			}
		},
		/**
		 * 
		 * @method playPlayerAudio
		 * @param {String} control RoomControl ID
		 * @param {String} [audio] ID, optional. Skip to just set volume for currently playing
		 * @param {Number} [volume] 0-100 for volume. Optional, if omitted plays at last set volume.
		 */
		"playRoomControl": function(control, audio, volume) {
			rsSystem.universe.send("master:roomctrl:play", {
				"control": control,
				"audio": audio,
				"volume": volume || this.storage.volume || 50 //TODO: Decide how to handle volume and handle 0
			});
		},
		/**
		 * 
		 * @method stopRoomControl
		 * @param {String} control RoomControl ID
		 */
		"stopRoomControl": function(control) {
			rsSystem.universe.send("master:roomctrl:stop", {
				"control": control
			});
		},
		/**
		 * 
		 * @method playPlayerAudio
		 * @param {Object} playerMap 
		 * @param {String} audio ID
		 */
		"playPlayerAudio": function(playerMap, audio) {
			rsSystem.universe.send("master:control:audio:play", {
				"recipients": playerMap,
				"audio": audio
			});
		},
		/**
		 * 
		 * @method stopPlayerAudio
		 * @param {Object} playerMap 
		 * @param {String} audio ID
		 */
		"stopPlayerAudio": function(playerMap, audio) {
			rsSystem.universe.send("master:control:audio:stop", {
				"recipients": playerMap,
				"audio": audio
			});
		},
		/**
		 * 
		 * @method stopPlayerAllAudio
		 * @param {Object} playerMap 
		 * @param {String} audio ID
		 */
		"stopPlayerAllAudio": function(playerMap, audio) {
			rsSystem.universe.send("master:control:audio:stop:all", {
				"recipients": playerMap,
				"audio": audio
			});
		}
	},
	"beforeDestroy": function() {
		// this.universe.$off("entity:roll", this.entityRolled);
	},
	"template": Vue.templified("pages/dnd/master/soundboard.html")
});
