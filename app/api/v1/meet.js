
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {

			this.router.get("/next/:username", (req, res, next) => {
				var meetings = Object.keys(api.universe.manager.meeting.object),
					players = Object.keys(api.universe.manager.player.object),
					now = Date.now(),
					meeting,
					player,
					nextMeet,
					i;

				for(i=0; i<players.length; i++) {
					player = api.universe.manager.player.object[players[i]];
					if(player && player.username === req.params.username) {
						break;
					}
				}
				if(player) {
					for(i=0; i<meetings.length; i++) {
						meeting = api.universe.manager.meeting.object[meetings[i]];
						if(now < meeting.date && !meeting.is_preview && !meeting.disabled && !meeting.is_disabled && meeting.players.indexOf(player.id) !== -1 && (!nextMeet || meeting.date < nextMeet.date)) {
							nextMeet = meeting;
						}
					}
				}
				res.result = {
					"meeting": nextMeet
				};
				next();
			});
			
			done();
		});
	};
})();
