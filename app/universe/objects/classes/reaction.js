/**
 *
 *
 * @class ux_class.Playlist
 * @extends RSObject
 * @constructor
 */
var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {

	constructor(universe, manager, details) {
		super(universe, manager, details);

		this._eventMap = {};

		/**
		 * Local method that handles translating the occuring event to the Reaction's
		 * processor function.
		 * 
		 * This also allows a specific reference for the Emitter on/off reference.
		 * @method _acknowledgeHandler
		 * @deprecated Universe emit handles this now
		 * @param {Object} eventData 
		 */
		// this._acknowledgeHandler = (eventData) => {
		// 	console.log("Acknowledging - " + this.name);
		// 	if(this.processor) {
		// 		try {
		// 			this.processor(eventData && (eventData.source || eventData.sourceID)?this._universe.get(eventData.source || eventData.sourceID) || null:null, eventData, this._universe, this._universe.utility);
		// 		} catch(err) {
		// 			universe.emit("error", new universe.Anomaly("reaction:handler:process", "Unable to process reaction to event", 50, {"details": this._data, eventData}, err, this));
		// 		}
		// 	}
		// };
	}

	// postFieldUpdate() {
	// 	var event,
	// 		i;

	// 	if(this._previous.processed) {
	// 		for(i=0; i<this._previous.processed.length; i++) {
	// 			event = this._previous.processed[i].replace("occurrence:", "");
	// 			if(this._eventMap[event]) {
	// 				delete(this._eventMap[event]);
	// 			}
	// 		}
	// 	}

	// 	if(this.processed) {
	// 		for(i=0; i<this.processed.length; i++) {
	// 			event = this.processed[i].replace("occurrence:", "");
	// 			if(!this._eventMap[event]) {
	// 				this._eventMap[event] = true;
	// 			}
	// 		}
	// 	}

	// 	if(!this.is_preview && !this.preview) {
	// 		if(this._previous.acknowledge !== this.acknowledge) {
	// 			if(this._previous.acknowledge) {
	// 				this._universe.off(this._previous.acknowledge, this._acknowledgeHandler);
	// 			}
	// 			if(this.acknowledge) {
	// 				this._universe.on(this.acknowledge, this._acknowledgeHandler);
	// 			}
	// 		}
	// 	}
	// }
}

module.exports = Constructor;
