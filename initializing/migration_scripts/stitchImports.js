var fs = require("fs"),
	exporting = [],
	importing,
	x;


fs.readdir("../imports/", (err, paths) => {
	if(err) {
		console.log(err);
	} else {
		for(x=0; x<paths.length; x++) {
			if(paths[x].endsWith(".json")) {
				importing = require("../imports/" + paths[x].substring(paths[x].lastIndexOf("/")));
				exporting = exporting.concat(importing.import || importing.export);
			}
		}

		fs.readdir("../exports/", (err, paths) => {
			if(err) {
				console.log(err);
			} else {
				for(x=0; x<paths.length; x++) {
					if(paths[x].endsWith(".json")) {
						importing = require("../exports/" + paths[x].substring(paths[x].lastIndexOf("/")));
						exporting = exporting.concat(importing.import || importing.export);
					}
				}
				
				fs.writeFile("stitched.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
			}
		});
	}
});
