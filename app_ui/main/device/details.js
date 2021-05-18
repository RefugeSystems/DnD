
/**
 * 
 * @property device
 * @type Object
 * @module Main
 * @for rsSystem
 */
rsSystem.device = {
	/**
	 * True if the device supports touch
	 * @property touch
	 * @type Boolean
	 */
	"touch": ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch
};
