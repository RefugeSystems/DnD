var LogicMonitorAPI = Class.create();
/**
 * 
 * 
 * 
 * @class LogicMonitorAPI
 * @constructor
 */
LogicMonitorAPI.prototype = {
	"type": "LogicMonitorAPI",
	"initialize": function() {
		/**
		 * Used to get the path of a request.
		 * 
		 * Note that the "santaba/rest" portion is hard coded.
		 * @property cleanURL
		 * @type RegExp
		 */
		this.cleanURL = new RegExp("https?://[^/]+/santaba/rest(/.*)");

		/**
		 * Used for decrytping credentials.
		 * @property gcrypt
		 * @type GlideEncrypter
		 */
		this.gcrypt = new GlideEncrypter();

		/**
		 * Items loaded by the request. Null if no request has been made.
		 * @parameter items
		 * @type Array
		 * @default null
		 */
		this.items = null;

		/**
		 * Time to wait between requests in milliseconds.
		 * @parameter delay
		 * @type Integer
		 * @sys_property logic_monitor.wait
		 * @default 1000
		 */
		this.delay = parseInt(gs.getProperty("logic_monitor.wait", 1000));
	},
	/**
	 * Get the API Authorization for the given request.
	 * @method getAPIAuthorization
	 * @param {GlideRecord} request With end point and method data
	 * @return {String} 
	 */
	"getAPIAuthorization": function(request) {
		var authorization,
			data,
			path,
			time,
			verb,
			sig;

		authorization = new GlideRecord("basic_auth_credentials");
		if(!authorization.get(gs.getProperty("logic_monitor.default.credentials"))) {
			throw new Exception("LMAPI: Could not locate credentials");
		}
		// This accounts for the credential stored data not coming back as usable strings
		authorization = JSON.parse(JSON.stringify({
			"key": this.gcrypt.decrypt(authorization.getValue("password")).toString(),
			"id": authorization.getValue("user_name")
		}));
		// 		gs.log("Auth:\n > ID: " + authorization.id + "\n > Key: " + authorization.key);

		path = request.getValue("rest_endpoint").replace(this.cleanURL, "$1");
		verb = request.getValue("http_method").toUpperCase();
		data = request.getValue("content");
		time = Date.now();
		sig = (verb == "GET" || verb == "DELETE") ? verb + time + path : verb + time + data + path;
		// 		gs.log("Parts:\n > Sig: " + sig + "\n > Path: " + path + "\n > Verb: " + verb + "\n > data: " + data + "\n > time: " + time);
		sig = GlideStringUtil.base64Encode(CryptoJS.HmacSHA256(sig, authorization.key));
		return "LMv1 " + authorization.id + ":" + sig + ":" + time;
	},
	/**
	 * Load devices from the API.
	 * @method devices
	 * @param {Object} [filter] Optional
	 * @return {Array} 
	 */
	"devices": function(offset) {
		if(!offset) {
			offset = 0;
		}

		try {
			var name = "GET devices",
				requestRecord = new GlideRecord("sys_rest_message_fn"),
				request = new sn_ws.RESTMessageV2("LogicMonitor", name),
				authorization,
				response,
				status,
				body;

			requestRecord.addQuery("rest_endpoint", request.getEndpoint());
			requestRecord.addQuery("function_name", name);
			requestRecord.query();
			if(!requestRecord.next()) {
				throw new Error("LMAPI: Request function 'GET devices' was not found");
			}

			authorization = this.getAPIAuthorization(requestRecord);
			request.setStringParameterNoEscape("auth", authorization);
			request.setStringParameterNoEscape("offset", offset);
			// 			gs.log("Auth: " + authorization + "\n > " + request.getEndpoint() + "\n > " + requestRecord.getUniqueValue());

			response = request.execute();
			status = response.getStatusCode();
			body = response.getBody();

			if(body) {
				try {
					body = JSON.parse(body);
					return body;
				} catch (exception) {
					gs.log("LMAPI: Body parse failed: " + exception.message + "\n" + body);
					return {};
				}
			}

			return null;
		} catch (ex) {
			gs.log("LMAPI: Request failed: " + ex.message);
		}
	}
};

/**
 * Generate an authorization string based on the passed information, using HmacSHA256 and then
 * Base64 encoding the result with a "LMv1 " prefix, the ID of the authorization key pair, and
 * suffixing a timestamp.
 * 
 * This method is provided as a hook for usage outside of the usual request process here-in.
 * 
 * @example
 * ```
 * request.setParameter("apikey", LogicMonitorAPI.generateAuthorization(auth.id, auth.key, "get", "/santaba/rest/devices"));
 * ```
 * 
 * @method generateAuthorization
 * @param {String} id For the authorizaiton credentials.
 * @param {String} key For the authorizaiton credentials.
 * @param {String} verb For the request, this is forced to uppercase in this method.
 * @param {String} path For the url; (protocol)://(domain)/(path)
 * @param {Integer} [time] Optional Unix EPoch timestamp, defaults to Date.now()
 * @param {String} [data] Optional and only used for requests with data (ie. POST).
 * @returns 
 */
LogicMonitorAPI.generateAuthorization = function(id, key, verb, path, time, data) {
	var sig;
	verb = verb.toUpperCase();
	sig = (verb == "GET" || verb == "DELETE") ? verb + time + path : verb + time + data + path;
	//gs.log("Parts:\n > Sig: " + sig + "\n > Path: " + path + "\n > Verb: " + verb + "\n > data: " + data + "\n > time: " + time);
	sig = GlideStringUtil.base64Encode(CryptoJS.HmacSHA256(sig, key));
	return "LMv1 " + id + ":" + sig + ":" + time;
};
