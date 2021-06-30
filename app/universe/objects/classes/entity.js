/**
 *
 *
 * @class ux_class.Entity
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
	}
	
	postFieldUpdate() {
		// console.log(" ? Build Matrix - ", this._knowledge_matrix_length, this.knowledges?this.knowledges.length:"null");
		var knowledge,
			matrix,
			i,
			j;

		if( (this.knowledges && this.knowledges.length))  {//&& (!this.knowledge_matrix || this._knowledge_matrix_length !== this.knowledges.length)) {
			// console.log(" > Build Matrix");
			this.knowledge_matrix = {}; // Make new to account for loss of knowledge; TODO: Smooth knowledge acquisition to build matrix rather than constantly recompute
			this._knowledge_matrix_length = this.knowledges.length; // Cache variable to reduce unneeded rebuilds
			for(i=0; i<this.knowledges.length; i++) {
				knowledge = this._universe.get(this.knowledges[i]);
				// console.log(" > Check Knowledge - " + this.knowledges[i], knowledge.associations);
				if(knowledge && knowledge.associations && knowledge.associations.length) {
					// console.log(" > Build Matrixes - " + knowledge.id);
					for(j=0; j<knowledge.associations.length; j++) {
						// console.log(" > Build Matrix - " + knowledge.associations[j]);
						matrix = this.knowledge_matrix[knowledge.associations[j]];
						if(!matrix) {
							matrix = this.knowledge_matrix[knowledge.associations[j]] = []; // Learning about a new object
						}
						matrix.push(knowledge.id); // Reason we know about this
					}
				}
			}
		}
	}
}

module.exports = Constructor;
