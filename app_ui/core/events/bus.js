
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
	
	rsSystem.EventBus.$on("app-update", function() {
		setTimeout(function() {
			window.location.reload(true);
		}, 10);
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
 
