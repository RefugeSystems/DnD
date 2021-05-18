
var fs = require("fs"),
	pkg = JSON.parse(fs.readFileSync("./package.json")),
	title = (pkg.title || pkg._title || pkg.name),
	seek = /^.*app_ui[\/\\](components|pages|common)[\/\\]/;

var config = {
	"pkg": pkg,
	"eslint": {
		"options": {
			/* http://eslint.org/docs/rules/ */
			"rules": {
				"eqeqeq": 0,
				"curly": [2, "all"],
				"no-undef": 2,
				"semi": 2,
				"indent": [2, "tab", {
						"ignoreComments": true,
						"MemberExpression": 0,
						"SwitchCase": 1
					}
				],
				"comma-dangle": 2,
				"quotes": [2, "double"],
				"no-unused-vars": [1, {
						"varsIgnorePattern": "^(_|[A-Z])",
						"args": "after-used"
					}
				],
				"block-scoped-var": 2,
				"no-undef": 2,
				"max-depth": [1, {
						"max": 10
					}
				]
			},
			"terminateOnCallback": false,
			"callback": function (response) {
				if (response.errorCount) {
					var result,
					message;
					for (result = response.results.length - 1; result !== -1; --result) {
						if (!response.results[result].errorCount) {
							response.results.splice(result, 1);
						} else {
							for (message = response.results[result].messages.length - 1; message !== -1; --message) {
								if (response.results[result].messages[message].severity !== 2) {
									response.results[result].messages.splice(message, 1);
								}
							}
						}
					}
				}
				return response;
			},
			"envs": ["browser", "jasmine", "es6", "node"],
			"globals": [
				"DocumentTouch",
				"XMLHttpRequest",
				"sessionStorage",
				"localStorage",
				"_gazeVersion",
				"FileReader",
				"cytoscape",
				"location",
				"document",
				"angular",
				"Promise",
				"Hammer",
				"Image",
				"global",
				"window",
				"inject",
				"Gaze",
				"cola",
				"atob",
				"btoa",
				"VueRouter",
				"Vue",
				"d3",
				"window",
				"location",
				"localStorage",
				"sessionStorage",
				"DEFAULTS",
				"ERROR_Codes",
				"Highcharts",
				"showdown",
				"d3",
				"$0",
				"$",

				"rsSystem",
				"DataUtility",
				"UserInformation",
				"NameGenerator",
				"EventEmitter",
				"SearchIndex",
				"filterXSS",
				"Component",
				"Invasion",
				"Anomaly",
				"Random",
				"Dice",
				"_p",

				"RSCalculator",
				"RSUniverse",
				"RSObject",

				"RSConnection",
				"RSConstruct",
				"RSSetting",
				"RSPlayer",
				"RSImage",
				"RSNode",
				"RSLog"
			]
		},
		"server": [
			"app/api/**/*.js",
			"app/authentication/**/*.js",
			"app/configuration/**/*.js",
			"app/core/**/*.js",
			"app/management/**/*.js",
			"app/storage/**/*.js",
			"app/universe/**/*.js",
			"app/*.js",
		
			"tests/server/**/*.js",
			"tests/_helpers/**/*.js",
			"tests/_mocks/**/*.js",
			"tests/_data/**/*.js",
		],
		"ui": [
			"app_ui/common/**/*.js",
			"app_ui/components/**/*.js",
			"app_ui/core/**/*.js",
			"app_ui/pages/**/*.js",
			"app_ui/synth/**/*.js",
			"app_ui/workers/**/*.js",
			
			"tests/ui/**/*.js",
			"tests/_helpers/**/*.js",
			"tests/_mocks/**/*.js",
			"tests/_data/**/*.js"
		]
	},
	"connect": {
		"app": {
			"options": {
				"port": 3082,
				"base": "deploy_web/",
				"hostname": "*",
				"livereload": 3083,
				"middleware": function(connect, options, middlewares) {
					middlewares.unshift(function(req, res, next) {
						res.setHeader("Access-Control-Allow-Origin", "*");
						res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * 'self' data: blob: https:;");
						next();
					});
					return middlewares;
				}
			}
		},
		"docs_server": {
			"options": {
				"port": 3090,
				"base": "docs_server/",
				"hostname": "*",
				"middleware": function(connect, options, middlewares) {
					middlewares.unshift(function(req, res, next) {
						res.setHeader("Access-Control-Allow-Origin", "*");
						res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * 'self' data: blob: https:;");
						next();
					});
					return middlewares;
				}
			}
		},
		"docs_ui": {
			"options": {
				"port": 3091,
				"base": "docs_ui/",
				"hostname": "*",
				"middleware": function(connect, options, middlewares) {
					middlewares.unshift(function(req, res, next) {
						res.setHeader("Access-Control-Allow-Origin", "*");
						res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * 'self' data: blob: https:;");
						next();
					});
					return middlewares;
				}
			}
		}
	},
	"open": {
		"app": {
			"path": "http://127.0.0.1:3082/"
		},
		"docs_server": {
			"path": "http://127.0.0.1:3090/"
		},
		"docs_ui": {
			"path": "http://127.0.0.1:3091/"
		}
	},
	"watch": {
		"app": {
			"options": {
				"livereload": {
					"host": "0.0.0.0",
					"port": 3083
				},
				"livereloadOnError": false
			},
			"files": [
				"Gruntfile.js",
				"app_ui/workers/**/*.js",
				"app_ui/manifest.json",
				"app_ui/**/*.less",
				"app_ui/**/*.json",
				"app_ui/**/*.html",
				"app_ui/**/*.css",
				"app_ui/**/*.js"
			],
			"tasks": ["ui_develop"]
		},
		"server": {
			"files": [
				"app/**/*.js",
				"tests/server/**/*.js",
				"tests/_helpers/**/*.js",
				"tests/_mocks/**/*.js",
				"tests/_data/**/*.js"
			],
			"tasks": ["eslint:server", "jasmine:server"]
		},
		"ui": {
			"files": [
				"app_ui/**/*.js",
				"tests/ui/**/*.js",
				"tests/_helpers/**/*.js",
				"tests/_mocks/**/*.js",
				"tests/_data/**/*.js"
			],
			"tasks": ["ui_develop"]
		}
	},
	"exec": {
		"server": {
			"cmd": function() {
				return "yuidoc -q --server 3090 --config ./yuidoc.app.json";
			}
		},
		"ui": {
			"cmd": function() {
				return "yuidoc -q --server 3091 --config ./yuidoc.ui.json";
			}
		}
	},
	"jasmine": {
		"options": {
			"directory": "tests",
			"random": false
		},
		"server": {
			"specifications": ["server/**/*.js"]
		},
		"ui": {
			"specifications": ["ui/**/*.js"]
		}
	},
	"concat": {
		"index_prep": {
			"options": {
				"footer": "\t\t\n<title>" + title + "</title>" +
					"\t\t\n<meta name=\"description\" content=\"" + pkg.description + "\"/>" +
					"\t\t\n<meta name=\"keywords\" content=\"" + pkg.keywords.join(", ") + "\"/>" +

					"\t\t\n<meta name=\"og:title\" content=\"" + title + "\"/>" +
					"\t\t\n<meta name=\"og:description\" content=\"" + pkg.description + "\"/>" +

					"\t\n<meta name=\"twitter:title\" content=\"" + title + "\"/>" +
					"\t\t\n<meta name=\"twitter:description\" content=\"" + pkg.description + "\"/>\n",
				"sourceMap": false
			},
			"src": [
				"app_ui/synth/index/index.head.html"
			],
			"dest": "deploy_cache/synth_index_head.html"
		},
		"index": {
			"options": {
				"sourceMap": false
			},
			"src": [
				"deploy_cache/synth_index_head.html",
				"app_ui/synth/index/index.transition.html",
				"app_ui/synth/index/index.app.html",
				"app_ui/synth/index/index.termination.html"
			],
			"dest": "deploy_web/index"
		},
		"worker": {
			"options": {
				"sourceMap": false
			},
			"src": [
				"app_ui/workers/core/**/*.js",
				"app_ui/workers/core/*.js"
			],
			"dest": "deploy_web/worker.js"
		},
		"sharedworker": {
			"options": {
				"sourceMap": false
			},
			"src": [
				"app_ui/workers/shared/**/*.js",
				"app_ui/workers/shared/*.js"
			],
			"dest": "deploy_web/shared.js"
		},
		"externals": {
			"options": {
				"sourceMap": true
			},
			"src": [
				"node_libraries/cytoscape.js",
				"node_libraries/cola.js",
				"node_libraries/cytoscape-cola.js"
			],
			"dest": "deploy_web/externals.js"
		},
		"app": {
			"options": {
				"footer": "\nrsSystem.version=\"" + pkg.version + "\"",
				"sourceMap": true
			},
			"src": [
				"node_modules/xss/dist/xss.min.js",
				"node_modules/hammerjs/hammer.js",
				"node_modules/showdown/dist/showdown.min.js",
				"node_modules/vue/dist/vue.js",
				"node_modules/jquery/dist/jquery.min.js",
				"node_modules/vue-router/dist/vue-router.js",
				"node_modules/d3/dist/d3.min.js",

				"deploy_cache/templates.js",
				"app_ui/library/*.js",
				"app_ui/library/*/**/*.js",

				"app_ui/core/*.js",
				"app_ui/core/*/**/*.js",

				"app_ui/common/*.js",
				"app_ui/common/*/**/*.js",

				"app_ui/components/*.js",
				"app_ui/components/*/**/*.js",

				"app_ui/pages/*.js",
				"app_ui/pages/*/**/*.js",

				"app_ui/main/*/**/*.js",
				"app_ui/main/*.js"
			],
			"dest": "deploy_web/main.js"
		},
		"less": {
			"src": [
				"app_ui/styles/*.less",
				"app_ui/styles/*/**/*.less",
				"app_ui/pages/**/*.less",
				"app_ui/common/**/*.less",
				"app_ui/components/**/*.less"
			],
			"dest": "deploy_cache/app.less"
		}
	},
	"uglify": {
		"options": {
			"sourceMap": true
		},
		"app": {
			"options": {
				"footer": "\nrsSystem.version = \"" + pkg.version + "\"",
				"reserved": ["rsSystem"]
			},
			"files": {
				"deploy_web/main.js": [
					"node_modules/xss/dist/xss.min.js",
					"node_modules/hammerjs/hammer.js",
					"node_modules/showdown/dist/showdown.min.js",
					"node_modules/vue/dist/vue.js",
					"node_modules/jquery/dist/jquery.min.js",
					"node_modules/vue-router/dist/vue-router.js",
					"node_modules/d3/dist/d3.min.js",

					"deploy_cache/templates.js",
					"app_ui/library/*.js",
					"app_ui/library/*/**/*.js",

					"app_ui/core/*.js",
					"app_ui/core/*/**/*.js",

					"app_ui/components/*.js",
					"app_ui/components/*/**/*.js",

					"app_ui/pages/*.js",
					"app_ui/pages/*/**/*.js",

					"app_ui/main/*/**/*.js",
					"app_ui/main/*.js"
				]
			}
		},
		"externals": {
			"files": {
				"deploy_web/externals.js": [
					"node_libraries/cytoscape.js",
					"node_libraries/cola.js",
					"node_libraries/cytoscape-cola.js"
				]
			}
		},
		"worker": {
			"files": {
				"deploy_web/worker.js": [
					"app_ui/workers/core/**/*.js",
					"app_ui/workers/core/*.js"
				]
			}
		},
		"sharedworker": {
			"files": {
				"deploy_web/shared.js": [
					"app_ui/workers/shared/**/*.js",
					"app_ui/workers/shared/*.js"
				]
			}
		}
	},
	"less": {
		"app": {
			"files": {
				"deploy_web/main.css": [
					"deploy_cache/app.less"
				]
			}
		}
	},
	"templify": {
		"options": {
			"autoAffix": true,
		},
		"app": {
			"templates": [{
					"path": "app_ui/**/*.html",
					"rewrite": function (name) {
						var ex = seek.exec(name);
						if(ex) {
							var st = name.replace(ex[0], ""),
								i = st.lastIndexOf("/"),
								d = st.lastIndexOf(".");
							if(i !== -1) {
								st = "/" + st.substring(0, i) + st.substring(d);
							} else {
								st = "/" + st;
							}
							st = ex[1] + st;
							return st.replace(/_/g, "/");
						} else {
							return name;
						}
					}
				}
			],
			"suffixes": [".html"],
			"mode": "vue",
			"output": "./deploy_cache/templates.js"
		}
	},
	"concurrent": {
		"server": {
			"tasks": [
				["open:docs_server", "exec:server"],
				["server_develop"]
			],
			"options": {
				"logConcurrentOutput": true
			}
		},
		"ui": {
			"tasks": [
				["open:docs_ui", "exec:ui"],
				["ui_develop", "connect:app", "open:app", "watch:app"]
			],
			"options": {
				"logConcurrentOutput": true
			}
		}
	},
	"yuidoc": {
		"server": {
			"options": {
				"outdir": "./docs_server",
				"paths": [
					"./app/"
				]
			}
		},
		"ui": {
			"options": {
				"outdir": "./docs_ui",
				"paths": [
					"./app_ui/"
				]
			}
		},
		"compile": {
			"name": "<%= pkg.name %>",
			"description": "<%= pkg.description %>",
			"version": "<%= pkg.version %>",
			"url": "<%= pkg.homepage %>",
			"options": {
				"outdir": "./docs_ui",
				"paths": [
					"./app_ui/"
				]
			}
		}
	}
};

module.exports = function (grunt) {
	require("load-grunt-tasks")(grunt);

	grunt.loadNpmTasks("grunt-contrib-templify");
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-yuidoc");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("gruntify-eslint");

	grunt.initConfig(config);

	grunt.registerMultiTask("jasmine", "System Tests", function() {
		var options = Object.assign({}, this.options(), this.data);
		options.helpers = options.helpers || [];
		options.helpers = options.helpers.concat([
			"_helpers/*.js",
			"_mocks/*.js",
			"_data/*.js"
		]);

		var done = this.async();
		var Jasmine = require("jasmine");
		var jasmine = new Jasmine();
		var Reporter = require("jasmine-console-reporter");
		var reporter = new Reporter({
			"verbosity": {
	            specs: true,
	            failed: true,
	            pending: false,
	            disabled: false,
	            summary: true
	        },
			"emoji": false,
			"colors":2
		});

		jasmine.configureDefaultReporter(false);
		jasmine.onComplete(done);
		jasmine.loadConfig({
			"spec_dir": options.directory,
			"spec_files": options.specifications,
			"random": !!options.random,
			"helpers": options.helpers
		});

		jasmine.addReporter(reporter);

		jasmine.execute();
	});

	grunt.registerTask("documentation", ["yuidoc:server", "yuidoc:ui"]);
	grunt.registerTask("server_develop", ["watch:server"]);
	grunt.registerTask("server", ["eslint:server", "jasmine:server", "concurrent:server"]);
	grunt.registerTask("ui", ["eslint:ui", "jasmine:ui", "concurrent:ui"]);
	
	grunt.registerTask("ui_exp", ["ui_develop", "connect:app", "open:app", "watch:app"]);

	grunt.registerTask("ui_build", ["eslint", "jasmine:ui", "templify:app", "uglify:worker", "uglify:sharedworker", "uglify:externals", "uglify:app", "concat:less", "less:app"]);
	grunt.registerTask("ui_develop", ["eslint:ui", "jasmine:ui", "templify:app", "concat:worker", "concat:sharedworker", "concat:externals", "concat:app", "concat:less", "less:app"]);
	grunt.registerTask("default", ["concurrent:development"]);
};
