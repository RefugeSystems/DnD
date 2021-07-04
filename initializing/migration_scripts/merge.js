var fs = require("fs"),
	RSObject = require("../../app/storage/rsobject"),
	modifiers = require("./modifiers.json"),
	items = require("./items.json"),
	exporting = [],
	modMap = {},
	rename,
	remap,
	item,
	keys,
	mod,
	i,
	j,
	k;

remap = function(object) {
	if(object) {
		var keys = Object.keys(object),
			i;

		for(i=0; i<keys.length; i++) {
			if(rename[keys[i]]) {
				object[rename[keys[i]]] = object[keys[i]];
				delete(object[keys[i]]);
			}
		}
	}
};

rename = {
	"slashing": "damage_type:slashing",
	"piercing": "damage_type:piercing",
	"crushing": "damage_type:crushing",
	"bludgeoning": "damage_type:bludgeoning",
	"fire": "damage_type:fire",
	"cold": "damage_type:cold",
	"acid": "damage_type:acid",
	"holy": "damage_type:holy",
	"lightning": "damage_type:lightning",
	"thunder": "damage_type:thunder",
	"heal": "damage_type:heal",
	"poison": "damage_type:poison",
	"force": "damage_type:force",
	"necrotic": "damage_type:necrotic",
	"psychic": "damage_type:psychic",
	"chromatic": "damage_type:chromatic",
	"radiant": "damage_type:radiant",
	"sonic": "damage_type:sonic"
};

for(i=0; i<modifiers.length; i++) {
	modMap[modifiers[i].id] = modifiers[i];
}

for(i=0; i<items.length; i++) {
	item = items[i];
	mod = null;
	try {
		console.log("Item: " + item.name);
		if(item.modifiers) {
			for(j=0; j<item.modifiers.length; j++) {
				mod = modMap[item.modifiers[j]];
				if(mod) {
					item = RSObject.addValues(item, mod);
				} else {
					console.log("Missing Modifier: " + item.modifiers[j]);
				}
			}
		}
		delete(item.modifiers);
		delete(item.requirement);
		delete(item.created);
		delete(item.creator);
		delete(item.updated);
		delete(item.updater);

		if(item.template !== undefined) {
			item.is_template = item.template;
		}
		if(item.instanceOf) {
			item.parent = item.instanceOf;
			delete(item.instanceOf);
		}
		if(item.attuned !== undefined) {
			item.attunes = item.attuned;
		}
		if(item.attunedTo !== undefined) {
			item.attuned = item.attunedTo;
		}
		if(item.damage_type) {
			item.damage_type = "damage_type:" + item.damageType;
		}
		item.range_minimum = item.innerRange;
		item.range_maximum = item.outerRange;
		item.range_normal = item.range;
		item.spell_slots = item.spellSlots;
		delete(item.spellSlots);

		if(item.slotType) {
			item.needs = {};
			item.needs["slot:" + item.slotType] = 1;
		}

		keys = Object.keys(item);
		for(j=0; j<keys.length; j++) {
			switch(keys[j]) {
				case "attribute":
					item.stat = item[keys[j]];
					delete(item[keys[j]]);
					break;
				case "damage":
					remap(item[keys[j]]);
					break;
				case "reduction":
					item.resist = item[keys[j]];
					delete(item.reduction);
					remap(item.reduction);
					break;
			}
		}

		// if(item.name && item.name.indexOf("deprecated") === -1) {
			exporting.push(item);
		// }
	} catch(e) {
		console.log("Error: " + item.id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("merged.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
