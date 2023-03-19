var reg = /^(https:\/\/refugesystems.net\/audio\/music\/pb\/)([a-z_-]+)\/([0-9]+)_(loop|full)([0-9]+)?_([a-z0-9_-]+)\.(mp3|wav)/,
	clean = /_/g,
	toImport = [],
	errors = [],
	build;
	
build = function(path) {
    var match = reg.exec(path),
        result = {},
		split,
		i;
    if(match) {
		split = match[2].split("_");
		for(i=0; i<split.length; i++) {
			split[i] = split[i][0].toUpperCase() + split[i].substr(1);
		}
		split = split.join(" ");
        result.id = "audio:music:pb:" + match[2].replace(clean, "") + ":" + (match[4]==="full"?"song":"loop" + match[5]);
		result.name = "Music: " + split + " - " + (match[4]==="full"?"Full Song":"Loop " + match[5]);
		result.description = "From: https://www.premiumbeat.com/";
		result.is_looped = true;
		result.category = "category:sound:music";
		result.url = match[0];
		console.log(result);
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