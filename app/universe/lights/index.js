var TPLSmartDevice = require("tplink-lightbulb");

var scan = TPLSmartDevice.scan();

scan.on("light", function(light) {
	console.log(light);
});

setTimeout(function() {
	console.log("Stop");
	scan.stop();
}, 5000);
