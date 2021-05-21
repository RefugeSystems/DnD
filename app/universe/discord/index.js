const Discord = require("discord.js");

module.exports = function(universe) {


	this.initialize = (specification) {
		return new Promise((done, fail) => {
			this.client = new Discord.Client();
			
			client.on('ready', () => {
				console.log("Discord Client: " + Object.keys(this.client), this.client.user);
				console.log("Discord Logged in as " + this.client.user.tag + " .");
			});
			
			client.on("message", (message) => {
				console.log("Received: ", message);
				if(message.content === "ping") {
					message.reply("Pong!");
				}
			});
			
			this.client.login(specification.token);
			done();
		});
	};
};
