rsSystem.EventBus.$on("spell:transform", function(event) {
	var universe = rsSystem.universe,
		caster = event.entity,
		spell = event.channel,
		limit = spell.score_limit,
		details = {},
		options,
		entity,
		types,
		i;

	if(typeof(spell) === "string") {
		spell = universe.index.spell[spell];
	}

	console.log("Transform? ", event, spell);

	if(spell) {
		if(spell.targets) {
			types = spell.targets;
		} else {
			types = [spell.type];
		}

		details.title = "Available Transformations";
		details.component = "dndDialogList";
		details.entity = caster.id;
		details.sections = [];
		details.clear = true;
		details.related = {};
		details.cards = {
			"unknown": {
				"name": "Unknown",
				"icon": "fa-solid fa-question",
				"description": "Unknown Score"
			}
		};
		details.data = {
			"unknown": []
		};
		details.activate = (section, entity) => {
			rsSystem.EventBus.$emit("dialog-dismiss");
			universe.send("character:transform", {
				"character": caster.id,
				"transform": entity.id
			});
		};
		for(i=0; i<universe.listing.entity.length; i++) {
			entity = universe.listing.entity[i];
			if( (!types.length || (entity.types && entity.types.hasCommon(types))) &&
					(!limit || (typeof(entity.score) === "number" && entity.score < limit)) &&
					(!entity.loyal_to || entity.loyal_to.length === 0) &&
					rsSystem.utility.isKnownBy(caster, entity) &&
					!entity.is_concealed &&
					!entity.is_preview &&
					!entity.is_obscured &&
					!entity.obscured &&
					!entity.character &&
					!entity.is_copy) {
				if(typeof(entity.score) === "number") {
					options = details.data[entity.score];
					if(!options) {
						options = details.data[entity.score] = [];
						details.sections.push(entity.score);
						details.cards[entity.score] = {
							"name": "Score " + entity.score
						};
					}
				} else {
					options = details.data.unknown;
				}
				options.push(entity);
			}
		}

		details.sections.sort();
		if(details.data.unknown.length) {
			details.sections.push("unknown");
		}
		rsSystem.EventBus.$emit("dialog-open", details);
	}
});
