var Blizzard = require("blizzard.js"),
	WoW = Blizzard.wow,
	client;
	
module.exports = function(universe) {


	this.initialize = (specification) => {
		return new Promise((done, fail) => {
			WoW.createInstance({
				"key": specification.client.id,
				"secret": specification.client.secret,
				"origin": "us", // optional
				"locale": "en_US" // optional
			}).then(function(client) {
				// console.log("Client: ", client);
				var character = {};
				character.realm = "duskwood";
				character.name = "aethos";
				// character.season = 1;
				return client.characterProfessions(character);
			}).then(function(response) {
				// console.log("Key: ", JSON.stringify(keys.data.primaries, null, 4));
				var professions = response.data.primaries,
					tailoring,
					shadowlands,
					made = {},
					count,
					x;
					
				for(x=0; x<professions.length; x++) {
					console.log("Profession search: " + professions[x].profession.name);
					if(professions[x].profession.name === "Tailoring") {
						tailoring = professions[x];
					}
				}
				
				if(tailoring && tailoring.tiers) {
					for(x=0; x<tailoring.tiers.length; x++) {
						console.log("Tailoring search: " + tailoring.tiers[x].tier.name);
						if(tailoring.tiers[x].tier.name === "Shadowlands Tailoring") {
							shadowlands = tailoring.tiers[x];
						}
					}
				}
				
				if(shadowlands && shadowlands.known_recipes) {
					console.log("Shadowlands search...");
					count = {};
					for(x=0; x<shadowlands.known_recipes.length; x++) {
						if(count[shadowlands.known_recipes[x].name]) {
							count[shadowlands.known_recipes[x].name]++;
							made[shadowlands.known_recipes[x].name] = count[shadowlands.known_recipes[x].name];
						} else {
							count[shadowlands.known_recipes[x].name] = 1;
						}
					}
				}
				
				console.log("Made: ", made);
			}).catch(function(err) {
				console.log("Err: ", err);
			});
			
			done();
		});
	};
};
