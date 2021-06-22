/**
 * 
 * @class DnDLocale
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("DnDLocale", {
	"props": {
		"universe": {
			"requried": true,
			"type": Object
		},
		"entity": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		/**
		 * Computed array of entities
		 * @property locale
		 * @type Array | Object
		 */
		"locale": function() {
			var location = this.universe.index.location[this.entity.location],
				party,
				locale = [],
				entity,
				i,
				j;

			// TODO: Type filter on target type
			if(location && location.populace) {
				for(i=0; i<location.populace.length; i++) {
					entity = this.universe.index.entity[location.populace[i]];
					if(entity) {
						locale.uniquely(entity);
					}
				}
			}

			for(i=0; i<this.universe.listing.party.length; i++) {
				party = this.universe.listing.party[i];
				if(party && party.entities && party.entities.indexOf(this.entity.id) !== -1) {
					for(j=0; j<party.entities.length; j++) {
						entity = this.universe.index.entity[party.entities[j]];
						if(entity) {
							locale.uniquely(entity);
						}
					}
				}
			}

			return locale;
		}
	}
});
