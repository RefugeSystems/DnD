/**
 * 
 * @class AuthModuleFacebook
 * @extends SystemAuthModule
 * @constructor
 * @static
 */

var Strategy = require("passport-facebook").Strategy,
	Random = require("rs-random"),
	btoa = require("btoa"),
	express = require("express");

// console.log("Local Made");
module.exports = new (function() {
	this.router = express.Router();
	this.description = {};
	this.description.id = "facebook";
	this.description.icon = "fab fa-facebook";
	this.description.name = "Facebook";
	
	this.router.use((req, res, next) => {
		console.log("Facebook: " + req.id);
		next();
	});
	
	/**
	 * 
	 * @method initialize
	 * @param {Authentication} authentication
	 * @param {Router} authentication.router
	 * @param {Universe} universe
	 */
	this.initialize = (authentication, specification, universe) => {
		var passport = authentication.passport;
		
		var strategy = {
			"clientID": specification.app_id,
			"clientSecret": specification.app_secret,
			"callbackURL": specification.callback || authentication.public + "login/facebook/link",
			"accessType": "offline"
		};
		
		var receiveProfile = function (req, accessToken, refreshToken, profile, done) {
			// console.log("Received Profile...\n", req, accessToken, refreshToken, profile);
			var id = profile.id,
				user,
				buffer,
				x;
				
			for(x=0; x<universe.manager.player.objectIDs.length; x++) {
				buffer = universe.manager.player.object[universe.manager.player.objectIDs[x]];
				if(buffer && buffer.attribute && buffer.attribute.facebook && buffer.attribute.facebook.indexOf(id) !== -1) {
					user = buffer;
					break;
				}
			}
			
			var makePlayer = function() {
				var details = {
					"id": Random.identifier("player", 10, 32).toLowerCase(),
					"username": id,
					"name": profile.displayName,
					"gm": false,
					"attribute": {
						"facebook": [id]
					}
				};
				universe.createObject(details, makeSession);
			};
			
			var makeSession = function(err, player) {
				if(err) {
					done(err);
				} else {
					authentication.generateSession(player)
					.then((session) => {
						done(null, session);
					})
					.catch(function(err) {
						done(err);
					});
				}
			};
			
			if(user) {
				// console.log("User Found: " + user.id);
				makeSession(null, user);
			} else if(authentication.specification.allow_creation || specification.allow_creation) {
				// console.log("Making Player");
				makePlayer();
			} else {
				var error = new universe.Anomaly("authentication:facebook:not-found", "Authentication completed but user was not found", 40, {"request": req.id, "profile": profile});
				// console.log("User Not Found: " + profile.displayName + "@" + profile.id);
				authentication.emit("error", error);
				done();
			}
		};
		
		strategy = new Strategy(strategy, receiveProfile);
	
		passport.use(strategy);
		
		var inbound,
			finish,
			link;
		
		inbound = passport.authenticate("facebook");
		
		link = passport.authenticate("facebook", {
			"failureRedirect": authentication.public_web + "#/?authfail=401.1"
		});
		
		finish = function(req, res, next) {
			// console.log("Complete: ", req.session.passport.user);
			if(req.session && req.session.passport && req.session.passport.user) {
				res.redirect(authentication.public_web + "#/?session=" + btoa(JSON.stringify(req.session.passport.user)));
			} else {
				res.redirect(authentication.public_web + "#/?authfail=401.1");
			}
		};
		
		this.router.get("/authenticate", inbound);
		this.router.get("/link", link);
		this.router.use(finish);
	};
})();
