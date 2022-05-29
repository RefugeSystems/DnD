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
			if(event && event.data && event.data.audio) {
				var audio = universe.index.audio[event.data.audio],
					delay = event.data.delay;
				switch(event.control) {
					case "audio:play":
						rsSystem.audio.play(audio, delay);
						break;
					case "audio:stop":
						rsSystem.audio.stop(audio, delay);
						break;
					case "audio:stop:all":
						rsSystem.audio.stopAll();
						break;
				}
			}
		});
		
		universe.$on("audio:queue", function(event) {
			console.log("Queue Audio? ", event);
			if(event && event.audio) {
				var audio = universe.index.audio[event.audio],
					delay = event.delay || 0;
				switch(event.control) {
					case "audio:play":
						rsSystem.audio.play(audio, delay);
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
	 * Play an audio object locally.
	 * @method play
	 * @param {RSAudio} object
	 * @param {Integer} [delay]
	 */
	rsSystem.audio.play = function(object, delay) {
		var audio,
			play,
			id;

		if(typeof(object) === "string") {
			id = object;
			object = universe.index.audio[object];
		}

		if(object) {
			if(!rsSystem.universe.profile.disable_sounds) {
				id = object.id;
				audio = rsSystem.audio.cached[id] || rsSystem.audio.active[id];
				delay = delay || 0;

				play = function() {
					setTimeout(function() {
						if(audio.readyState === 4) {
							if(object.is_looped) {
								audio.loop = true;
							}
							rsSystem.log.warn("Playing Audio: " + id);
							// audio.currentTime = 0;
							audio.play()
							.then(function() {
								rsSystem.audio.active[id] = audio;
							})
							.catch(function(err) {
								rsSystem.log.warn("Audio " + id + " failed to play: " + err.message);
							});
						} else {
							rsSystem.log.warn("Audio " + id + " in invalid ready state: " + audio.readyState);
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
					audio.oncanplay = play;
					audio.onended = function() {
						// rsSystem.log.warn("Audio Finished: " + id);
						delete(rsSystem.audio.active[id]);
					};
				} else {
					// rsSystem.log.warn("Found Audio: " + id);
					if(audio.readyState === 4) {
						audio.currentTime = 0;
					} else {
						play();
					}
				}
			} else {
				rsSystem.log.info("Audio[Enabled?" + rsSystem.universe.profile.disable_sounds + "] Skipping play for ", object);
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
		var id = object.id,
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
	 * @param {RSAudio} object
	 * @param {Integer} [delay]
	 */
	rsSystem.audio.stopAll = function(delay) {
		var audios,
			audio,
			id;
		for(id in rsSystem.audio.active) {
			audio = rsSystem.audio.active[id];
			rsSystem.audio.stop(audio);
		}
	};
})();
