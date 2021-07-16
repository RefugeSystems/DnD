var fs = require("fs"),
	merging = require("./source/knowledge.json"),
	utility = require("./utility.js"),
	exporting = [],
	merged,
	sub,
	id,
	i,
	j;


for(i=0; i<merging.length; i++) {
	merged = merging[i];
	id = merged.id;
	try {
		// console.log("Merging: " + merged.name);
		if(id.startsWith("knowledge:spell:")) {
			continue;
			// if(merged.subject && merged.subject.length === 1 && (merged.subject[0].startsWith("spell") || merged.subject[0].startsWith("ability"))) {
			// 	console.log("Skipping " + id);
			// 	continue;
			// } else {
			// 	console.log("No Skip Spell Knowledge?: ", id);
			// }
		}
		
		if(merged.category !== undefined) {
			merged.category = "category:" + merged.category;
		}

		if(merged.subject instanceof Array) {
			merged.associations = [];
			for(j=0; j<merged.subject.length; j++) {
				sub = merged.subject[j];
				if(sub.startsWith("character") || sub.startsWith("monster") || sub.startsWith("npc") || sub.startsWith("puzzle") || sub.startsWith("animal")) {
					merged.associations.push("entity:" + sub);
				} else if(sub.startsWith("bpc")) {
					merged.associations.replace("bpc", "entity");
				} else if(sub.startsWith("itme") || sub.startsWith("ietm") || sub.startsWith("iemt") || sub.startsWith("potion") || sub.startsWith("shield") || sub.startsWith("ring") || sub.startsWith("enchantment") || sub.startsWith("tiem")) {
					merged.associations.push("item:" + sub);
				} else if(sub.startsWith("story")) {
					merged.associations.push("knowledge:" + sub);
				} else if(sub.startsWith("ability")) {
					merged.associations.push("spell:" + sub);
				} else {
					merged.associations.push(sub);
				}
			}
			merged.associations.sort();
		}
		delete(merged.subject);
		if(merged.from !== undefined) {
			merged.learned_from = merged.from;
		}
		delete(merged.from);

		if(!id.startsWith("knowledge")) {
			console.log("Update knowledge: " + id);
			id = "knowledge:" + id;
		}
		merged.id = id;
		utility.finalize(merged);

		delete(merged.requirement);
		delete(merged._search);
		delete(merged.effects);
		delete(merged.modifiers);
		delete(merged.effects);
		delete(merged.obscured);
		delete(merged.secondary);
		delete(merged.acquired);
		delete(merged.type);
		delete(merged.from);
		delete(merged.effects);
		delete(merged.obscured);
		delete(merged.creator);
		delete(merged.updater);

		if(merged.id.indexOf("test") === -1) {
			exporting.push(merged);
		} else {
			console.log(" [!] Skipped: " + merged.name);
		}
	} catch(e) {
		console.log("Error: " + id + ": ", e);
	}
}

fs.writeFile("_knowledge.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;