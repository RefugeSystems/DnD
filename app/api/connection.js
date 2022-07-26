/**
 * 
 * @class APIWSConnectionController
 * @constructor
 * @static
 */

var WebSocket = require("ws"),
	fs = require("fs");

module.exports = new (function() {
	this.id = "api:ws:controller";
	
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
				// console.log( " [!] Websocket Server Connection: ", request.reconnecting);

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
				
				api.universe.connectPlayer(request.session, connection);
			});
			
			api.server.on("upgrade", function(request, socket, head) {
				request.url = new URL("http://self" + request.url);
				// console.log(" [!] Upgrade URL: ", request.url);

				if(request.url.pathname === "/connect" && request.url.searchParams) {
					request.reconnecting = request.url.searchParams.get("reconnect") === true;
					request.query = request.url.query; // This doesn't appear to be handled by WS
					request.path = request.url.pathname;

					// console.log("Verifying Client: ", request.query);
					api.getSession(request.url.searchParams.get("session"))
					.then(function(session) {
						// console.log("Session: ", session.id);
						if(session) {
							// log.info({"req": request, "session": session}, "Websocket accepted");
							request.session = session;
							handler.handleUpgrade(request, socket, head, function(ws) {
								api.emit("event", new api.universe.Anomaly("ws:connect:established", "Player Connected", 20, {"request": request, "session": session.toJSON()}, null, this));
								handler.emit("connection", ws, request);
							});
						} else {
							api.emit("error", new api.universe.Anomaly("ws:connect:session", "No session found for connection", 40, {"request": request}, null, this));
							// TODO: Respond nicely
							socket.destroy();
						}
					}).catch(function(error) {
						var details = {};
						details.request = {};
						details.request.headers = request.headers;
						details.request.query = request.query;
						details.request.url = request.url;
						details.session = request.session;
						api.emit("error", new api.universe.Anomaly("ws:connect:fault", "Failed to create connection for user", 40, details, error, this));
						// TODO: Respond nicely
						// console.log("Error: ", error);
						socket.destroy();
					});
				} else {
					socket.destroy();
				}
			});
			
			done();
		});
	};
})();
