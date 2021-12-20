/**
 * 
 * @module rsSystem.controls
 * @for rsSystem
 */
rsSystem.controls = rsSystem.controls || {};

/**
 * Declare issues with the ServiceWorker and notify the user.
 * 
 * This is aimed at notifying the user when they are attempting to perform
 * an action (such as updating) that needs the service worker. Idle checks
 * (such as version checks from ping) should likely not invoke this unless
 * the page has been active for a long period of time or some other state
 * that warrants a general "heads-up" to the user.
 * @method serviceWorkerFault
 */
rsSystem.controls.serviceWorkerFault = function() {
	rsSystem.EventBus.$emit("dialog:open", {
		"title": "Service Worker not Found",
		"messages": ["Please refresh your page to update."],
		"buttons": [{
			"classes": "fas fa-refresh",
			"text": "Refresh",
			"emission": function() {
				location.reload();
			}
		}, {
			"classes": "fas fa-times",
			"text": "Skip for Now",
			"emission": "dialog:dismiss"
		}]
	});
};
