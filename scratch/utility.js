var SAIUtility = Class.create();
/**
 * 
 * @class SAIUtility
 * @constructor
 */
(function() {
	/**
	 * Used to determine if an imported value should be considered true or false.
	 * @property booleanTrue
	 * @type RegExp
	 * @private
	 * @static
	 */
	var booleanTrue = new RegExp("^(yes|true|y|1|active)$", "i");
	/**
	 * Used to find numeric values, such as for currency, in a string.
	 * @property parseNumeric
	 * @type RegExp
	 * @private
	 * @static
	 */
	var parseNumeric = new RegExp("([0-9,.]+)");
	/**
	 * Flag to print key information for debugging/tuning.
	 * @property debugging
	 * @type Boolean
	 * @private
	 * @static
	 */
	var debugging = booleanTrue.test(gs.getProperty("saiutility.debugging", false));

	SAIUtility.prototype = {
		"type": "SAIUtility",
		"initialize": function() {}
	};

	/**
	 * Flag to print key information for debugging/tuning.
	 * @method setDebugging
	 * @static
	 * @param {Boolean} state To set for debugging. 
	 * @return {Boolean} The resulting debugging state.
	 */
	SAIUtility.setDebugging = function(state) {
		if(state !== undefined) {
			gs.setProperty("saiutility.debugging", !!state);
			debugging = state;
		}
		return debugging;
	};

	/**
	 * Get the current debugging state.
	 * @method getDebugging
	 * @static
	 * @return {Boolean} The current debugging state.
	 */
	SAIUtility.getDebugging = function() {
		return debugging;
	};

	/**
	 * 
	 * @method mapTransform
	 * @static
	 * @example ```
	 * 	(function transformRow(source, target, map, log, isUpdate) {
	 * 		SAIUtility.mapTransform(source, target, SAIUtility.MAPS.company, SAIUtility.KEYS.company);
	 * 	})(source, target, map, log, action==="update");
	 * ```
	 * @param {GlideRecord} source 
	 * @param {GlideRecord} target 
	 * @param {Object} [map] Optional object mapping field names from the source to
	 * 		the specified field on the target table.
	 * @param {Array} [keys] Optional array containing the fields from `map` to use
	 * 		in mapping.
	 * @param {Object} [types]
	 * @param {Object} [rewrites]
	 */
	SAIUtility.mapTransform = function(source, target, map, keys, types, rewrites) {
		var fields = Object.keys(source),
			i;

		for(i = 0; i < fields.length; i++) {
			if(!fields[i].startsWith("sys_")) {
				SAIUtility.setFieldValue(fields[i], source, target);
			}
		}

		if(map) {
			if(!keys) {
				keys = Object.keys(map);
			}
			for(i = 0; i < keys.length; i++) {
				SAIUtility.setFieldValue(keys[i], source, target, map[keys[i]], types?types[keys[i]]:undefined, rewrites?rewrites[keys[i]]:undefined);
			}
		}
	};

	/**
	 * 
	 * @method setFieldValue
	 * @static
	 * @param {String} fieldTo which the value shoould be written. If `from` is omitted, they are assumed
	 * 		to be the same.
	 * @param {GlideRecord} source 
	 * @param {GlideRecord} target 
	 * @param {String | Array} [from] Optional field to map where the value is coming from. Used when
	 * 		the value doesn't use fields of the same name. Additionally allows Arrays to speficy
	 * 		how to join multiple values
	 * @param {String} [joint] For when an Array is used in from, specifies the string with which to
	 * 		join the found values. Defaults to new line "\n".
	 * @param {String} [type]
	 * @param {Object} [rewrites]
	 */
	SAIUtility.setFieldValue = function(field, source, target, from, joint, type, rewrites) {
		joint = joint || "\n";
		var original,
			value,
			lookup,
			parsed,
			table,
			part,
			i;

		from = from || field;
		if(from instanceof Array) {
			original = [];
			for(i = 0; i < from.length; i++) {
				part = source[from[i].trim()];
				if(part !== undefined && part !== null && part !== "") {
					original.push(part);
				}
			}
			value = original.join(joint).trim();
		} else if(typeof(from) === "object") {
			switch(from.operation) {
				case "match":
					original = source[from.field];
					parsed = from.regex.exec(original);
					value = [];
					for(i=0; i<from.assemble.length; i++) {
						value.push(parsed[from.assemble[i]]);
					}
					value = value.join(from.joint || "");
					break;
				default:
					original = value = source[from.toString()];
			}
		} else {
			if(typeof(from) !== "string") {
				from = from.toString();
			}
			from = from.trim();
			original = value = source[from];
			if(value && typeof(value.trim) === "function") {
				value = value.trim();
			}
		}

		if(value !== undefined && value !== null && (!(target instanceof GlideRecord) /* Support loading an Object */ || target.isValidField(field))) {
			if(!type) {
				type = target.getElement(field).getED().getInternalType();
			}
			type = type + ""; // Because ServiceNow doesn't handle strings "correctly" (It's an object without this and switch doesn't work)
			switch (type) {
				case "glide_list":
					table = target.getElement(field).getED().getReference();
					if(original instanceof Array) {
						value = [];
						for(i = 0; i < original.length; i++) {
							lookup = new GlideRecord(table);
							if(lookup.get(original[i])) {
								value.push(lookup.getUniqueValue());
							} else {
								value.push(original[i]);
							}
						}
						target[field] = value.join(",");
					} else {
						target[field] = value;
					}
					break;
				case "reference":
					table = target.getElement(field).getED().getReference();
					lookup = new GlideRecord(table);
					if(lookup.get(value)) {
						target[field] = lookup.getUniqueValue();
					} else {
						target[field] = value;
					}
					break;
				case "currency":
					parsed = parseNumeric.exec(value);
					if(parsed) {
						part = value.replace(parsed, "").trim();
						parsed = parseFloat(parsed);
						lookup = new GlideRecord("fx_currency");
						lookup.addQuery("symbol", part);
						lookup.addActiveQuery();
						lookup.query();
						if(lookup.next()) {
							part = lookup.getValue("code");
						} else {
							// This is separated to give priority to Symbol matches in the case
							// that there is a common string between code and symbol
							lookup = new GlideRecord("fx_currency");
							lookup.addQuery("code", part);
							lookup.addActiveQuery();
							lookup.query();
							if(lookup.next()) {
								part = lookup.getValue("code");
							} else {
								part = "USD";
							}
						}
						target[field] = part + ";" + parsed;
					} else {
						target[field] = value;
					}
					break;
				case "boolean":
					target[field] = booleanTrue.test(value);
					break;
				default: // Objects will always have a null type and will rely on this default
					if(rewrites) {
						lookup = Object.keys(rewrites);
						for(i = 0; i < lookup.length; i++) {
							if(rewrites[lookup[i]].test(value)) {
								value = lookup[i];
							}
						}
					}
					target[field] = value;
			}
		}
	};

	/**
	 * 
	 * @method matchCompany
	 * @static
	 * @param {GlideRecord | Object} source 
	 * @param {Object} map 
	 * @param {Object} [keys]
	 * @param {Array} [matchKeys] Override the default fields used. These should all be
	 * 		string like values on which an edit distance can be assessed. See
	 * 		`SAIUtility.editDistance`.
	 * @returns {GlideRecord} For the matched Company in the `customer_accounts` table
	 * 		or `null` if no decent match was found.
	 */
	SAIUtility.matchCompany = function(source, map, keys, matchKeys) {
		var company,
			compare,
			record,
			lookup,
			ranked,
			match,
			field,
			value,
			rank,
			c,
			v,
			i,
			j,
			k;

		// Establish general base data
		// Investigate: Computational saving as the current map in a non-match state has to
		//		essentially build this object twice.
		SAIUtility.mapTransform(source, company = {}, map, keys);
		// if(source instanceof GlideRecord) {
		// 	SAIUtility.mapTransform(source, company = {}, map, keys);
		// } else {
		// 	company = source;
		// }

		// Try Quick Methods First
		lookup = new GlideRecord("customer_account");
		lookup.addActiveQuery();
		lookup.addQuery("name", company.name);
		// lookup.addQuery("u_seen_names", "CONTAINS", company.name) // Too easy to wrongly match by substring here
		// 	.addOrCondition("name", company.name);
		lookup.query();
		if(lookup.next()) {
			return lookup;
		}

		if(debugging) {
			gs.info("Matching[" + company.name + "]: " + JSON.stringify(company, null, 4));
		}

		// No Match Found: Scan accounts and form a measured match
		matchKeys = matchKeys || DEFAULT_MATCH_KEYS_COMPANY;
		ranked = [];
		lookup = new GlideRecord("customer_account");
		lookup.addActiveQuery();
		lookup.query();
		while(lookup.next()) {
			// Prep Rank Object
			rank = {};
			if(debugging) {
				// Save readable identifying information and prep an object for reviewing matches
				rank.name = lookup.getValue("name");
				rank.link = SAIUtility.linkRecord(lookup);
				rank.matched = {};
			}
			rank.sys_id = lookup.getUniqueValue();
			rank.table = lookup.getTableName(); // Future prep for possible multi-table matching
			rank.distance = 0; // Number of changes needed
			rank.length = 0; // "Amount" of string compared
			rank.points = 0; // Number of fields compared

			// Build match measurement
			for(i = 0; i < matchKeys.length; i++) {
				field = matchKeys[i];
				value = company[field];
				compare = lookup.getValue(field);
				if(!gs.nil(value) && !gs.nil(compare)) {
					match = SAIUtility.editDistance(value, compare);
					if(debugging) {
						// Store for posterity review
						rank.matched[field] = match;
					}
					rank.distance += match.distance;
					rank.length += match.size;
					rank.points++;
					c = compare.toLowerCase();
					v = value.toLowerCase();
					if(c.indexOf(v) !== -1 || v.indexOf(c) !== -1) {
						rank.points++;
					}
				}
			}

			// Perform complex point checks (Essentially just Addess for now)
			// These manifest as 0 distance point matches based on loose checking that seems sure enough
			// 		in combination with other factors and involve more complex data considerations than
			// 		are generalized at this time.
			// TODO: Compare Address
			//		Currently omitted as a general point test for it may be enough, however the expected
			//		distance to length ratio makes this less likely as it's ratio is expected to be much
			//		worse compared to other fields. A weighting may solve this but address is a fairly
			//		good check when compared well.

			// Store our running ratio for this rank to 2 decimal points; This is pretty arbitrary
			if(rank.points === 0) {
				rank.ratio = 1;
			} else {
				rank.ratio = rank.distance / (rank.length * rank.points); // Used to generalize the "matchness"; Lower is better
			}
			// Only really for readability, remove on release
			rank.ratio = parseFloat(rank.ratio.toFixed(2));

			// Store ranking and trim as needed for memeory use
			if(rank.ratio < RANK_ACCEPT_RATIO && rank.points > RANK_ACCEPT_POINTS) {
				ranked.push(rank);
				if(ranked.length > RANK_TRIM_AT && !debugging) {
					// We want to save more than the top as the lower distances may only have a few touch
					//		points, making some with a slightly higher distance more likely due to a higher
					//		number of touch points.
					ranked.sort(sortRanked);
					ranked.splice(RANK_TRIM_TO);
				}
			} else {
				// For Debugging
				if(lookup.getValue("name").indexOf("AirTran") !== -1) {
					gs.info("Rejecting[" + rank.name + " <> " + company.name + "]: " + JSON.stringify(rank, null, 4));
				}
			}
		}

		if(debugging) {
			gs.info("Ranked[" + company.name + "]: " + JSON.stringify(ranked, null, 4));
		}

		if(ranked.length === 0) {
			return null;
		}

		// Return best match
		ranked.sort(sortRanked);
		if(debugging) {
			gs.info("Matched[" + company.name + "]: " + JSON.stringify(ranked[0], null, 4));
		}
		record = new GlideRecord(ranked[0].table);
		record.get(ranked[0].sys_id);
		return record;
	};

	/**
	 * 
	 * @method updateSeenNames
	 * @param {String} name
	 * @param {GlideRecord} record 
	 */
	SAIUtility.updateSeenNames = function(name, record) {
		record.setValue("u_seen_names", record.getValue("u_seen_names") + name);
		record.update();
	};

	var RANK_ACCEPT_RATIO = .05,
		RANK_ACCEPT_POINTS = 3,
		RANK_TRIM_AT = 10,
		RANK_TRIM_TO = 5,
		DEFAULT_MATCH_KEYS_COMPANY = [
			"name",
			"website",
			"phone",
			"street",
			"city",
			"state",
			"zip",
			"country"
		];

	/**
	 * Used by matching methods to rank their findings based on the data used.
	 * @method sortRanked
	 * @static
	 * @param {Object} a 
	 * @param {Object} b 
	 * @return {Integer}
	 */
	var sortRanked = function(a, b) {
		// More points and Higher Ratio to the front
		if(a.points > b.points && a.ratio < b.ratio) {
			return -1;
		} else if(a.points < b.points && a.ratio > b.ratio) {
			return 1;
			// Lower Ratio is better (Smaller difference)
		} else if(a.ratio < b.ratio) {
			return -1;
		} else if(a.ratio > b.ratio) {
			return 1;
			// More touch points are more valuable
		} else if(a.points < b.points) {
			return 1;
		} else if(a.points > b.points) {
			return -1;
			// Lower distance is a better match
		} else if(a.distance < b.distance) {
			return -1;
		} else if(a.distance > b.distance) {
			return 1;
		}
		// Equal Rank
		return 0;
	};

	/**
	 * 
	 * @method createRecord
	 * @static
	 * @param {String} table
	 * @param {Object} data 
	 */
	SAIUtility.createRecord = function(table, data) {
		var company = new GlideRecord(table),
			keys = Object.keys(data),
			i;

		company.initialize();
		for(i = 0; i < keys.length; i++) {
			if(company.isValidField(keys[i])) {
				company.setValue(keys[i], data[keys[i]]);
			}
		}

		company.insert();
	};

	/**
	 * 
	 * @method editDistance
	 * @static
	 * @modifiedBy Alexander Anderson
	 * @author tad-lispy
	 * @see https://github.com/tad-lispy/node-damerau-levenshtein
	 * @param {String} compA 
	 * @param {String} compB 
	 * @returns {Object} With a `distance` Integer property for the number of transpositions
	 *		or changes needed and a `size` property for the length of the longest string for
	 *		comparing amount matched.
	 */
	SAIUtility.editDistance = function(compA, compB) {
		if(typeof(compA) !== "string") {
			compA = compA.toString();
		}
		if(typeof(compB) !== "string") {
			compB = compB.toString();
		}

		var aLength = compA.length,
			bLength = compB.length,
			result = {},
			matrix = [],
			size,
			cost,
			min,
			a_i,
			b_j,
			i,
			j,
			t;

		result.size = (bLength > aLength ? bLength : aLength);
		size = result.size + 1;
		for(i = 0; i < size; i++) {
			matrix[i] = new Array(size);
		}
		for(i = 0; i < size; i++) {
			matrix[0][i] = i;
		}

		if(aLength === 0) {
			result.distance = bLength;
			return result;
		}
		if(bLength === 0) {
			result.distance = aLength;
			return result;
		}

		// Calculate matrix.
		for(i = 1; i <= aLength; ++i) {
			a_i = compA[i - 1];

			// Step 4
			for(j = 1; j <= bLength; ++j) {
				// Check the jagged ld total so far
				if(i === j && matrix[i][j] > 4) {
					result.distance = aLength;
					return result;
				}

				b_j = compB[j - 1];
				cost = (a_i === b_j) ? 0 : 1; // Step 5
				// Calculate the minimum (much faster than Math.min(...)).
				min = matrix[i - 1][j] + 1; // Deletion.
				if((t = matrix[i][j - 1] + 1) < min) {
					min = t; // Insertion.
				}
				if((t = matrix[i - 1][j - 1] + cost) < min) {
					min = t; // Substitution.
				}

				// Update matrix.
				matrix[i][j] = (i > 1 && j > 1 && a_i === compB[j - 2] && compA[i - 2] === b_j && (t = matrix[i - 2][j - 2] + cost) < min) ? t : min; // Transposition.
			}
		}

		result.distance = matrix[aLength][bLength];
		return result;
	};

	/**
	 * 
	 * @method linkRecord
	 * @param {GlideRecord} record 
	 * @returns {String} The URL directly to the record.
	 */
	SAIUtility.linkRecord = function(record) {
		return "https://" + gs.getProperty("instance_name") + ".service-now.com/" + record.getTableName() + ".do?sys_id=" + record.getUniqueValue();
	};

	/**
	 * Maps field names from the source table to the field to load to in the target
	 * table.
	 * @property MAPS
	 * @type Object
	 * @static
	 */
	SAIUtility.MAPS = {
		"company": {
			// "u_international": "u_international",
			// "u_business_unit": "u_business_unit",
			// "u_property_americas": "u_property_americas",
			"u_us_tpa_casualty": "u_us_tpa___casualty",
			"u_us_tpa_disability": "u_us_tpa___disability",
			"u_brand_solutions": "u_brnd_solutions",
			"active": "u_status",
			"u_owners": "u_owner",
			"revenue_per_year": "u_annual_revenue_to_sedgwick",
			"u_aliases": "u_dba_aka_fka_names",
			"street": ["u_address_1__street_1", "u_address_1__street_2", "u_address_1__street_3", "u_address__1_street_4"],
			"city": "u_address_1__city",
			"phone": "u_main_phone",
			"parent": "u_parent_company",
			"state": "u_state_province",
			"zip": "u_address_1__zip_postal_code",
			"country": "u_address_1__country_region",
			"u_seen_names": "u_company_name"
		},
		"sai_company": {
			"website": "u_website",
			"country": "u_company_country",
			"phone": "u_company_phone_1", // TODO: We have 2 phone numbers in Seamless AI export data, determine how to check both
			"street": "u_company_street_1",
			"state": "u_company_state",
			"city": "u_company_city",
			"name": "u_company_name"
		},
		"sai_contact": {
			"first_name": {
				"field": "u_contact_full_name",
				"operation": "match",
				"regex": new RegExp("^([a-z0-9_-]+)\\s.*?\\s?([a-z0-9_-]+)$", "i"),
				"assemble": [1]
			},
			"last_name": {
				"field": "u_contact_full_name",
				"operation": "match",
				"regex": new RegExp("^([a-z0-9_-]+)\\s.*?\\s?([a-z0-9_-]+)$", "i"),
				"assemble": [2]
			},
			"city": "u_contact_city",
			"email": "u_email_1",
			"phone": "u_contact_phone_1",
			"u_phone_company": "u_company_phone_1",
			"u_phone_secondary": "u_contact_phone_2"
		}
	};

	/**
	 * Maps key names from MAPS to arrays with the object fields from that key.
	 * @property KEYS
	 * @type Object
	 * @static
	 */
	SAIUtility.KEYS = {};
	SAIUtility.KEYS.company = Object.keys(SAIUtility.MAPS.company);
	SAIUtility.KEYS.sai_company = Object.keys(SAIUtility.MAPS.sai_company);
	SAIUtility.KEYS.sai_contact = Object.keys(SAIUtility.MAPS.sai_contact);

	/**
	 * Maps key names from MAPS to objects that describe the string to use to
	 * join together array values where necessary. The default join value is a
	 * new line character; "\n".
	 * @property KEYS
	 * @type Object
	 * @static
	 */
	SAIUtility.JOINTS = {};
	SAIUtility.JOINTS.company = {};
	SAIUtility.JOINTS.sai_company = {};
	SAIUtility.JOINTS.sai_contact = {};

	/**
	 * Maps key names from MAPS to Objects that map field names to types to override
	 * the type detection from the element descriptor. This is to cover a short coming
	 * in the element descriptor where inherited fields don't have descriptors on the
	 * current table, so detecting that an inherited field like `active` is a boolean
	 * for appropriate checking comes back as `null` instead of the expected `boolean`
	 * value.
	 * 
	 * As a short hand to avoid more complex inheritance searching through the tables,
	 * this property allows a simple override, which can also be used to replace the
	 * behavior in cases where desired, should one exist.
	 * @property KEYS
	 * @type Object
	 * @static
	 */
	SAIUtility.TYPES = {};
	SAIUtility.TYPES.company = {
		"active": "boolean"
	};
	SAIUtility.TYPES.sai_company = {};
	SAIUtility.TYPES.sai_contact = {};

	/**
	 * Maps key names from MAPS to Objects with values mapped to regular expressions
	 * that when matched shoould result in a value for that field being rewritten
	 * to the key value.
	 * 
	 * For example, `company.country["United States"] = new RegExp("USA")` would cause
	 * a country value of "USA" to be rewritten to "United States" when encountered in
	 * the `setFieldValue` method.
	 * @property KEYS
	 * @type Object
	 * @static
	 */
	SAIUtility.REWRITE = {};
	SAIUtility.REWRITE.company = {
		"country": {
			"United States": new RegExp("^U.?S.?A?$", "i"),
			"United Kingdon": new RegExp("^U.?K$", "i"),
			"Austria": new RegExp("^(AT|AUT)$", "i")
		}
	};
	SAIUtility.REWRITE.sai_company = {};
	SAIUtility.REWRITE.sai_contact = {};
})();