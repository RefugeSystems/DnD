
/**
 * Anchor point to get keyboard events.
 *
 * This additionally handles capturing events to the body to emit
 * or capture several events such as `Escape` and `F1`.
 * @property keyboard
 * @type EventEmitter
 * @module Main
 * @for rsSystem
 */
rsSystem.keyboard = (function() {
	
	var emitter = new EventEmitter();
	
	
	document.onkeyup = function(e) {
		if(rsSystem.debug >= 5) {
			console.log("Key Up: " + e.key);
		} else if(rsSystem.debug >= 10) {
			console.log("Key Up: ", e);
		}
		switch(e.key) {
			case "Escape":
				rsSystem.EventBus.$emit("key:escape");
				break;
		}
	};
	document.onkeydown = function(e) {
		if(rsSystem.debug >= 5) {
			console.log("Key Dn[" + e.code + "]: " + e.key);
		} else if(rsSystem.debug >= 10) {
			console.log("Key Dn: ", e);
		}
		switch(e.key) {
			case "Escape":
				break;
			case "F1":
				console.log("Open Help");
				rsSystem.EventBus.$emit("key:F1");
				e.preventDefault();
				if(typeof(e.stopPropogation) === "function") {
					e.stopPropogation();
				}
				break;
			case "F10":
				rsSystem.EventBus.$emit(rsSystem.object_reference.events.options.type, rsSystem.object_reference.events.options);
				e.preventDefault();
				if(typeof(e.stopPropogation) === "function") {
					e.stopPropogation();
				}
				break;
			default:
				rsSystem.EventBus.$emit("key:" + e.key);
				break;
		}
	};
	
	return emitter;
})();
