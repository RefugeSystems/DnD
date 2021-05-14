
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
})();
