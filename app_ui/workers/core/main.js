/**
 * 
 * @class RSSWXServiceWorker
 * @constructor
 * @see https://github.com/GoogleChromeLabs/airhorn/blob/master/app/sw.js
 */
var storageKey = "_rs_connectComponentKey",
	// TODO: Centralize ServiceWorker versioning for app control (Align with package version?)
	version = "0.0.1",
	cacheID = "rsswx_" + version,
	development = location.href.indexOf("127.0.0.1") !== -1 || location.href.indexOf("localhost") !== -1 || location.href.indexOf(".development.") !== -1 || location.href.indexOf(".dev.") !== -1,
	followUp,
	cacheOptions = {
		"ignoreSearch": true
	};

self.addEventListener("install", function(event) {
	// console.log("SW Install");
	var result = caches.open(cacheID);
	result.then(function(cache) {
		return cache.addAll([
//				"/projects/rsswx/app/",
//				"/projects/rsswx/app/index.html",
//				"/projects/rsswx/app/main.css",
//				"/projects/rsswx/app/fonts/starwars-glyphicons.css",
//				"/projects/rsswx/app/fonts/xwing-miniatures.css",
//				"/projects/rsswx/app/fonts/rpg-awesome.css",
//				"/projects/rsswx/app/webfonts/all.css",
//				"/projects/rsswx/app/fonts/rsswx.css",
//				"/projects/rsswx/app/externals.js",
//				"/projects/rsswx/app/main.js"
			"./",
			"./index.html",
			
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
//		console.log(" > Responding[" + event.request.url + "]: ", !!response);
		if(!development && response) {
//		if(response) {
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
