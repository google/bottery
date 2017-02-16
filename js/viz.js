var viz = {
	init: function() {
		var holder = $("#panel-viz .panel-content");
		this.vizHolder = $("<div/>", {
			id: "viz"
		}).appendTo(holder);

		this.minipanel = $("<div/>", {
			id: "viz-mini"
		}).appendTo(holder);

	},

	highlight: function(entity, exclusive) {
		var id = '#' + entity.type + "-" + entity.key;


		if (exclusive)
			this.cytoscape.$("." + entity.type).removeClass("highlighted");

		this.cytoscape.$(id).addClass("highlighted");
	},

	activateInGraph: function(entity) {

		var id = '#' + entity.type + "-" + entity.key;
		console.log("activate " + id);
		this.cytoscape.$(id).addClass("active");
	},

	mapToCytoData: function(map) {

		function createExitData(exit, originalID) {

			var target = "state-" + exit.target;

			// self
			if (exit.target === "self") {
				target = originalID;
			}

		

			if (exit.target === "@" || exit.target === "*") {
				var popID = "pop-" + exit.id;
				target = popID;

				cytoData.push({
					data: {
						id: popID,
						label: "*",
					},
					classes: "pop dot"
				});

			}

			return {
				data: {
					target: target,
					id: "exit-" + exit.key,
					label: exit.label,

				},
				classes: "exit"
			}
		}

		var cytoData = [];
		$.each(map.states, function(key, state) {
			var stateID = "state-" + state.key;
			cytoData.push({
				data: {
					id: stateID,
					label: state.label,
				},
				classes: "state"
			});

			$.each(state.exits, function(key, exit) {

				var exitData = createExitData(exit, stateID);
				exitData.data.source = stateID;
				cytoData.push(exitData);
			});

			// An imaginaryexit from the state to a set of exits
			$.each(state.exitSets, function(key, setName) {

				var exitToSet = {
					data: {
						target: "exitSet-" + setName,
						source: stateID,
					},
					classes: "semiexit exit"
				}

				cytoData.push(exitToSet);

			});


		});



		$.each(map.exitSets, function(key, exitSet) {
			var setID = "exitSet-" + key;
			cytoData.push({
				data: {
					id: setID,
					label: key

				},
				classes: "exitSet"
			});

			for (var i = 0; i < exitSet.length; i++) {
				var exit = map.exits[exitSet[i]];

				var exitData = createExitData(exit);
				exitData.data.source = setID;
				console.log(exitData);
				cytoData.push(exitData);
			}

		})

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
				selector: 'node.exitSet',
				style: {
					'shape': "ellipse",
					'label': 'data(label)',
					'width': 20,
					'height': 20

				}
			}, {
				selector: 'node.pop',
				style: {}
			}, {
				selector: '.exit',
				style: {
					'target-arrow-color': 'grey',
					'line-color': 'grey',
					'color': 'grey',
					'label': 'data(label)',
					'target-arrow-shape': 'triangle',
					'font-size': '14',
					'width': '2',
				}
			}, {
				selector: 'edge.highlighted',
				style: {

					'line-color': 'hsl(190, 30%, 60%)',
					'color': 'hsl(190, 30%, 60%)',
					'target-arrow-color': 'hsl(190, 30%, 60%)',
					'width': '6',
				}
			}, {
				selector: '.semiexit.exit',
				style: {

					'target-arrow-color': 'grey',
					'line-color': 'grey',
					'color': 'grey',
					'target-arrow-shape': 'triangle',
					'line-style': 'dashed',
					'width': '1',
				}
			}, {
				selector: '.exit.active',
				style: {
					'target-arrow-color': 'hsla(190, 30%, 60%, 1)',
					'line-color': 'hsla(190, 30%, 60%, 1)',
					'width': '6',

				}
			}, {
				selector: 'edge.open.active',
				style: {
					'target-arrow-color': 'hsla(190, 100%, 60%)',
					'line-color': 'hsla(190, 100%, 60%)',
					'width': '7',

				}
			}, {
				selector: '.visited',
				style: {
					'background-color': 'rgb(0, 190, 255)',
					'line-color': 'rgb(0, 190, 255)',
					'target-arrow-color': 'rgb(0, 190, 255)',
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