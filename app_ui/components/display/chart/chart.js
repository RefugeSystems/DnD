/**
 *
 *
 * @class rsHighChart
 * @constructor
 * @module Components
 * @param {Object} details
 * @param {Object} universe
 * @param {UIProfile} [profile]
 * @param {RSObject} [entity]
 * @param {Object} [player]
 */
rsSystem.component("rsHighChart", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {

	},
	"data": function () {
		var data = {};

		data.chart = null;
		data.series = {
			"name": "Other",
			"data": [21908, 5548, 8105, 11248, 8989, 11816, 18274,
				17300, 13053, 11906, 10073]
		};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
		this.update();
	},
	"methods": {
		"processSelection": function(event) {
			console.log("Chart sel Event: ", event);
		},
		"processClick": function(event) {
			console.log("Chart clk Event: ", event);
		},
		"processDrillDown": function(event) {
			console.log("Chart dd Event: ", event);
		},
		"processDrillUp": function(event) {
			console.log("Chart du Event: ", event);
		},
		"update": function() {
			console.log("Chart Update: ", this);
			Vue.set(this, "chart", Highcharts.chart(this.$el, {
				"title": {
					"text": "U.S Solar Employment Growth",
					"align": "left"
				},
				"subtitle": {
					"text": "By Job Category. Source: <a href=\"https://irecusa.org/programs/solar-jobs-census/\" target=\"_blank\">IREC</a>.",
					"align": "left"
				},
			
				"yAxis": {
					"title": {
						"text": "Number of Employees"
					}
				},
			
				"xAxis": {
					"accessibility": {
						"rangeDescription": "Range: 2010 to 2020"
					}
				},
			
				"legend": {
					"layout": "vertical",
					"align": "right",
					"verticalAlign": "middle"
				},
			
				"plotOptions": {
					"series": {
						"label": {
							"connectorAllowed": false
						},
						"pointStart": 2010
					}
				},
				
				"events": {
					"addSeries": function(event) {
						console.log("Chart addSeries Event: ", event);
					},
					"selection": this.processSelection,
					"click": this.processClick,
					"drillup": this.processDrillUp,
					"drilldown": this.processDrillDown
				},
			
				"series": [{
					"name": "Installation & Developers",
					"data": [43934, 48656, 65165, 81827, 112143, 142383,
						171533, 165174, 155157, 161454, 154610]
				}, {
					"name": "Manufacturing",
					"data": [24916, 37941, 29742, 29851, 32490, 30282,
						38121, 36885, 33726, 34243, 31050]
				}, {
					"name": "Sales & Distribution",
					"data": [11744, 30000, 16005, 19771, 20185, 24377,
						32147, 30912, 29243, 29213, 25663]
				}, {
					"name": "Operations & Maintenance",
					"data": [null, null, null, null, null, null, null,
						null, 11164, 11218, 10077]
				}, this.series],
			
				"responsive": {
					"rules": [{
						"condition": {
							"maxWidth": 500
						},
						"chartOptions": {
							"legend": {
								"layout": "horizontal",
								"align": "center",
								"verticalAlign": "bottom"
							}
						}
					}]
				}
			}));

			this.chart.on("selection", this.processSelection);
			this.chart.on("click", this.processClick);
			this.chart.on("drillup", this.processDrillUp);
			this.chart.on("drilldown", this.processDrillDown);
		}
	},
	"beforeDestroy": function () {
		// rsSystem.EventBus.$off("calendar:update", this.update);
		// this.chart.off("selection", this.processChart);
	},
	"template": Vue.templified("components/display/chart.html")
});
