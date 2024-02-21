
/**
 * General event bus for the system
 * @property EventBus
 * @type EventEmitter
 * @for rsSystem
 * @static
 */
(function() {
	
	
	rsSystem.EventBus = new EventEmitter();
	
	document.body.onkeydown =  function(event) {
		if(event && event.key) {
			rsSystem.EventBus.$emit("key:" + event.key.toLowerCase(), event);
		}
	};
	
	/**
	 * 
	 * @event app-update
	 * @for rsSystem
	 */
	rsSystem.EventBus.$on("app-update", function() {
		setTimeout(function() {
			if(navigator.serviceWorker && navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller.postMessage({
					"action": "update"
				});
				// TODO: Stream-line this for better effect, or give a notification to complete by refreshing
				//    reload doesn't seem to be availabe in the service worker?
				setTimeout(function() {
					location.reload();
				}, 1000);
			} else {
				rsSystem.controls.serviceWorkerFault();
			}
		}, 0);
	});

	/**
	 * 
	 * @event app-update:ignore
	 * @for rsSystem
	 */
	rsSystem.EventBus.$on("app-update:ignore", function() {
		rsSystem.options.suppress_update_warning = true;
		rsSystem.EventBus.$emit("dialog:close");
	});
})();

/**
 * Delete the current and saved session and prompt for login.
 * @event logout
 */
 
/**
 * Release the worker cache and pull new.
 * @event app-update
 */
 
