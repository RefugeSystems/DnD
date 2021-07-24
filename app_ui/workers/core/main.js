/**
 * 
 * @class RSSWXServiceWorker
 * @constructor
 * @see https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js
 */
var storageKey = "_rs_connectComponentKey",
	// TODO: Centralize ServiceWorker versioning for app control (Align with package version?)
	version = "0.9.26",
	cacheID = "rsdnd_" + version,
	development = location.href.indexOf("127.0.0.1") !== -1 || location.href.indexOf("localhost") !== -1 || location.href.indexOf(".development.") !== -1 || location.href.indexOf(".dev.") !== -1,
	processAction,
	updateCaches,
	followUp,
	cacheOptions = {
		"ignoreSearch": true
	};

processAction = function(action, data) {
	switch (action) {
		case "update":
			updateCaches();
			break;
	}
};

updateCaches = function() {
	caches.keys()
	.then(function(keys) {
		for(var i = 0; i < keys.length; i++) {
			caches.delete(keys[i]);
		}
		return caches.open(cacheID);
	})
	.then(function(cache) {
		return cache.addAll([
			"./",
			"./index.html",
			"./configuration.json",

			"./images/rook.blue.png",
			"./images/rook.green.png",
			"./images/rook.orange.png",
			"./images/rook.red.png",
			"./favicon.png",

			"./fonts/starwars-glyphicons.css",
			"./fonts/xwing-miniatures.css",
			"./fonts/rpg-awesome.css",
			"./webfonts/all.css",
			"./fonts/rsswx.css",
			"./main.css",

			"./externals.js",
			"./main.js"
		]);
	})
	.then(function() {
		console.log("Cache Updated");
		location.reload();
	})
	.catch(function(error) {
		console.error("ServiceWorker Cache Update Error: ", error);
	});
};


self.addEventListener("install", function(event) {
	var result = caches.open(cacheID);
	result.then(function(cache) {
		return cache.addAll([
			"./",
			"./index.html",
			"./configuration.json",

			"./images/rook.blue.png",
			"./images/rook.green.png",
			"./images/rook.orange.png",
			"./images/rook.red.png",
			"./favicon.png",

			"./fonts/starwars-glyphicons.css",
			"./fonts/xwing-miniatures.css",
			"./fonts/rpg-awesome.css",
			"./webfonts/all.css",
			"./fonts/rsswx.css",
			"./main.css",

			"./externals.js",
			"./main.js"
		])
		.then(function() {
			self.skipWaiting();
		})
		.catch(function(error) {
			console.error("Install Fault: ", error);
		});
	});

	event.waitUntil(result);
});

self.addEventListener("fetch", function(event) {
	var complete = caches.match(event.request)
	.then(function(response) {
		if(!development && response) {
			return response;
		} else {
			return fetch(event.request);
		}
	})
	.catch(function(err) {
		console.warn("Cache Match Failed: ", err);
	});
	event.respondWith(complete);
});

self.addEventListener("notificationclick", function(event) {
	console.log("Notification Clicked[" + event.action + "]: ", event);
	if(event) {
		processAction(event.action, event);
	}
});

self.addEventListener("message", function(event) {
	console.log("Message: ", event);
	if(event) {
		processAction(event.action, event);
	}
});

self.addEventListener("push", function(event) {
	console.log("[Service Worker] Push Received.");
	console.log("[Service Worker] Push had this data: ", event);

	var title = "RSSWx";
	var options = {
		"body": "Notification",
		"icon": "images/rook.green.png",
		"badge": "images/rook.blue.png"
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("testing", function(event) {
	console.log("Test Event: ", event);
});

followUp = function() {
	//	console.log("Following Up...");
	setTimeout(followUp, 1000000);
};

followUp();
