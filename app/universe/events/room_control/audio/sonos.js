var AudioController = require("./_controller.js"),
	Sonos = require("sonos").Sonos,
	universe;

/*

var sonos = new Sonos(process.env.SONOS_HOST || '192.168.86.165')
sonos.play("https://sounds.tabletopaudio.com/309_Bloodgate.mp3")
.then(function(result) {
	console.log('Started playing %j', result)
})
.catch(err => { console.log('Error occurred ' + err.message) })

sonos.stop().then(result => {
  console.log('Stopped playing %j', result)
}).catch(err => { console.log('Error occurred %s', err) })

sonos.getVolume().then(volume => {
  console.log('The volume is %d', volume)
}).catch(err => { console.log('Error occurred %s', err) })

sonos.setVolume(50).then(volume => {
  console.log('The volume is %d', volume)
}).catch(err => { console.log('Error occurred %s', err) })

*/

module.exports.initialize = function(univ) {
	universe = univ;
};

module.exports.getControl = function(control_point) {
	try {
		var control = new Sonos(control_point);
	} catch (exception) {

		return null;
	}
};



/**
 * Describes the abstracted interface for managing room audio controllers regardless of type.
 * @class SonosAudioController
 * @extends AudioController
 * @constructor
 * @private
 * @param {RoomCtrl} controller
 */
class SonosAudioController extends AudioController {
	constructor(controller) {
		super(controller);
		if(controller.control_device) {
			if(universe) {
				this._device = universe.get(controller.control_device);
				if(this._device) {
					this.ip = this._device.ip;
				}
			} else {
				throw new Error("Universe unavailable for Sonos Audio Controller Device Construction");
			}
		} else if(controller.control_point) {
			this.ip = controller.control_point;
		}
		this.sonos = new Sonos(this.ip);
	}

	play(audio) {
		return this.sonos.play(this.getAudioURL(audio));
	}

	trackToObject(track) {
		var audio = {};
		audio = {};
		audio.id = this.idFromName(track.title);
		audio.name = track.title;
		audio.url = track.uri;
		audio.description = "On Album: " + track.album + "  \nby: " + track.artist;
		return audio;
	}

	setVolume(volume) {
		return this.sonos.setVolume(volume);
	}

	pause() {
		return this.sonos.pause();
	}

	stop() {
		return this.sonos.stop();
	}

	start(playlist) {
		return new Promise((done, fail) => {
			console.log("Starting Playlist: ", playlist);
			var queued = [],
				audio,
				i;
			if(playlist && playlist.audios) {
				for(i=0; i<playlist.audios.length; i++) {
					audio = universe.get(playlist.audios[i]);
					if(audio && audio.url) {
						console.log(" > Queuing: " + audio.name);
						queued.push(this.sonos.queue(audio.url));
					} else {
						universe.warnMasters("Bad Audio[" + playlist.audios[i] + "] in Playlist[" + playlist.id + "]");
					}
				}
			}
			Promise.all(queued)
			.then(() => {
				console.log(" √ Queued");
				this.sonos.play();
				done();
			})
			.catch((err) => {
				console.log(" ! Err: " + err.message);
				fail(err);
			});
		});
	}

	cease() {
		return this.sonos.flush();
	}

	report(player) {
		var report = {};
		return this.sonos.currentTrack().then((track) => {
			console.log("Sonos[" + this.ip + "] Current Track: ", track);
			report.song = this.trackToObject(track);
			return this.sonos.getPlayMode();
		}).then((mode) => {
			report.mode = mode;
			return this.sonos.getName();
		}).then((name) => {
			report.name = name;
			return this.sonos.getVolume();
		}).then((volume) => {
			report.volume = volume;
			universe.emit("send", {
				"id": "status:discover:sonos",
				"type": "notice",
				"recipient": player.id,
				"message": "Current Song: " + report.song.name,
				"icon": "fa-solid fa-play rs-green",
				"data": report,
				"anchored": true
			});
		});
	}

	currentToAudio() {
		return this.sonos.currentTrack()
		.then((track) => {
			var track = this.trackToObject(track),
				audio;
			audio = universe.get(track.id);
			if(!audio) {
				return universe.createObject(track);
			} else {
				console.log("Audio Exists: " + audio.id);
			}
		});
	}
}

module.exports.AudioController = SonosAudioController;
