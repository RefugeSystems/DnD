/**
 * 
 * @class AuthModuleGoogle
 * @extends SystemAuthModule
 * @constructor
 * @static
 */

var Strategy = require("passport-google-oauth20").Strategy,
	Random = require("rs-random"),
	btoa = require("btoa"),
	express = require("express");

// console.log("Local Made");
module.exports = new (function() {
	this.router = express.Router();
	this.description = {};
	this.description.id = "google";
	this.description.icon = "fab fa-google";
	this.description.name = "Google";
	
	this.router.use((req, res, next) => {
		console.log("Google: " + req.id);
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
			"clientID": specification.OAUTH2_CLIENT_ID,
			"clientSecret": specification.OAUTH2_CLIENT_SECRET,
			"callbackURL": specification.OAUTH2_CALLBACK,
			"accessType": "offline"
		};
		
		var receiveProfile = function (req, accessToken, refreshToken, profile, done) {
			console.log("Received Profile...\n", req, accessToken, refreshToken, profile);
			var user,
				buffer,
				x;
				
			for(x=0; x<universe.manager.player.objectIDs.length; x++) {
				buffer = universe.manager.player.object[universe.manager.player.objectIDs[x]];
				if(buffer && buffer.attribute && buffer.attribute.google === profile.id) {
					user = buffer;
					break;
				}
			}
			
			var makePlayer = function() {
				var details = {
					"id": Random.identifier("player", 10, 32).toLowerCase(),
					"username": profile.emails[0].value,
					"name": profile.displayName,
					"email": profile.emails[0].value,
					"gm": false,
					"attribute": {
						"picture": profile.photos && profile.photos.length?profile.photos[0].value:null,
						"google": profile.id
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
				console.log("User Found: " + user.id);
				makeSession(null, user);
			} else if(authentication.specification.allow_creation || specification.allow_creation) {
				console.log("Making Player");
				makePlayer();
			} else {
				var error = new universe.Anomaly("authentication:google:not-found", "Authentication completed but user was not found", 40, {"request": req.id, "profile": profile});
				console.log("User Not Found: " + profile.displayName + "@" + profile.id);
				authentication.emit("error", error);
				done();
			}
		};
		
		strategy = new Strategy(strategy, receiveProfile);
	
		passport.use(strategy);
		
		var inbound,
			finish,
			link;
		
		inbound = passport.authenticate("google", {
			"scope": ["email", "profile"]
		});
		
		link = passport.authenticate("google", {
			"scope": ["email", "profile"],
			"failureRedirect": "http://127.0.0.1:3082/#/?authfail=401.1"
		});
		
		finish = function(req, res, next) {
			console.log("Complete: ", req.session.passport.user);
			if(req.session && req.session.passport && req.session.passport.user) {
				res.redirect("http://127.0.0.1:3082/#/?session=" + btoa(JSON.stringify(req.session.passport.user)));
			} else {
				res.redirect("http://127.0.0.1:3082/#/?authfail=401.1");
			}
		};
		
		this.router.get("/authenticate", inbound);
		this.router.get("/link", link);
		this.router.use(finish);
	};
})();
