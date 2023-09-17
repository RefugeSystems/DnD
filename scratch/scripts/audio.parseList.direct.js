var reg = /.*?([^./]*).(mp3|wav|ogg)/,
	clean = /_/g,
	toImport = [],
	errors = [],
	build,
	type;

// type = "mus"; // https://refugesystems.net/audio/music/
// type = "eff"; // https://refugesystems.net/audio/effects/
type = "env"; // https://refugesystems.net/audio/environment/
// type = "eve"; // https://refugesystems.net/audio/events/
	
build = function(path) {
    var match = reg.exec(path),
        result = {};

    if(match) {
		result.url = match[0];
		result.description = "";

		switch(type) {
			case "eff":
				result.id = "audio:fx:" + match[1].replace(clean, "");
				result.name = "FX: " + match[1];
				result.category = "category:sound:specialeffect";
				break;
			case "env":
				result.id = "audio:env:" + match[1].replace(clean, "");
				result.name = "Env: " + match[1];
				result.category = "category:environmental";
				result.is_looped = true;
				break;
			case "eve":
				result.id = "audio:notice:" + match[1].replace(clean, "");
				result.name = "Notice: " + match[1];
				result.category = "category:sound:notification";
				break;
			case "mus":
				result.id = "audio:music:" + match[2].replace(clean, "");
				result.name = "Music: " + match[1];
				result.category = "category:sound:music";
				break;
		}

		toImport.push(result);
    } else {
		errors.push("Failed on path: " + path);
    }
};

list.forEach(build);
console.log("Exported JSON:");
console.log(JSON.stringify(toImport, null, 4));
if(errors.length) {
	console.error("Errors Encountered: ", errors);
}