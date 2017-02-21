var viz = {
	init: function() {
		var holder = $("#panel-viz .panel-content");
		this.vizHolder = $("<div/>", {
			id: "viz"
		}).appendTo(holder);

		/*
				this.minipanel = $("<div/>", {
					id: "viz-mini"
				}).appendTo(holder);
		*/

	},


	setClassesIf: function(entity, classes, cond) {
		if (entity && this.cytoscape) {
			var id = '#' + entity.type + "-" + entity.key;
			if (cond)
				this.cytoscape.$(id).addClass(classes);
			else
				this.cytoscape.$(id).removeClass(classes);
		}
	},

	setClassesExclusive: function(entity, classes) {
		if (entity && this.cytoscape) {
			this.cytoscape.$("." + entity.type).removeClass(classes);
			var id = '#' + entity.type + "-" + entity.key;
			this.cytoscape.$(id).addClass(classes);
		}
	},

	removeExitClasses: function() {
		if (this.cytoscape) {
			this.cytoscape.$(".exit").removeClass("open");
			this.cytoscape.$(".exit").removeClass("active");
		}
	},


	createExitData: function(exit, originalID) {

		var targetKey = exit.target.raw;
		var target = "state-" + targetKey;

		// self
		if (targetKey === "self") {
			target = originalID;
		}

		return {
			data: {
				target: target,
				id: "exit-" + exit.key,
				label: exit.label,

			},
			classes: "exit"
		}
	},

	mapToCytoData: function(map) {

		console.log(map);

		var cytoData = [];
		$.each(map.states, function(key, state) {
			var stateID = "state-" + state.key;
			cytoData.push({
				data: {
					id: stateID,
					label: state.key,
				},
				classes: "state"
			});


			$.each(state.exits, function(key, exit) {

				var exitData = viz.createExitData(exit, stateID);
				exitData.data.source = stateID;
				cytoData.push(exitData);
			});

		});

		return cytoData;

	},

	createMapViz: function(map) {

		this.cytoscape = cytoscape({
			container: this.vizHolder,
			elements: this.mapToCytoData(map),
			style: [{
				selector: '.state',
				style: {
					'width': 'label',
					'color': 'rgb(255, 255, 255)',
					'background-color': '#666',
					'text-valign': 'center',
					'shape': "roundrectangle",
					'label': 'data(label)',

				}
			}, {
				selector: 'node.highlighted',
				style: {
					'background-color': 'blue',

				}
			}, {
				selector: 'node.active',
				style: {
					'background-color': 'blue',

				}
			}, {
				selector: 'node.dot',
				style: {
					'color': 'rgb(255, 255, 255)',
					'background-color': '#666',
					'text-valign': 'center',
					'shape': "roundrectangle",
					'label': 'data(label)',

					'shape': "ellipse",

					'width': 20,
					'height': 20
				}
			}, {
				selector: '.exit',
				style: {

					'curve-style':'bezier',
					'line-color': 'grey',
					'color': 'grey',
					'label': 'data(label)',

					'target-arrow-color': '#000',
					'target-arrow-shape': 'triangle',

					'font-size': '14',
					'width': '2',
				}
			}, {
				selector: 'edge.open',
				style: {
					'target-arrow-color': 'hsla(190, 100%, 60%)',
					'line-color': 'hsla(190, 100%, 60%)',
					'width': '7',

				}
			}],

		});

		this.cytoscape.layout({
			name: 'cola',
			infinite: false
		});



		this.cytoscape.on('tap', function(evt) {
			console.log("tap");

			if (evt.cyTarget.id) {
				var s = evt.cyTarget.id().split("-");
				var id = s[1];
				app.pointer.teleportTo(id);
			}
		});
	},


	refreshAll: function() {
		// Deselect all states

	},

	refreshEdges: function() {

	},


}