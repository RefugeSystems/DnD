new ProbePostProcessor({
    "process": function() {
		gs.info("AA:STS: Start");
        if (JSUtil.nil(output))
            return;
		gs.info("AA:STS: Processing");
		var idutil = new IDSensorUtil(),
            partsExp = new RegExp("(Interface:[^\\$]+)(.*?)\\$\\$", "gi"),
            ipv4Exp = new RegExp("IP_Addr: ([0-9\\.]+).*?NETWRK: ([0-9\\.]+)", "gi"),
			collapsed = new RegExp("\\r?\\s*?\\n", "g"),
			spaced = new RegExp("\\s+", "g"),
			clean = new RegExp("&#13;", "g"),
			formatted;
			
		formatted = output.replace(clean, "").replace(collapsed, "$").replace(spaced, " ");

        related_data.adapters = idutil.getAdapters(formatted, null, partsExp, ipv4Exp, null, this.getMacAddress);
		gs.info("AA:STS:Test: Adapters");
		gs.info("AA:STS:Test: " + JSON.stringify(related_data.adapters));
		gs.info("AA:STS:Test: End Adapters");

        related_data.default_gateway = idutil.getAdapterGateways(output, related_data.adapters, null);
		
		gs.info('AG Test OpenVMS Network Output is '+ output.toString());
	},
	"getMacAddress": function(output, adapter, ip) {
		var exp = new RegExp("Addr: (([a-f0-9]{2}[:_-]?){6})", "i"),
			find;
		
		if(find = exp.exec(output)) {
			return find[1];
		}
		
		exp = new RegExp("IP_Addr: ([0-9\\.]+).*?NETWRK: ([0-9\\.]+)", "gi");
		if(find = exp.exec(output)) {
			return find[1];
		}
		
		return null;
// 	},
    /**
     * Runs the probe instance
     */
//     "process": function() {
// 		gs.info("AA:STS: Start");
//         if (JSUtil.nil(output))
//             return;

//         var idutil = new IDSensorUtil();
//         skipStr = null,
//             parsExp = new RegExp("^(\\S+:)\\s+((.*\\n\\t.*){0,})", "gm"), //partsExp
//             ipv4Exp = new RegExp("IP_Addr: (\\S+)\\s+IP_Addr: (\\S+)", "g"), //IPv4regex
//             ipv6Exp = null; //new RegExp("inet6 (\\S+)\\/(\\d+)", "ig"); //Alpha doesn't send IPv6 data, so we're not using this.

//         related_data.adapters = idutil.getAdapters(output, skipStr, parsExp, ipv4Exp, ipv6Exp, this.getMacAddress);


//         related_data.default_gateway = idutil.getAdapterGateways(output, related_data.adapters, null);
// 		gs.info("AA:STS: Done");
//     },
//     "getMacAddress": function(output, adapterName, ipAddress) {

//         var macRegex = new RegExp("^" + adapterName + ".*? Ethernet_Addr: (\\S+)", "mg");
//         var macMatch = macRegex.exec(output);
//         if (macMatch)
//             return macMatch[1];

//         macRegex = new RegExp("^" + adapterName + "\\s+" + ipAddress + "\\s+.*?(\\S+)$", "mg");
//         macMatch = macRegex.exec(output);
//         if (macMatch)
//             return macMatch[1];

//         return "";

    }
});