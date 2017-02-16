var Pointer = Class.extend({
	init: function() {
		var pointer = this;
		this.exitCountdown = 0;
		this.inputLog = [];
	},

	get: function(path) {
		if (isString(path))
			path = parseMapPath(path);

		var v = this.blackboard.getFromPath(path.steps, this);

		return v;
	},
	set: function(path, val) {

		if (isString(path))
			path = parseMapPath(path);

		var steps = path.steps.map(step => step.value !== undefined ? step.value : step);
		return this.blackboard.setFromPath(steps, val, this);
	},

	handleInput: function(input) {
		if (input === "help") {
			// list various inputs

		} else {
			console.log("INPUT: " + inQuotes(input));
			this.inputLog.push(input);
			this.lastInput = input;
			this.blackboard.setFromPath("INPUT", input);
			var val = parseFloat(input);
			if (!isNaN(val))
				this.blackboard.setFromPath("INPUT_NUMBER", val);
			this.updateExits();
		}
	},

	clearInput: function() {
		this.lastInput = undefined;
		this.blackboard.setFromPath("INPUT", undefined);
		this.lastInputNumber = undefined;
		this.blackboard.setFromPath("INPUT_NUMBER", undefined);
	},

	update: function() {
		var pointer = this;


		var t = Date.now() - app.start;
		this.timeInState = t - this.timeEnteredState;
		this.timeInState *= .001;
		//this.blackboard.setFromPath("TIME_IN_STATE", this.timeInState);

		if (this.selectedExit)
			this.useExit(this.selectedExit);


		this.updateExits();
	},

	updateExits: function() {
		var pointer = this;

		// Check all the exits to see which are active
		this.analyzedExits.forEach(function(exit) {
			exit.priority = 1;

			if (exit.template.priority) {
				exit.priority = evaluateExpression(exit.template.priority, this);
			}
			exit.conditions.forEach(function(condition) {
				updateCondition(condition, pointer);
			});
			updateExit(exit, pointer);
		});

		var open = this.analyzedExits.filter(exit => exit.isOpen).sort(function(a, b) {
			return b.priority - a.priority;
		});

		// Select the first open exit
		if (open.length > 0 && this.selectedExit === undefined) {
			console.log(open.length + " exits open, selecting first");
			this.selectExit(open[0]);
		}
		// If any are open, take that
	},



	useExit: function(key) {
		var pointer = this;

		if (pointer.selectedExit) {
			pointer.selectedExit.div.addClass("active");

			pointer.exitCountdown--;
			if (pointer.exitCountdown <= 0) {
				// Calculate the target (for now, assume plaintext targets)
				var target = pointer.selectedExit.template.target.raw;
				this.goTo(target, this.selectedExit);
			}


		} else {
			console.warn("No exit selected!");
		}

	},

	goTo: function(key, useExit) {


		console.log("----------------------\nGo to " + inQuotes(key));
		var pointer = this;

		pointer.selectedExit = undefined;
		var nextState = this.map.states[key];
		if (key == "*") {
			// pop from the stack
		}

		// reenter this state
		if (key == "@") {
			nextState = pointer.currentState;
			pointer.clearInput();

		}

		// don't go anywhere
		if (key == "/") {
			nextState = undefined;
		}

		if (nextState === undefined)
			console.warn("No state found: " + inQuotes(key));

		if (nextState) {
			if (this.currentState)
				this.exitState(this.currentState);
		}

		if (useExit) {
			$.each(useExit.template.actions, function(index, action) {
				performAction(action, pointer);
			});



		}


		if (nextState) {
			this.currentState = nextState;
			if (this.currentState)
				this.enterState(this.currentState);
		}


	},

	flatten: function(rule) {
		var node = parseRule(rule);
		this.grammar.expandNode(node, undefined, {
			worldObject: this.blackboard
		});

		var s = node.finished;

		return s;

	},

	exitState: function() {
		//	console.log("\nExit " + this.currentState.key);
	},


	enterState: function() {

		this.timeEnteredState = Date.now() - app.start;
		var pointer = this;


		$.each(this.currentState.onEnter, function(index, action) {
			performAction(action, pointer);
		});


		// Make chips
		if (this.currentState.chips) {
			chat.setChips(this.currentState.chips.map(function(chip) {
				var s = pointer.flatten(chip);
				return {
					displayText: s,
					inputText: s
				}
			}));
		}

		// Update the view
		this.stateView.state.html(this.currentState.key);


		// Clear inputs before triggering any exits
		pointer.clearInput();

		this.collectExits();
	},

	selectExit: function(exit) {

		$(".mapinfo-exit").removeClass("selected");
		$(".mapinfo-" + exit.template.key).addClass("selected");
		this.selectedExit = exit;
		this.exitCountdown = Math.ceil(4*app.exitPause);
	},

	deselectExit: function(exit) {
		console.log("deselect " + exit.template.key);
		$(".mapinfo-" + exit.template.key).removeClass("selected");
		this.selectedExit = undefined;
	},


	// Get all universal exits plus all exits from the current state
	collectExits: function() {
		var pointer = this;

		var availableExits = this.map.exits.slice().concat(this.currentState.exits);

		// Create analysis objects for the exits
		this.analyzedExits = availableExits.map(function(exit) {
			if (exit === undefined)
				console.warn("empty exit");

			// Make an object that watches this condition for changes
			var exitAnalysis = {

				isOpen: false,
				template: exit
			};

			if (!exit.conditions)
				console.log(exit);

			exitAnalysis.conditions = exit.conditions.map(function(condition) {
				if (condition === undefined)
					console.warn("empty condition in " + inQuotes(exit.raw));
				return {
					template: condition,
					isFulfilled: false,
					manualOverride: undefined,
					exitAnalysis: exitAnalysis
				};
			});

			return exitAnalysis;
		});


		this.stateView.exits.html("");

		// create views for the avaiable exits
		this.exitViews = this.analyzedExits.map(function(exit) {

			// Add to the state view (on the blackboard)
			exit.div = $("<div/>", {
				class: "mapinfo-exit mapinfo-" + exit.template.key,
			}).appendTo(pointer.stateView.exits).click(function() {
				if (pointer.selectedExit === exit) {
					pointer.deselectExit(exit);
				} else {
					pointer.selectExit(exit);

				}

			});

			var exitName = $("<div/>", {
				class: "mapinfo-exitname",
				html: exit.template.target.raw
			}).appendTo(exit.div);

			var conditions = $("<div/>", {
				class: "mapinfo-conditions",
			}).appendTo(exit.div);


			$.each(exit.conditions, function(index, conditionAnalysis) {

				if (conditionAnalysis.template) {
					conditionAnalysis.div = $("<div/>", {
						html: conditionAnalysis.template.raw,
						class: "mapinfo-condition mapinfo-" + conditionAnalysis.template.key,
					}).appendTo(conditions).click(function() {
						console.log("Clicked condition " + conditionAnalysis.template.raw);
						conditionAnalysis.manualOverride = !conditionAnalysis.manualOverride;
						updateCondition(conditionAnalysis, pointer);
					});
				}
			});

		});
	},

	enterMap: function(map, blackboard) {
		this.map = map;
		this.currentState = undefined;

		if (!map.grammar)
			map.grammar = {};
		this.grammar = tracery.createGrammar(map.grammar, true);
		this.grammar.modifiers.hiphopify = function(s) {
			if (Math.random() > .8) {
				s = s.replace(/s/g, "z")
			}
			return s.split(" ").map(function(s2) {
				if (Math.random() > .7) {
					return s2.split("").map(s3 => s3.toUpperCase() + ".").join("");
				} else {
					return s2;
				}
			}).join(" ");


		}

		$("#panel-blackboard .panel-content").html("");
		$("#panel-stateview .panel-content").html("");

		this.view = $("<div/>", {
			class: "mapinfo-view"
		}).appendTo($("#panel-blackboard .panel-content"));



		this.stateView = $("<div/>", {
			class: "mapinfo-stateview"
		}).appendTo($("#panel-stateview .panel-content"));

		this.stateView.state = $("<div/>", {
			class: "mapinfo-state"
		}).appendTo(this.stateView);

		this.stateView.exits = $("<div/>", {
			class: "mapinfo-exits"
		}).appendTo(this.stateView);


		this.blackboardView = $("<div/>", {
			class: "mapinfo-bbview"
		}).appendTo(this.view);

		if (blackboard)
			this.blackboard = blackboard;
		else
			this.blackboard = new BBO(this.blackboardView);

		// load the blackboard
		this.blackboard.setFromPath([], map.initialBlackboard, map.blackboard);

		this.goTo("origin");

	}
});

function updateExit(exitAnalysis, pointer) {

	var val = true;
	for (var i = 0; i < exitAnalysis.conditions.length; i++) {
		if (!exitAnalysis.conditions[i].isFulfilled)
			val = false;
	}
	if (val !== exitAnalysis.isOpen) {

		exitAnalysis.isOpen = val;
		if (exitAnalysis.isOpen)
			exitAnalysis.div.addClass("open");
		else
			exitAnalysis.div.removeClass("open");
	}



}

function updateCondition(conditionAnalysis, pointer) {

	var val;
	if (conditionAnalysis.manualOverride)
		val = true;
	else {

		val = evaluateCondition(conditionAnalysis.template, pointer);
	}

	if (val !== conditionAnalysis.isFulfilled) {
		// A change has occured, update and notify
		if (val)
			conditionAnalysis.div.addClass("open");
		else
			conditionAnalysis.div.removeClass("open");

		if (conditionAnalysis.manualOverride)
			conditionAnalysis.div.addClass("override");
		else
			conditionAnalysis.div.removeClass("override");

		conditionAnalysis.isFulfilled = val;
	}


	updateExit(conditionAnalysis.exitAnalysis, pointer);
}