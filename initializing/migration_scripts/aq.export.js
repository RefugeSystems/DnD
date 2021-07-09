var source = rsSystem.lookup().world.indexes.all.listing,
	anchor = document.createElement("a"),
	toExport = [],
	x;

for(x=0; x<source.length; x++) {
	if(!source[x].id.startsWith("modifier")) {
		toExport.push(source[x]);
	}
}

$0.appendChild(anchor);
anchor.href = URL.createObjectURL(new Blob([JSON.stringify({"export": toExport}, null, "\t")]));
anchor.download = "dnd_export." + Date.now() + ".json";
anchor.click();

URL.revokeObjectURL(anchor.href);
$0.removeChild(anchor);

////////////////////////////////////////
// CHARACTER
////////////////////////////////////////

var source = rsSystem.lookup().world.indexes.character.listing,
	anchor = document.createElement("a"),
	toExport = [],
    exp,
	x;

exp = new RegExp("[0-9]");

for(x=0; x<source.length; x++) {
	if(!source[x].id.startsWith("modifier") && source[x].name && !exp.test(source[x].name)) {
		toExport.push(source[x]);
	}
}

$0.appendChild(anchor);
anchor.href = URL.createObjectURL(new Blob([JSON.stringify({"export": toExport}, null, "\t")]));
anchor.download = "dnd_export." + Date.now() + ".json";
anchor.click();

URL.revokeObjectURL(anchor.href);
$0.removeChild(anchor);

////////////////////////////////////////
// LOCATION
////////////////////////////////////////

var source = rsSystem.lookup().world.indexes.location.listing,
	anchor = document.createElement("a"),
	toExport = [],
    exp,
	x;

exp = new RegExp("[0-9]");

for(x=0; x<source.length; x++) {
	if(!source[x].id.startsWith("modifier") && source[x].name && !exp.test(source[x].name)) {
		toExport.push(source[x]);
	}
}

$0.appendChild(anchor);
anchor.href = URL.createObjectURL(new Blob([JSON.stringify({"export": toExport}, null, "\t")]));
anchor.download = "dnd_export." + Date.now() + ".json";
anchor.click();

URL.revokeObjectURL(anchor.href);
$0.removeChild(anchor);

////////////////////////////////////////
// ITEM
////////////////////////////////////////