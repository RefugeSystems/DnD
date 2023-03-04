/**
 * 
 * @class AudioDiscoverySonos
 * @constructor
 * @static
 */
var configuration = require("a-configuration"),
	Sonos = require("sonos");

module.exports.type = "sonos";

module.exports.initialize = function(universe) {
	var config = configuration.discovery || {},
		idReplacements = /_/ig,
		start_up = Date.now(),
		devices = {},
		runDiscovery,
		getIDString,
		capability;

	config.capability = config.capability || {};
	config.capability.sonos = config.capability.sonos || "capability:audio:sonos";
	config.timeout = config.timeout || 60000;
	config.rediscover = config.rediscover;
	if(config.notify === undefined) {
		config.notify = true;
	}

	getIDString = function(id) {
		return id.toLowerCase().replace(idReplacements, ":");
	};

	runDiscovery = function() {
		var found = [],
			discovery,
			device,
			seen,
			id;
			
		if(config.notify) {
			universe.emit("send", {
				"id": "status:discover:sonos",
				"type": "notice",
				"recipients": universe.getMasters(),
				"message": "Sonos Discovery Running",
				"icon": "fa-solid fa-spinner fa-spin-pulse rs-green",
				"anchored": true
			});
		}

		discovery = new Sonos.AsyncDeviceDiscovery({
			"address": configuration.discovery.wirelessAddress || undefined,
			"timeout": config.timeout
		});

		discovery.discover().then((device, model) => {
			return device.getAllGroups();
		}).then((groups) => {
			seen = Date.now();
			groups.forEach(function(group) {
				console.log("Discovery Group: " + group.ID);
				id = "device:" + getIDString(group.ID);
				device = universe.get(id);
				if(device) {
					if(!device.is_discovered) {
						found.push(device.name);
					}
					capability = Object.assign({}, device.capability);
					devices[id] = device;
					capability["capability:audio:sonos"] = start_up;
					devices[id] =  new Promise(function(done, fail) {
						device.setValues({
							"name": group.Name,
							"capability": capability,
							"ip": group.host,
							"model": "model:audio:sonos:group",
							"is_discovered": true,
							"last_seen": seen
						}, function(error, updated) {
							if(error) {
								fail(error);
							} else {
								done(updated);
							}
						});
					});
				} else {
					found.push(group.Name);
					devices[id] = universe.createObject({
						"id": id,
						"name": group.Name,
						"capability": {
							"capability:audio:sonos": start_up
						},
						"is_discovered": true,
						"ip": group.host,
						"model": "model:audio:sonos:group",
						"last_seen": seen
					});
				}
			});
			if(config.notify) {
				if(config.notify) {
					universe.emit("send", {
						"id": "status:discover:sonos",
						"type": "notice",
						"recipients": universe.getMasters(),
						"message": "Sonos Discovery Complete" + (found.length?" - New Devices: " + found.join(", "):""),
						"icon": "fa-solid fa-check rs-green",
						"anchored": true
					});
				}
			}
		}).catch(err => {
			if(config.notify) {
				universe.emit("send", {
					"id": "status:discover:sonos",
					"type": "notice",
					"recipients": universe.getMasters(),
					"message": "Sonos Discovery Error: " + err.message,
					"icon": "fa-solid fa-exclamation-triangle rs-yellow",
					"data": {
						"stack": err.stack
					},
					"anchored": true
				});
			}
		});

		if(typeof(config.rediscover) === "number") {
			setTimeout(runDiscovery, config.rediscover);
		}
	};

	/**
	 * 
	 * @event player:master:discovery:audio:sonos
	 */
	universe.on("player:master:discovery:audio:sonos", runDiscovery);
	universe.on("player:master:discovery:audio", runDiscovery);
	universe.on("player:master:discovery", runDiscovery);
	universe.on("initialized", function() {
		var lookup = universe.manager.audio.object,
			ids = universe.manager.audio.objectIDs,
			device,
			i;

		for(i=0; i<ids.length; i++) {
			device = lookup[ids[i]];
			if(device && device.capability && device.capability[config.capability.sonos]) {
				device.setValues({
					"is_discovered": false
				});
			}
		}

		runDiscovery();
	});
};
