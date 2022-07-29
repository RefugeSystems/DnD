
/**
 * 
 * @class Soundscape
 * @constructor
 * @param {DNDMasterSoundboard} controller 
 * @param {Object} storage 
 */
class Soundscape {

	constructor(controller, storage) {
		this.controller = controller;
		this.storage = storage;
		if(!(storage.arrangement instanceof Array)) {
			Vue.set(storage, "arrangement", new Array(21));
		}
		this.activeDestinations = {};
		this.timeouts = {};
		this.active = null;
	}

	/**
	 * 	
	 * @param {Integer} position Ranging from -10 to +10 where 0 is the master,
	 * 		+10 is the room audio device and -10 is the auxillary room device.
	 * @returns {String} For the ID of the destination which will be a player
	 * 		or roomctrl (Room Device) ID.
	 */
	get(position) {
		return this.storage.arrangement[10 + position];
	}


	set(position, id) {
		Vue.set(this.storage.arrangement, 10 + position, id);
	}

	setRoom(id) {
		Vue.set(this.storage.arrangement, 20, id);
	}

	setAux(id) {
		Vue.set(this.storage.arrangement, 0, id);
	}

	getInterval(interval) {
		switch(typeof(interval)) {
			case "number":
				return interval;
			case "object":
				if(interval instanceof Array) {
				} else {
					return Random.integer(interval.range, interval.min);
				}
			default:
				return 0;
		}
	}

	destroy() {
		this.stopSoundscape();
		this.controller = null;
		this.storage = null;
		this.active = null;
	}

	playSoundscape(soundscape) {

		this.active = soundscape;
		if(soundscape.scape) {
			this.playbackAudioLandscape(soundscape.scape);
		}
	}

	stopSoundscape() {
		var keys = Object.keys(this.timeouts),
			key,
			i;
		for(i=0; i<keys.length; i++) {
			key = keys[i];
			clearTimeout(this.timeouts[key]);
			delete(this.timeouts[key]);
		}
		if(this.active) {
			for(key in this.activeDestinations) {
				this.controller.stopPlayerAudio(this.activeDestinations[key], key);
			}
			this.active = null;
		}
	}

	playbackAudioLandscape(scape) {
		scape.forEach((pattern) => {
			var destinations = {},
				delay,
				play,
				id,
				j;

			switch(typeof(pattern)) {
				case "object":
					if(pattern.destinations) {
						for(j=0;j<pattern.destinations.length; j++) {
							id = this.get(pattern.destinations[j]);
							if(id) {
								destinations[id] = true;
							}
						}
					}
					if(pattern.delay) {
						delay = this.getInterval(pattern.delay);
					}
					play = () => {
						this.playbackAudioPattern(pattern.id, pattern.audio, destinations, pattern.destination, pattern.volume, pattern.interval);
						if(!this.activeDestinations[pattern.audio]) {
							this.activeDestinations[pattern.audio] = {};
						}
						Object.assign(this.activeDestinations[pattern.audio], destinations);
					};
					if(delay) {
						this.timeouts["delayed:" + pattern.id] = setTimeout(play, delay);
					} else {
						play();
					}
					break;
				case "string":
					destinations[this.get(0)] = true;
					this.playPlayerAudio(pattern, destinations);
					if(!this.activeDestinations[pattern]) {
						this.activeDestinations[pattern] = {};
					}
					Object.assign(this.activeDestinations[pattern], destinations);
					play = null;
					break;
				default:
					play = null;
					break;
			}

		});
	}

	/**
	 * 
	 * @param {String} id
	 * @param {String} audio
	 * @param {Object} destinations
	 * @param {String | Array | String} [destination]
	 * @param {Integer} [volume]
	 * @param {Integer | Object} [interval] Can simply be a period to wait or an object specifying a random range.
	 * 		Used in milliseconds with setTimeout.
	 * @param {Integer} [interval.range] 
	 * @param {Integer} [interval.min] 
	 */
	playbackAudioPattern(id, audio, destinations, destination, volume, interval) {
		var localInterval,
			players,
			player;
		id = id || audio;

		if(id && audio) {
			if(audio.startsWith("audio:")) {
				// Audio - Only works with Players through soundscapes
				players = Object.assign({}, destinations);
				if(destination) {
					if(destination instanceof Array) {
						player = this.get(destination[Random.integer(destination.length)]);
					} else {
						player = this.get(destination);
					}
					if(!player && this.active && this.active.master_fallback) {
						player = this.get(0);
					}
					if(player) {
						players[player] = true;
					}
				}
				this.controller.playPlayerAudio(players, audio, volume);

				if(interval && !this.timeouts[id]) {
					localInterval = this.getInterval(interval);
					this.timeouts[id] = setTimeout(() => {
						this.timeouts[id] = null;
						this.playbackAudioPattern(id, audio, destinations, destination, volume, interval);
					}, localInterval);
				}
			} else {
				// Playlist - Only works with Room Controllers
				for(destination in destinations) {
					this.controller.playPlaylist(destination, audio, volume);
				}
			}
		}
	}
}
