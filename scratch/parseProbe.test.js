(function() {

	var parsExp = new RegExp("(Interface:[^\\$]+)(.*?)\\$\\$", "gi"), //partsExp
		ipv4Exp = new RegExp("IP_Addr: ([0-9\\.]+).*?NETWRK: ([0-9\\.]+)", "gi"), //IPv4regex
		collapsed = new RegExp("\\r?\\s*?\\n", "g"),
		spaced = new RegExp("\\s+", "g"),
		clean = new RegExp("&#13;", "g"),
		macExp = new RegExp("Addr: (([a-f0-9]{2}[:_-]?){6})", "i"),
		ipv6Exp = null,
		gr = new GlideRecord("ecc_queue"),
		macFunc,
		string,
		res,
		ip;

	macFunc = function(text, adapter, networkInfo) {
		var mac = macExp.exec(text);
		if(mac) {
			return mac[1];
		}
		return null;
	};

	gr.get("f3f1c2891b4d74504b2d8407ec4bcb01");
	string = string.substring(string.indexOf("<output>") + 8);
	string = string.substring(0, string.indexOf("</output>"));
	string = gr.getValue("payload");

	string = string.replace(clean, "");
	string = string.replace(collapsed, "$");
	string = string.replace(spaced, " ");
	// gs.log(string);

	while(res = parsExp.exec(string)) {
		gs.log("Res: " + JSON.stringify(res, null, 4));
		while(ip = ipv4Exp.exec(res[2])) {
			gs.log(" > " + ip[1]);
		}
		gs.log(" ? " + macFunc(res[0]));
	}
})();