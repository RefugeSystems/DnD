/**
 * Merely a documented concept at the moment. This class should not be
 * implemented directly at the moment.
 * @class SelectionBlock
 * @constructor
 */
class SelectionBlock {
	constructor() {
		/**
		 * 
		 * @property name
		 * @type String
		 */
		
		/**
		 * The property that these choices will be added to, usually an
		 * Array on the receiving object.
		 * @property field
		 * @type String
		 */
		
		/**
		 * 
		 * @property limit
		 * @type Integer
		 */

		/**
		 * Key for a process to fill in the available choices handled by
		 * the rsSelectionBlock component.
		 * 
		 * Options:
		 * + Spell - Uses the spell_level property to determine the max level
		 * 		to include.
		 * 
		 * @property fill
		 * @type String
		 */
		
		/**
		 * Array of possible objects to choose
		 * @property choices
		 * @type Array | RSObject
		 */

		/**
		 * Set by components while loading a block.
		 * 
		 * Specifies an additional archetype to include that is not yet part of the entity.
		 * @property _archetype
		 * @type String
		 */

		/**
		 * Controlled by the UIComponent rsSelectionBlock.
		 * 
		 * Set true when this block is finished.
		 * @property _completed
		 * @type Boolean
		 */

		/**
		 * 
		 * @property _selected
		 * @type Array
		 */

		/**
		 * 
		 * @property _tracked
		 * @type Object
		 */
	}


}
