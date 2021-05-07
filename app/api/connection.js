/**
 * 
 * @class APIWSConnectionController
 * @constructor
 * @static
 */

var WebSocket = require("ws"),
	fs = require("fs");

module.exports = new (function() {
	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		return new Promise((done, fail) => {
			// Create Base Server
			var options = {},
				handler;
				
			options.noServer = true;
			
			if(api.specification.key) {
				options.ca = fs.readFileSync(api.specification.interm || api.specification.certificate_authority || api.specification.certificateAuthority || api.specification.ca, "utf-8");
				options.cert = fs.readFileSync(api.specification.certificate || api.specification.crt || api.specification.public, "utf-8");
				options.key = fs.readFileSync(api.specification.privateKey || api.specification.key || api.specification.private, "utf-8");
			}
			
			// Create WebSocket handler for server
			handler = new WebSocket.Server(options);
			handler.on("connection", function(connection, request) {
				connection.session = request.session;
				connection.request = request;
				connection.host = request.ip;

				if(request.session) {
					connection.username = request.session.username;
					connection.passcode = request.session.passcode;
					connection.name = request.session.name;
					connection.id = request.session.id;
				} else {
					connection.username = request.url.searchParams.get("username");
					connection.passcode = request.url.searchParams.get("passcode");
					connection.name = request.url.searchParams.get("name");
					connection.id= request.url.searchParams.get("id");
				}
				
				if(connection.passcode) {
					connection.passcode = connection.passcode.sha256();
				}
				
				api.universe.connectPlayer(connection);
			});
			
			done();
		});
	};
})();
