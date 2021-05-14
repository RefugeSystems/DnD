
/**
 * General class for replicating event emission properties to have classes
 * act as emitters.
 * @class EventEmitter
 * @constructor
 * @module Library
 */
class EventEmitter {
	constructor() {
		this._listeners = {};
		this._bindedListeners = {};
		this._onceListeners = {};
		this._bound = [];
	}

	get _events() {
		return Object.keys(this._listeners);
	}

	/**
	 *
	 * @method $bounded
	 * @param {Object} [anchor]
	 * @param {Function} [anchor.$emit]
	 */
	$bounded(anchor) {
		if(this._bound.indexOf(anchor) === -1) {
			this._bound.push(anchor);
		}
	};

	/**
	 * Remove the anchor from the event emission
	 * @method $unbounded
	 * @param {Object} [anchor]
	 */
	$unbounded(anchor) {
		var index = this._bound.indexOf(anchor);
		if(index !== -1) {
			this._bound.splice(index, 1);
		}
	}

	/**
	 *
	 * @method $on
	 * @param {String} [event]
	 * @param {Function} listener
	 */
	$on(event, listener, binding) {

		if(listener === undefined) {
			listener = event;
			event = undefined;
		}

		if(typeof listener !== "function") {
			rsSystem.log.error("Listener is not a function: ", listener);
		}

//		console.warn("Listening[" + this.id + "] on " + event + ": " + listener._owningID);

		if(typeof(binding) === "object") {
			this._bindedListeners[event] = this._bindedListeners[event] || [];
			this._bindedListeners[event].push({
				"listener": listener,
				"binding": binding
			});
		} else {
			this._listeners[event] = this._listeners[event] || [];
			if(this._listeners[event].indexOf(listener) === -1) {
				this._listeners[event].push(listener);
			}
		}
	}

	/**
	 *
	 * @method $once
	 * @param {String} [event]
	 * @param {Function} listener
	 */
	$once(event, listener) {
		if(listener === undefined) {
			listener = event;
			event = undefined;
		}
		this._onceListeners[event] = this._onceListeners[event] || [];
		if(this._onceListeners[event].indexOf(listener) === -1) {
			this._onceListeners[event].push(listener);
		}
	}

	/**
	 *
	 * @method $off
	 * @param {String} [event]
	 * @param {Function} listener
	 */
	$off(event, listener, binding) {
		var x;

		if(listener === undefined) {
			listener = event;
			event = undefined;
		}

		this._onceListeners[event] = this._onceListeners[event] || [];
		if( (x = this._onceListeners[event].indexOf(listener)) !== -1) {
//			console.log("Remove Once Listener: " + x);
			this._onceListeners[event].splice(x, 1);
			return true;
		}

		this._listeners[event] = this._listeners[event] || [];
		if( (x = this._listeners[event].indexOf(listener)) !== -1) {
//			console.log("Remove Normal Listener: " + x);
			this._listeners[event].splice(x, 1);
			return true;
		}

		for(x=0; this._bindedListeners[event] && x<this._bindedListeners[event].length; x++) {
			if(this._bindedListeners[event][x].listener === listener) {
//				console.log("Remove Bound Listener: " + x);
				this._bindedListeners[event].splice(x, 1);
				return true;
			}
		}

		return false;
	}

	/**
	 *
	 * @method $emit
	 * @param {String} [event]
	 * @param {Object | String | Number | Boolean} data
	 */
	$emit(event, data) {
		var x, listeners;
		listeners = this._listeners[event];
		// console.log("Emitting[" + event + " from " + this.id + "]: ", listeners, data);
		if(listeners && listeners.length) {
			for(x=0; x<listeners.length; x++) {
				try {
					listeners[x](data);
				} catch(exception) {
					console.log("Emit Failed[" + event + "]: ", listeners[x], exception);
					rsSystem.log.warn(exception);
				}
			}
		}

		listeners = this._bindedListeners[event];
		if(listeners && listeners.length) {
			for(x=0; x<listeners.length; x++) {
				try {
//					console.log("Binded Emission[" + event + "]: ", listeners[x], data);
					listeners[x].listener.bind(listeners[x].binding)(data);
				} catch(exception) {
					rsSystem.log.warn(exception);
				}
			}
		}

		listeners = this._onceListeners[event];
		if(listeners && listeners.length) {
			listeners.forEach((listener) => {
				// Remove "once" listeners being invoking to account for re-emission of the event
				setTimeout(() => {
					try {
						listener(data);
					} catch(exception) {
						rsSystem.log.warn(exception);
					}
				}, 0);
			});
			listeners.splice(0);
		}

		// Needs revised but currently unused
//		data.unshift(event);
//		if(this._bound && this._bound.length) {
//			for(x=0; x<this._bound.length; x++) {
//				try {
//					console.log("Bounded Emission");
//					this._bound[x].$emit.bind(this._bound[x]).apply(this._bound[x].$emit, data);
//				} catch(exception) {
//					rsSystem.log.warn(exception);
//					try {
//						this._bound[x].$emit(event, data[1]);
//					} catch(exception) {
//						rsSystem.log.warn(exception);
//					}
//				}
//			}
//		}
	}
};
