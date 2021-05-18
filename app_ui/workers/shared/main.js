var connections = [],
	start = Date.now(),
	version = "Unknown",
	connection = {},
	master = null,
	version = "",
	socket = null,
	state = {},
	buffer = [];

var login = function(session, address) {
	connection.session = session;
	connection.address = address;
	
	socket = new WebSocket(address + "?session=" + session);

	socket.onopen = (event) => {
		state.closing = false;
		state.opened = Date.now();
		if(state.reconnecting) {
			state.reconnecting = false;
			send("reconnected", this);
		}
		send("connected", this);
		
		if(buffer.length) {
			setTimeout(() => {
				var count = 0;
				while(buffer.length && count < 50) {
					this.send(buffer.shift());
					count++;
				}
				this.buffer.splice(0);
			}, 0);
		}
	};

	socket.onerror = (event) => {
		state.lastErrorAt = Date.now();
		state.lastError = "Connection Fault";
		socket = null;
		if(!state.reconnecting) {
			state.reconnecting = true;
			send("connection-issues");
		}
		// reconnect();
	};

	socket.onclose = (event) => {
		if(!state.closing) {
			if(event.code === 4000) {
				// Player Not Found: Bad username or passcode
				send("login-bad");
			//} else if(event.code === 1013) { // Universe still initializing (Use Reconnect)
			} else if(!this.state.reconnecting) {
				state.lastErrorAt = Date.now();
				state.lastError = "Connection Fault";
				state.reconnecting = true;
				send("connection-issues");
				// reconnect();
			}
		} else if(this.state.closing) {
			send("disconnected");
		}
		this.connection.socket = null;
	};

	socket.onmessage = (event) => {
		var message,
			fulfill;

		state.syncMark = event.time;
		state.last = Date.now();

		try {
			message = JSON.parse(event.data);
			message.received = Date.now();
			if(message.version && message.version !== this.version) {
				send("version", message.version);
			}
			
			send(message.type, message.event);
		} catch(exception) {
			send("error", {"message": "JSON Encoding Issue"});
		}
	};
};

var send = function(type, message) {
	message = {
		"type": type,
		"message": message
	};
	for(var x=0; x<connections.length; x++) {
		connections[x].postMessage(message);
	}
};

self.onconnect = function(connectEvent) {
	const port = connectEvent.ports[0];
	port.start();

	port.onmessage = function(message) {
		var transmit;
		if(message.data) {
			if(message.data.data) {
				transmit = message.data.data;
			} else {
				transmit = message.data;
			}
		}
		
		switch(transmit.command) {
			case "closing":
				var index = connections.indexOf(port);
				connections.splice(index, 1);
				if(master == port) {
					if(connections.length) {
						master = connections[0];
						connections[0].postMessage({"type": "designation", "designation": "master"});
					} else {
						master = null;
					}
				}
				break;
			case "login":
				if(!socket) {
					login(transmit.session, transmit.address);
				}
				break;
			default:
				for(var x=0; x<connections.length; x++) {
					if(connections[x] !== port) {
						connections[x].postMessage(transmit);
					}
				}
		}
	};
	
	connections.push(port);
	
	if(!master) {
		master = port;
		port.postMessage({"type": "designation", "designation": "master"});
	} else {
		port.postMessage({"type": "designation", "designation": "slave"});
		master.postMessage({"type": "sync"});
	}
};
