var fs = require("fs"),
	upload = require("./merge.gods.js").data
	.concat(require("./merge.proficiencies.js").data)
	.concat(require("./merge.locations.js").data)
	.concat(require("./merge.effects.js").data)
	.concat(require("./merge.spells.js").data)
	.concat(require("./merge.feats.js").data)
	.concat(require("./merge.classes.js").data)
	.concat(require("./merge.archetypes.js").data)
	.concat(require("./merge.item.js").data)
	.concat(require("./merge.race.js").data)
	.concat(require("./merge.knowledge.js").data)
	.concat(require("./merge.character.js").data);
// require("./merge.character.js");
// require("./merge.classes.js");
// require("./merge.effects.js");
// require("./merge.feats.js");
// require("./merge.gods.js");
// require("./merge.item.js");
// require("./merge.locations.js");
// require("./merge.proficiencies.js");
// require("./merge.race.js");
// require("./merge.spells.js");

fs.writeFile("_all.json", JSON.stringify({"import": upload}), () => {});
