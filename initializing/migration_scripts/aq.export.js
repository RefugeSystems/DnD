var source = rsSystem.lookup().world.indexes.all.listing,
	anchor = document.createElement("a"),
	toExport = [],
	x;

for(x=0; x<source.length; x++) {
	if(!source[x].id.startsWith("modifier")) {
		toExport.push(source[x]._data);
	}
}

$0.appendChild(anchor);
anchor.href = URL.createObjectURL(new Blob([JSON.stringify({"export": toExport}, null, "\t")]));
anchor.download = "dnd_export." + Date.now() + ".json";
anchor.click();

URL.revokeObjectURL(anchor.href);
$0.removeChild(anchor);
