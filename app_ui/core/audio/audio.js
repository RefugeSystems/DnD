/**
 * 
 * @class rsSystem.audio
 * @constructor
 * @static
 */
rsSystem.audio = rsSystem.audio || {};

(function() {

	var timeout = 30000,
		buildCache,
		universe;
	
	/**
	 * 
	 * @property cached
	 * @type Object
	 */
	rsSystem.audio.cached = {};

	/**
	 * Maps audio IDs to current settings for those IDs that superceed
	 * any settings from the RSAudio object, such as localized repeats
	 * or custom volume reductions for the current playback.
	 * @property settings
	 * @type Object
	 */
	rsSystem.audio.settings = {};

	/**
	 * Maps IDs to repeating audios
	 * @property active
	 * @type Object
	 */
	rsSystem.audio.active = {};

	/**
	 * Initialize the Audio handler 
	 * @method initialize
	 * @param {RSUniverse} universe 
	 */
	rsSystem.audio.initialize = function(uni) {
		universe = uni;
		buildCache(uni);
		
		universe.$on("master:control", function(event) {
			console.log("Play Audio? ", event);
			if(event && event.data) {
				var audio = universe.index.audio[event.data.audio],
					volume = event.data.volume,
					delay = event.data.delay;
				switch(event.control) {
					case "audio:play":
						rsSystem.audio.play(audio, volume, delay);
						break;
					case "audio:stop":
						rsSystem.audio.stop(audio, delay);
						break;
					case "audio:stop:all":
						console.log(" > Stop All");
						rsSystem.audio.stopAll(delay);
						break;
				}
			}
		});
		
		universe.$on("audio:queue", function(event) {
			console.log("Queue Audio? ", event);
			if(event && event.audio) {
				var audio = universe.index.audio[event.audio],
					volume = event.volume,
					delay = event.delay || 0;
				switch(event.control) {
					case "audio:play":
						rsSystem.audio.play(audio, volume, delay);
						break;
					case "audio:stop":
						rsSystem.audio.stop(audio, delay);
						break;
				}
			}
		});
	};

	rsSystem.addInitialization(rsSystem.audio.initialize);

	/**
	 * 
	 * @method buildCache
	 * @private
	 */
	buildCache = function(universe) {
		var concepts = ["chat", "combat:start", "combat:turn", "combat:round", "button:equip", "button:unequip", "button:character", "button:map", "button:other"],
			setting,
			audio,
			load;

		concepts.forEach(function(concept) {
			setting = universe.index.setting["setting:" + concept];
			if(setting) {
				audio = universe.index.audio[setting.value];
			} else {
				audio = universe.index.audio["audio:" + concept];
			}
			if(audio) {
				if(audio.url) {
					load = new Audio(audio.url);
				} else {
					load = new Audio(rsSystem.universe.getObjectPath(audio.id, "audio"));
				}
				load.onended = function() {
					delete(rsSystem.audio.active[load.id]);
				};
			}
		});
	};

	/**
	 * Play time to use as a buffer to loop for smoother shifts.
	 * @property loop_buffer
	 * @type Number
	 * @default .44
	 */
	rsSystem.audio.loop_buffer = .1;

	/**
	 * Play an audio object locally.
	 * @method play
	 * @param {RSAudio} object
	 * @param {Integer} [delay]
	 */
	rsSystem.audio.play = function(object, volume, delay) {
		var audio,
			play,
			id;

		if(typeof(object) === "string") {
			id = object;
			object = universe.index.audio[object];
		}

		if(typeof(volume) === "number") {
			volume = volume/100;
		}

		if(object) {
			if(!rsSystem.universe.profile.disable_sounds) {
				id = object.id;
				audio = rsSystem.audio.cached[id] || rsSystem.audio.active[id];
				delay = delay || 0;

				play = function() {
					audio.oncanplay = null;
					setTimeout(function() {
						if(audio.readyState === 4) {
							audio._retried = 0;
							if(object.is_looped) {
								audio.loop = true;
							}
							if(volume || object.volume) {
								audio.volume = volume || object.volume/100;
							}
							// rsSystem.log.warn("Playing Audio: " + id);
							// audio.currentTime = 0;
							audio.play()
							.then(function() {
								rsSystem.audio.active[id] = audio;
							})
							.catch(function(err) {
								rsSystem.log.warn("Audio " + id + " failed to play: " + err.message);
							});
						} else {
							rsSystem.log.warn("Audio " + id + " in invalid ready state: " + audio.readyState + ". Retrying...");
							if(audio.readyState === 3 && audio._retried++ < 5) {
								setTimeout(play, 100);
							}
						}
					}, delay);
				};

				if(!audio) {
					// rsSystem.log.warn("Making Audio: " + id);
					if(object.url) {
						audio = new Audio(object.url);
					} else {
						audio = new Audio(rsSystem.universe.getObjectPath(id, "audio"));
					}
					audio._retried = 0;
					audio.oncanplay = play;
					audio.onended = function() {
						// rsSystem.log.warn("Audio Finished: " + id);
						delete(rsSystem.audio.active[id]);
					};
					if(object.is_looped) {
						// See: https://stackoverflow.com/questions/7330023/gapless-looping-audio-html5
						audio.addEventListener("timeupdate", function() {
							if(typeof(object.loop_buffer) === "number") {
								if(this.currentTime > this.duration - object.loop_buffer) {
									this.currentTime = 0;
									this.play();
								}
							} else {
								if(this.currentTime > this.duration - rsSystem.audio.loop_buffer) {
									this.currentTime = 0;
									this.play();
								}
							}
						});
					}
				} else {
					if(volume || object.volume) {
						audio.volume = volume || object.volume/100;
					}
					// rsSystem.log.warn("Found Audio: " + id);
					if(audio.readyState === 4) {
						audio.currentTime = 0;
					} else {
						play();
					}
				}
			} else {
				rsSystem.log.info("Audio[Enabled?" + (!rsSystem.universe.profile.disable_sounds) + "] Skipping play for ", object);
			}
		} else {
			rsSystem.log.warn("Audio[" + id + "] Not found", object);
		}
	};

	/**
	 * 
	 * @method stop
	 * @param {RSAudio} object
	 * @param {Integer} [delay]
	 */
	rsSystem.audio.stop = function(object, delay) {
		delay = delay || 0;
		var id = object.id || object,
			audio;
		
		audio = rsSystem.audio.active[id];
		if(audio) {
			// audio.currentTime = 0;
			delete(rsSystem.audio.active[id]);
			audio.pause();
		}
	};

	/**
	 * 
	 * @method stopAll
	 * @param {Integer} [delay]
	 */
	rsSystem.audio.stopAll = function(delay) {
		if(delay) {
			setTimeout(rsSystem.audio.stopAll, delay);
		} else {
			for(var id in rsSystem.audio.active) {
				delete(rsSystem.audio.active[id]);
				rsSystem.audio.stop(id);
			}
		}
	};
})();
