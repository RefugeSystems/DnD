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
		"categories": function() {
			var locale = this.location.audios,
				categories = {},
				audios,
				audio,
				i;

			if(this.storage.show_all) {
				audios = this.universe.listing.audio;
			} else if(locale && locale.length) {
				audios = this.universe.transcribeInto(locale);
			} else {
				audios = [];
			}

			for(i=0; i<audios.length; i++) {
				audio = audios[i];
				if(rsSystem.utility.isValid(audio) && (!this.storage.filter || audio._search.indexOf(this.storage.filter) !== -1)) {
					if(!categories[audio.category]) {
						categories[audio.category] = [];
					}
					categories[audio.category].push(audio);
				}
			}

			return categories;
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
		"soundscapes": function() {
			var soundscapes = this.location.soundscapes;
			if(this.storage.show_all) {
				return this.universe.listing.soundscape;
			}
			if(soundscapes) {
				return this.universe.transcribeInto(soundscapes);
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

		data.soundscape = null;
		data.clearIcon = "fa-empty-set";
		data.toggledSelection = "";
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

		if(rsSystem.utility.isNotEmpty(this.storage.destination.player)) {
			Vue.set(this, "clearIcon", "fa-empty-set");
			Vue.set(this, "toggledSelection", "clear");
		} else {
			Vue.set(this, "clearIcon", "fa-check");
			Vue.set(this, "toggledSelection", "select");
		}

		if(typeof(this.storage.soundscape) !== "object") {
			Vue.set(this.storage, "soundscape", {}); 
		}
		
		this.soundscape = new Soundscape(this, this.storage.soundscape);
		this.universe.$on("session:encounter:type", this.respondEncounterType);
		this.universe.$on("session:weather", this.respondWeather);

		this.refreshAvailable();
	},
	"methods": {
		"toggleAction": function(action) {
			Vue.set(this.storage, action, !this.storage[action]);
			switch(action) {
				case "follow_weather":
					break;
				case "follow_type":
					break;
			}
		},
		"getCategoryName": function(category) {
			category = this.universe.index.category[category];
			if(category) {
				return category.name;
			}
			return "None";
		},
		"focusCategory": function(category) {
			if(this.storage.focused === category) {
				Vue.delete(this.storage, "focused");
			} else {
				Vue.set(this.storage, "focused", category);
			}
		},
		"audioClass": function(audio) {
			var styling = "";
			if(audio && this.activations[audio.id]) {
				styling += " audio-playing ";
			}
			return styling;
		},
		"soundscapeClass": function(soundscape) {
			if(this.soundscape && this.soundscape.active && this.soundscape.active.id === soundscape.id) {
				return "active";
			}
			return "inactive";
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
		"togglePlayerSelection": function() {
			var i;
			switch(this.toggledSelection) {
				case "clear":
					this.clearObject(this.storage.destination.player);
					break;
				case "select":
					for(i=0; i<this.available.player.length; i++) {
						if(!this.available.player[i].gm) {
							this.toggleDestination(this.available.player[i]);
						}
					}
					break;
			}
			if(rsSystem.utility.isNotEmpty(this.storage.destination.player)) {
				Vue.set(this, "clearIcon", "fa-empty-set");
				Vue.set(this, "toggledSelection", "clear");
			} else {
				Vue.set(this, "clearIcon", "fa-check");
				Vue.set(this, "toggledSelection", "select");
			}
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
			// this.storage.arrangement.right.splice(0);
			// this.storage.arrangement.left.splice(0);
			// this.storage.arrangement.right.push.apply(this.storage.arrangement.right, right);
			// this.storage.arrangement.left.push.apply(this.storage.arrangement.left, left);
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
		"playSoundscape": function(soundscape) {
			this.soundscape.playSoundscape(soundscape);
		},
		"stopSoundscape": function(pattern) {
			this.soundscape.stopSoundscape();
		},
		"toggleDestination": function(destination) {
			if(this.storage.destination[destination._class]) {
				if(this.storage.destination[destination._class][destination.id]) {
					Vue.delete(this.storage.destination[destination._class], destination.id);
				} else {
					Vue.set(this.storage.destination[destination._class], destination.id, true);
				}
				if(rsSystem.utility.isNotEmpty(this.storage.destination.player)) {
					Vue.set(this, "clearIcon", "fa-empty-set");
					Vue.set(this, "toggledSelection", "clear");
				} else {
					Vue.set(this, "clearIcon", "fa-check");
					Vue.set(this, "toggledSelection", "select");
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

			if(typeof(audio) === "string") {
				audio = this.universe.index.audio[audio];
			}

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
			if(typeof(audio) === "string") {
				audio = this.universe.index.audio[audio];
			}

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
		
		"respondEncounterType": function(event) {
			var type = event.encounter,
				playlist,
				i;
			if(this.storage.follow_type) {
				for(i=0; i<this.playlists.length; i++) {
					playlist = this.playlists[i];
					if(playlist.type === type) {
						this.start(playlist);
						break;
					}
				}
			}
		},
		"respondWeather": function(event) {
			var weather = this.universe.getObject(event.current || event.weather),
				soundscape,
				i;
			
			if(this.soundscape.active) {
				this.soundscape.stopSoundscape();
			}
			if(this.storage.follow_weather && weather && (soundscape = this.universe.getObject(weather.soundscape))) {
				this.soundscape.playSoundscape(soundscape);
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
		"playPlaylist": function(controller, playlist, volume) {
			rsSystem.universe.send("master:roomctrl:play", {
				"control": controller,
				"playlist": playlist,
				"volume": volume
			});
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
		"playPlayerAudio": function(playerMap, audio, volume) {
			rsSystem.universe.send("master:control:audio:play", {
				"recipients": playerMap,
				"audio": audio,
				"volume": volume
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
		this.universe.$off("session:encounter:type", this.respondEncounterType);
		this.universe.$off("session:weather", this.respondWeather);
		if(this.soundscape) {
			this.soundscape.destroy();
		}
		this.soundscape = null;
	},
	"template": Vue.templified("pages/dnd/master/soundboard.html")
});
