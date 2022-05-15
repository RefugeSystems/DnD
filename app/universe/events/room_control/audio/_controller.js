/**
 * Describes the abstracted interface for managing room audio controllers regardless of type.
 * @class AudioController
 * @constructor
 * @private
 * @param {RoomCtrl} controller
 */

var configuration = require("a-configuration"),
	idReplacements = /[^a-z0-9]/ig;

class AudioController {
	constructor(controller) {
		this.controller = controller;
	}

	/**
	 * 
	 * @method getAudioURL
	 * @param {Audio} audio 
	 * @returns {String}
	 */
	getAudioURL(audio) {
		if(audio.url) {
			return audio.url;
		}
		if(configuration && configuration.server && configuration.server.public) {
			return configuration.server.public + "/api/v1/audio/" + audio.id;
		}
		return null;
	}

	/**
	 * 
	 * @method idFromName
	 * @param {String} name 
	 * @param {String} [type] Defaults to "audio"
	 * @returns {String}
	 */
	idFromName(name, type) {
		if(name) {
			return (type || "audio") + ":" + name.toLowerCase().replace(idReplacements, "_");
		}
		return "";
	}

	/**
	 * 
	 * @method play
	 * @param {Audio} audio 
	 * @return {Promise}
	 */
	play(audio) {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * 
	 * @method setVolume
	 * @param {Integer} volume 0-100 for percentage.
	 * @return {Promise}
	 */
	setVolume(volume) {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * 
	 * @method pause
	 * @return {Promise}
	 */
	pause() {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * 
	 * @method stop
	 * @return {Promise}
	 */
	stop() {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * 
	 * @method start
	 * @param {Playlist} playlist
	 * @return {Promise}
	 */
	start(playlist) {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * 
	 * @method cease
	 * @return {Promise}
	 */
	cease() {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * Report the status of the controller.
	 * 
	 * This is primarily for remote devices to aquire audio URLs.
	 * @method report
	 * @return {Promise}
	 */
	 report() {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}

	/**
	 * Create an audio track from the currently playing audio.
	 * 
	 * Usually based on name using the "idFromName" method
	 * @method report
	 * @return {Promise}
	 */
	currentToAudio() {
		return new Promise(function(done, fail) {
			fail(new Error("Not Implemented"));
		});
	}
}

module.exports = AudioController;