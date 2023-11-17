

/**
 *
 * @class RSShowdown
 * @constructor
 * @module Common
 * @see Showdown: https://www.npmjs.com/package/showdown
 * @see Markdown: https://www.markdownguide.org/
 */
(function() {
	var converter = new showdown.Converter({
		"tables": true
	});

	var validTags = ["class", "style", "data", "data-id", "uri", "href", "src", "draggable", "value", "id", "title", "data-formula", "data-result", "data-showstate"];

	var xssOptions = {
		"whiteList": {
			"section": validTags,
			"button": validTags,
			"span": validTags,
			"img": validTags,
			"div": validTags,
			"h1": validTags,
			"h2": validTags,
			"h3": validTags,
			"h4": validTags,
			"h5": validTags,
			"h6": validTags,
			"ul": validTags,
			"ol": validTags,
			"li": validTags,
			"p": validTags,
			"a": validTags
		}
	};

	var compatibility = {
		"start": new RegExp("\\$\\{", "g"),
		"end": new RegExp("\\}\\$", "g")
	};

	var marking = {
		"start": "{{",
		"end": "}}"
	};

	var notFound = {
		"icon": "",
		"id": ""
	};
	
	var naiveObjectValue = function(universe, root, path) {
		return naiveObjectTrace(universe, root, path.split("."), 0) || path;
	};
	
	var naiveObjectTrace = function(universe, base, path, index) {
		if(!base) {
			return null;
		}
		var value = base[path[index++]],
			load;
		if(index >= path.length) {
			return value;
		} else {
			if(typeof(value) === "object") {
				return naiveObjectTrace(universe, value, path, index);
			} else if(typeof(value) === "string" && (load = universe.getObject(value))) {
				return naiveObjectTrace(universe, load, path, index);
			} else {
				return null;
			}
		}
	};

	var formatMarkdown = function(sourceText, universe, entity, allow_js) {
		// console.warn("Formatting Markdown: " + sourceText, universe, entity, base, targetObject);
		sourceText = sourceText?sourceText.replace(compatibility.start, marking.start).replace(compatibility.end, marking.end):"";
		
		// Deprecated and Removing
		var targetObject = null,
			base = null;
			
		var properties,
			tracking,
			element,
			target,
			buffer,
			title,
			value,
			index,
			mark,
			end,
			key,
			x,
			i;

		index = sourceText.indexOf(marking.start);
		while(index !== -1 && (end = sourceText.indexOf(marking.end, index)) !== -1 && index + 3 < end) {
			try {
				tracking = sourceText.substring(index, end + 2);
				target = sourceText.substring(index + 2, end);
				properties = {};

				mark = target.indexOf(",");
				if(mark === -1) {
					value = target;
				} else {
					value = target.split(",");
					switch(value.length) {
						default:
						case 4:
							base = universe.getObject(value[3]);
						case 3:
							properties.classes = value[2];
						case 2:
							properties.id = value[1].trim();
						case 1:
							value = value[0];
							if(!value && properties.id) {
								buffer = universe.getObject(properties.id);
								if(buffer) {
									value = buffer.name;
								}
							}
					}
				}

				if(value) {
					// console.warn("Calculating Expression: " + value, universe, entity, base, targetObject);
					if(value[0] === "=") {
						// Followed value
						// value = universe.calculateExpression(value.substring(1), entity, base, targetObject);
						properties.classes = properties.classes || "";
						value = value.substring(1);
						title = value;
						if(isNaN(value)) {
							// value = naiveObjectValue(universe, entity, value);
							properties.classes += " calculated-result ";
							try {
								value = rsSystem.dnd.compute(value, entity);
							} catch(e) {
								console.warn("Value Calculation Failed: {{=" + value + "}}");
							}
						} else {
							properties.classes += " flat-result ";
							value = parseFloat(value);

						}

						element = $("<span class=\"rendered-value " + properties.classes + "\" title=\"" + title + "\" data-formula=\"(=" + title + ")\" data-result=\"" + value + "\" data-showstate=\"result\">" + value + "</span>");
					} else if(value[0] === "~") {
						// Walked Reference
						value = value.substring(1).split(".");
						if(value.length < 2) {
							value = entity[value[0]];
						} else {
							buffer = universe.get(entity[value[0]]);
							for(x=1; buffer && x<value.length; x++) {
								buffer = universe.get(buffer[value[x]]) || buffer[value[x]];
							}
							value = buffer;
							// if(buffer) {
							// 	value = buffer.name || buffer.id;
							// } else {
							// 	console.error("Failed to get referenced field: ", value, entity);
							// }

							// tracking = universe.getObject(entity[value[0]]);
							// for(x=1; x<value.length; x++) {
							// 	tracking = universe.getObject(tracking[value[x]]);
							// }
							// value = tracking.name || tracking.id;
						}
						if(value && value.name) {
							value = value.name;
						}
						// if(value.length === 2) {
						// 	switch(value[0]) {
						// 		case "base":
						// 			value = base[value[1]] || "";
						// 			break;
						// 		case "target":
						// 			value = targetObject[value[1]] || "";
						// 			break;
						// 		default:
						// 			value = entity[value[1]] || "";
						// 			break;
						// 	}
						// } else {
						// 	value = entity[value[0]] || "";
						// }
						if(typeof(value) === "object") {
							element = "<ul class=\"" + properties.classes + "\">";
							if(value instanceof Array) {
								for(i=0; i<value.length; i++) {
									buffer = universe.get(value[i]);
									if(buffer) {
										element += "<li>" + buffer.name + "</li>";
									} else {
										element += "<li>" + value[i] + "</li>";
									}
								}
							} else {
								for(i in value) {
									buffer = universe.get(value[i]);
									key = universe.get(i);
									element += "<li>";
									if(key) {
										element += key.name + ": ";
									} else {
										element += i + ": ";
									}
									if(buffer) {
										element += buffer.name;
									} else {
										element += value[i];
									}
									element += "</li>";
								}
							}
							element = $(element + "</ul>");
						} else {
							element = $("<span class=\"" + properties.classes + "\">" + value + "</span>");
						}
					} else if(value[0] === "?") {
						// Formulas
						value = value.substring(1).trim();
						if(properties.id) {
							buffer = universe.getObject(properties.id) || entity;
						} else {
							buffer = entity;
						}
						if(buffer && buffer._formulas && buffer._formulas[value]) {
							element = $("<span class=\"rendered-value value-formula\">" + buffer._formulas[value] + "</span>");
						} else {
							element = $("<span class=\"rendered-value value-formula not-found not-known\">Unknown</span>");
						}
					} else if(value[0] === "@") {
						// Time Reference
						value = value.substring(1).trim();
						// buffer = universe.calendar.toDisplay(value, false, false);
						element = $("<span class=\"rendered-value value-formula\"><span class=\"far fa-calendar\"></span> " + value + "</span>");
					} else if(value[0] === "#") {
						// ID Reference
						value = value.substring(1).trim();
						buffer = universe.getObject(value);
						if(!buffer) {
							buffer = universe.getObject(entity[value]);
						}
						// TODO: Respond to object type better here. This is mainly to drive a more "native" support for images, but things
						//		like items should auto include some key details like icon, damage, or type. Possibly as hover text but likely
						//		also in parenthesis.
						if(buffer) {
							element = $("<a class=\"rendered-value linked-value " + properties.classes + "\" data-id=\"" + buffer.id + "\">" + buffer.name + "</a>");
						} else {
							element = $("<a class=\"rendered-value not-found " + properties.classes + "\" data-id=\"" + value + "\">" + value + "</a>");
						}
					} else if(value[0] === "!") {
						// Icon
						value = value.substring(1).trim();
						if(value && (value = universe.getObject(value))) {
	//						value = value;
						} else if(entity) {
							value = entity;
						}
						if(!value) {
							value = notFound;
						}
						element = $("<a class=\"" + value.icon + "\" data-id=\"" + (value.id) + "\"></a>");
					} else if(value[0] === "\"") {
						// value = value.substring(1).trim();
						value = value.substring(1).trim().split(".");
						if(value.length < 2) {
							value = entity[value[0]];
						} else {
							buffer = universe.getObject(entity[value[0]]);
							for(x=1; buffer && x<value.length-1; x++) {
								buffer = universe.getObject(buffer[value[x]]);
							}
							if(buffer) {
								value = buffer[value[value.length-1]];
							} else {
								console.error("Failed to get referenced field: ", value, entity);
							}
						}
						element = $("<span class=\"\">" + value + "</span>");
					} else {
						// Linked
						if(properties.id) {
							mark = universe.getObject(properties.id);
						} else {
							mark = universe.getNamed(value);
						}
						// mark = universe.index.index[properties.id || value];
						if(mark) {
							element = $("<a class=\"rendered-value linked-value " + properties.classes + "\" data-id=\"" + (properties.id || mark.id) + "\">" + value + "</a>");
						} else {
							// element = $("<span class=\"null-result rendered-value " + properties.classes + " not-found\">" + value + "[Not Known]</span>");
							element = $("<span class=\"null-result rendered-value " + properties.classes + " not-found\">" + value + "</span>");
						}
					}
	//				console.warn("Properties: ", properties);
					if(properties.classes) {
						element.css(properties.classes);
					}

					// console.log("Element: ", element);
					sourceText = sourceText.replace(tracking, element[0].outerHTML);
				}

				index = sourceText.indexOf(marking.start, index + 1);
			} catch(err) {
				console.error("Error formatting Markdown: ", err, "\n\nEntity: ", entity, "\nSource: ", sourceText);
				throw err;
			}
		}

		if(allow_js) {
			return sourceText;
		}
		return filterXSS(sourceText, xssOptions);
	};

	rsSystem.component("RSShowdown", {
		"inherit": true,
		"props": {
			"universe": {
				"required": true,
				"type": Object
			}
		},
		"methods": {
			/**
			 * 
			 * @method rsshowdown
			 * @param  {String} sourceText [description]
			 * @param  {Object} record     [description]
			 * @param  {Boolean} allow_js   [description]
			 * @return {String} 
			 */
			"rsshowdown": function(sourceText, entity, allow_js) {
//				console.warn("RS Showdown: ", entity, base, target);
				return converter.makeHtml(formatMarkdown(sourceText, this.universe, entity, allow_js));
			}
		}
	});

	document.body.addEventListener("click", function(event) {
		if(event.target && typeof(event.target.getAttribute) === "function") {
			switch(event.target.getAttribute("data-showstate")) {
				case "result":
					event.target.innerText = event.target.getAttribute("data-formula");
					event.target.setAttribute("data-showstate", "formula");
					break;
				case "formula":
					event.target.innerText = event.target.getAttribute("data-result");
					event.target.setAttribute("data-showstate", "result");
					break;
			}

		}
	});
})();
