var exp = require("../exports/export.knowledge.json").export,
	fs = require("fs");

var hunt = /\$\{"content":[^"]*?"([^\\,"]+).*\}\$/g,
	html = new RegExp("<span class=\"rs-(darkorange|orange)\">([^<]+)</span>", "g"),
	date = new RegExp("<span class=\"rs-lightblue\">([^<]+)</span>", "g"),
	tags = /\$\{([^\},]+)(,[^\},]+)?(,[^\},]+)?\}\$/g,
    updated = [];
exp.forEach(function(k, i) {
	console.log(" [!] " + i + "/" + exp.length);
    var description = k.description,
		replace,
        match;
    while(match = hunt.exec(k.description)) {
		if(match[0].length < 3) {
			description = description.replace(match[0], match[1]);
		} else if(isNaN(match[0])) {
        	description = description.replace(match[0], "${" + match[1] + "}$");
		} else {
			description = description.replace(match[0], "${@" + match[1] + "}$");
		}
    }
	console.log(" [√] Tags");
	while(match = html.exec(k.description)) {
		description = description.replace(match[0], "${" + match[2] + "}$");
	}
	console.log(" [√] HTML");
	while(match = date.exec(k.description)) {
		description = description.replace(match[0], "${@" + match[1] + "}$");
	}
	console.log(" [√] Dates");
	while(match = tags.exec(k.description)) {
		replace = match[1];
		if(match[2]) {
			if(match[3]) {
				replace += match[3];
			} else {
				replace += ",";
			}
			replace += match[2];
		}
		description = description.replace(match[0], "${" + replace + "}$");
	}
	console.log(" [√] Refactor");
    if(k.description !== description) {
        k.description = description;
        updated.push(k);
    }
});

fs.writeFile("export.json", JSON.stringify(exp, null, "\t"), () => {});
