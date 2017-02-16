// Copyright 2017 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/* 
 * Conversation map
 */

var openChars = "#{[('\"";
var closeChars = "#}])'\"";
var expressionOperators = "== != < > <= >= && || ! + - * / ^ % ".split(" ");
var actionOperators = "= += -= /= *= ^= %=  ++ --".split(" ");


// types of paths
// numbers
// 
function parseMapValue(raw) {

	if (typeof raw === "number")
		return {
			type: "number",
			value: raw
		};

	if (!isNaN(parseFloat(raw)))
		return {
			type: "number",
			value: parseFloat(raw)
		};

	if (isInQuotes(raw)) {
		return {
			type: "text",
			value: raw.substring(1, raw.length - 1)
		};
	}

	// May be a function or a path
	return parseMapPath(raw);
}

function parseMapPath(raw) {
	// Address
	var s = splitOnUnprotected(raw, ".", false, openChars, closeChars);

	var parsed = {
		raw: raw,
		type: "path",
		steps: []
	};


	// foo.bar[max(0,foo)][5].bar[baz.bar[baz]]
	// foo.bar.baz[5](5,bar)
	// ends up with some simple steps, and some expression steps
	for (var i = 0; i < s.length; i++) {
		var s2 = splitIntoTopSections(s[i], "[(", {
			openChars: openChars,
			closeChars: closeChars
		});

		if (s2[0].depth === 0) {
			parsed.steps.push({
				type: "text",
				value: s2[0].inner
			});

			// cleanup
			s2 = s2.filter(s => s.inner.trim().length > 0 || s.depth > 0);

			// Go through all the square brackets and add them as expression steps
			for (var j = 1; j < s2.length; j++) {
				var section = s2[j];

				switch (section.openChar) {
					case "(":


						var rawParams = splitOnUnprotected(section.inner, ",", false, openChars, closeChars);
						parsed.parameters = rawParams.map(s => parseMapExpression(s));
						parsed.isFunction = true;
						break;
					case "[":
						parsed.steps.push(parseMapExpression(section.inner));
						break;
					default:
						if (section.inner.length > 0)
							console.warn("malformed address, text outside of square brackets " + inQuotes(raw));

						break;
				}
			}



		} else {
			//malformed
			console.warn("malformed address " + inQuotes(raw));
		}
	}

	// split into . and [] notation
	// ie foo.bar[baz[5].foo]
	return parsed;
}


// Map expressions
//   can be functions foo(bar, 7, x)
//   or operator trees ++x, 9^x
//   or variables/paths foo, foo/bar foo.bar[x+5]
//   or numbers -3.44e3
//   or booleans
//   or strings "foo"
//   POSSIBLE: if statements?
function parseMapExpression(raw, sections) {
	if (!raw) {
		//console.warn("Non existant expression");
		return undefined;
	}

	raw = raw.trim();

	var parsed = {
		raw: raw,
		type: "expression",
	};


	// If no sections provided, parse the raw into a list of operators 
	if (sections === undefined) {
		var sections = splitOnUnprotected(raw, expressionOperators, true, openChars, closeChars);
		sections = sections.map(s => isString(s) ? s.trim() : s).filter(s => s !== "");
	}

	if (sections.length === 0) {
		return undefined;
	}


	// No operators: is a number, boolean, string, function, or path
	//  Or is in parenthesis
	if (sections.length === 1) {
		// foo, (foo), or foo()
		var parenSections = splitIntoTopSections(raw, "(", {
			openChars: openChars,
			closeChars: closeChars
		});


		if (parenSections.length > 2 || parenSections.length > 1 && parenSections[1].depth === 0) {
			console.warn("malformed expression " + inQuotes(raw));
			return undefined;
		}

		// only contains in parenthesis
		if (parenSections[0].depth === 1 && parenSections.length === 1) {
			return parseMapExpression(raw.substring(1, raw.length - 1));
		}


		return parseMapValue(raw);
	}


	// Operator found!
	// figure out binops and monops (lhs and rhs)
	// eg. foo*-1, foo++, ++foo, bar - -foo
	var hasLHS = false;
	for (var i = 0; i < sections.length; i++) {
		if (sections[i].splitterIndex !== undefined) {
			//console.log("test for monop " + hasLHS + " " + sections[i].splitter);
			if (!hasLHS) {
				// left-side monop
				sections[i].isMonop = "left";
				//console.log("MONOP");
				sections[i].splitterIndex = 99;
			}
			hasLHS = false;
		} else {
			hasLHS = true;
		}
	}

	var bestPriority = 9999;
	var centerIndex;

	if (sections.length === 0)
		return null;
	if (sections.length === 1)
		return sections[0];

	for (var i = 0; i < sections.length; i++) {

		var priority = sections[i].splitterIndex;
		//	console.log(bestPriority + " " + priority);

		if (priority !== undefined && priority < bestPriority) {
			bestPriority = priority;
			//console.log("best " + sections[i].splitter);
			centerIndex = i;
		}
	}

	var op = sections[centerIndex];
	var lhs = sections.slice(0, centerIndex);
	var rhs = sections.slice(centerIndex + 1);
	var lhsRaw = expressionSectionsToString(lhs);
	var rhsRaw = expressionSectionsToString(rhs);

	parsed.operator = op.splitter;
	parsed.isMonop = op.isMonop;
	if (lhs.length > 0)
		parsed.lhs = parseMapExpression(lhsRaw, lhs);

	if (rhs.length > 0)
		parsed.rhs = parseMapExpression(rhsRaw, rhs);

	return parsed;
}

function expressionSectionsToString(sections) {
	return sections.map(s => isString(s) ? s : s.splitter).join(" ");
}


function parseMapAction(raw) {
	if (!raw)
		return undefined;

	var parsed = {
		raw: JSON.stringify(raw),
		type: "action",
	};

	// Types of actions: string, obj, or array
	if (isString(raw)) {

		// Parse a parentheses-wrapped string action
		if (isInParentheses(raw)) {
			return parseMapAction(raw.substring(1, raw.length - 1));
		}

		// Say shorthand
		if (isInQuotes(raw)) {
			parsed.rule = raw.substring(1, raw.length - 1);
			parsed.actionType = "output";
			return parsed;
		}

		// Push state command
		if (raw[0] === "*") {
			parsed.actionType = "push";
			parsed.pushTarget = raw.substring(1);
			return parsed;
		}

		// Remaining action types are expressions, 
		//   either plain expressions (like x<5, foo(bar))
		//   Or 'setter' expressions

		// action for var in array
		var forSections = splitOnUnprotected(raw, " for ", false, openChars, closeChars);
		if (forSections.length > 1) {

			var s2 = splitOnUnprotected(forSections[1], " in ", false, openChars, closeChars);
			parsed.actionType = "forEach";

			parsed.key = s2[0].trim();
			parsed.action = forSections[0];
			parsed.source = parseMapPath(s2[1].trim());
			return parsed;
		}

		parsed.actionType = "expression";
		var sections = splitOnUnprotected(raw, actionOperators, true, openChars, closeChars);

		// No action operators found, must be a fxn or variable
		if (sections.length === 1) {
			parsed.expression = parseMapExpression(raw);


		} else {
			if (sections.length < 3 || sections.length > 3) {
				console.log("unclear action expression: " + inQuotes(raw));
			}
			parsed.actionType = "setter";
			parsed.target = parseMapPath(sections[0]);
			parsed.operator = sections[1].splitter;
			parsed.expression = parseMapExpression(sections[2]);



			return parsed;
		}

	}

	if (Array.isArray(raw)) {
		return raw.map(parseMapAction);

	} else {
		// obj
		return parsed;
	}


}


// Condition types
//  "yes" -> the literal string 'yes'
//  "#yes#" -> strings that can be generated with the tracery grammar 
//  "#yes# $color$" -> 
//  "color"
// x = index where (egg/index/color == INPUT)""  -> find all values of index, and return

function parseMapCondition(raw) {
	if (!raw) {
		console.warn("empty condition");
		return undefined;
	}

	var parsed = {
		raw: JSON.stringify(raw),
		type: "condition",
	};

	// Does this have a semicolon?
	var sides = splitOnUnprotected(raw, ":", false, openChars, closeChars);
	if (sides.length === 1) {
		if (isInQuotes(raw)) {
			parsed.conditionType = "input";
			parsed.rule = raw.substring(1, raw.length - 1);
		} else {
			parsed.conditionType = "expression";
			parsed.expression = parseMapExpression(raw);
		}
	} else {
		// wait:1 input:1, etc
		parsed.conditionType = "value";
		parsed.target = sides[0];
		parsed.expression = parseMapExpression(sides[1]);

	}

	return parsed;
}

// Either a plain string "origin"
// or a dynamic target state_(foo) TODO
function parseMapTarget(raw) {
	if (!raw)
		return undefined;

	var parsed = {
		raw: raw,
		type: "target",
	};
	return parsed;
}


function parseState(raw, key) {
	var parsed = {
		raw: JSON.stringify(raw),
		type: "state",
		chips: raw.chips,
		key: key,
		exits: [],
		onEnter: [],
		onExit: []
	};

	if (raw.onEnter) {

		// Kinds of onEnter actions
		// array, single string
		// create:egg(5,2)
		var actionsRaw = raw.onEnter;
		if (isString(actionsRaw)) {
			actionsRaw = splitOnUnprotected(raw.onEnter, " ", false, openChars, closeChars).filter(s => s.trim().length > 0);
		}

		parsed.onEnter = actionsRaw.map(function(s) {
			return parseMapAction(s);
		});

	}

	// Add sugared actions
	// Shorthands for say, etc
	if (raw.onEnterSay !== undefined) {
		if (isString(raw.onEnterSay))
			raw.onEnterSay = [raw.onEnterSay];
		var s = raw.onEnterSay.map(s => parseMapAction(inQuotes(raw.onEnterSay)));
		parsed.onEnter = parsed.onEnter.concat(s);
	}

	// Sugared on-enter actions
	if (raw.onEnterDoOne !== undefined) {

		var fallDown = {
			type: "action",
			actionType: "doOne",
			options: []
		};

		for (var i = 0; i < raw.onEnterDoOne.length; i++) {
			var todo = splitOnUnprotected(raw.onEnterDoOne[i], " ", false, openChars, closeChars);
			if (todo.length === 1) {
				fallDown.options.push({
					action: parseMapAction(todo[0]),
				});
			} else {
				fallDown.options.push({
					condition: parseMapCondition(todo[0]),
					action: parseMapAction(todo[1]),
				});
			}

		}

		parsed.onEnter.push(fallDown);
	}


	if (raw.exits) {
		if (isString(raw.exits))
			raw.exits = [raw.exits];
		parsed.exits = raw.exits.map(parseExit);
	}

	if (raw.onEnterFxn) {
		parsed.onEnterFxn = raw.onEnterFxn;
	}

	return parsed;
}

// Unique ids for exits (states have unique ids already)
var exitCount = 0;

// Parse an exit
// Exits take the form "condition ->target "
function parseExit(raw) {
	if (!raw)
		return undefined;


	var parsed = {
		raw: JSON.stringify(raw),
		type: "exit",
		key: "exit" + exitCount++,
	};


	if (Array.isArray(raw)) {
		return raw.map(parseExit);
	}

	if (isString(raw)) {
		// Split on the target ->
		var sections = splitOnUnprotected(raw, "->", false, openChars, closeChars);

		// No arrow found, not a real exits?
		if (sections.length === 1) {
			controls.addError("No exit location provided for exit " + inQuotes(raw) + ", are you missing a '->'?");
		} else {

			// Actions
			var rawConditions = splitOnUnprotected(sections[0], " ", false, openChars, closeChars).filter(s => s.trim() !== "");
			
			var s1 = splitOnUnprotected(sections[1], " ", false, openChars, closeChars);
			var rawActions = s1.slice(1).filter(s => s.trim() !== "");
			var rawTarget = s1[0]

			parsed.actions = rawActions.map(parseMapAction);
			parsed.conditions = rawConditions.map(parseMapCondition);
			// remove conditions from priority and move to its own thing
			parsed.conditions = parsed.conditions.filter(function(cond) {
				if (cond.target === "priority") {
					parsed.priority = cond.expression;
					return false;
				}
				return true;
			})
			parsed.target = parseMapTarget(rawTarget);
		}
	}

	return parsed;
}

function parseMap(raw) {
	if (!raw)
		return undefined;

	var parsed = {
		raw: JSON.stringify(raw),
		type: "map",
		grammar: raw.grammar,
		exits: [],
		states: [],
		contentRecipes: raw.contentRecipes,
		initialBlackboard: raw.initialBlackboard
	};

	if (raw.exits) {
		parsed.exits = raw.exits.map(function(rawExit) {
			return parseExit(rawExit);
		});
	}

	if (raw.states) {
		parsed.states = {};

		$.each(raw.states, function(key, rawState) {
			parsed.states[key] = parseState(rawState, key);
		});

	}



	return parsed;
}


function performAction(action, pointer) {
	if (!pointer)
		console.warn("No pointer");


	switch (action.actionType) {
		case "doOne":
			console.log("DO ONE")
			for (var i = 0; i < action.options.length; i++) {
				var opt = action.options[i];
				var valid = true;
				if (opt.condition) {

					valid = evaluateCondition(opt.condition, pointer);
					console.log(opt.condition.raw + " " + valid);
				}

				if (valid) {
					console.log("select action", opt.action);
					performAction(opt.action, pointer);
					break;
				}
			}

			break;
		case "forEach":

			var arr = pointer.get(action.source);
			var keys = Object.keys(arr.children);
			var path2 = action.source.raw;
			keys.forEach(function(key) {
				performAction(parseMapAction(action.action), pointer, arr.children[key]);
			});


			break;
		case "setter":
			var v0, v1;
			if (action.operator !== "=")
				v0 = pointer.get(action.target);

			if (action.expression)
				v1 = evaluateExpression(action.expression, pointer);
			var v2;



			switch (action.operator) {
				case "++":
					v2 = v0 + 1;
					break;

				case "-=":
					v2 = v0 - v1;
					break;

				case "+=":
					v2 = v0 + v1;
					break;

				case "=":
					v2 = v1;
					break;
				default:
					console.warn("Unknown action operator: " + inQuotes(action.operator));
			}

			pointer.set(action.target, v2);


			break;

		case "expression":
			var v = evaluateExpression(action.expression, pointer);

			break;

		case "output":



			//s = pointer.grammar.flatten(s);
			io.output(pointer.flatten(action.rule));

			break;
		default:
			console.warn("unkown action type " + action.actionType, action);
			break;
	}


}

function evaluateExpression(node, pointer) {
	if (!pointer)
		console.warn("No pointer");
	if (node === undefined || node === null) {
		console.warn("no expression");
		return undefined;
	}
	if (pointer === undefined || pointer === null) {
		console.warn("no pointer");
	}



	// Constants
	if (node.type === "number" || node.type === "boolean" || node.type === "text") {

		if (node.type === "text")
			return pointer.flatten(node.value);
		return node.value;
	}

	if (node.type === "path") {
		var val = pointer.get(node);

		if (node.isFunction) {
			var params = node.parameters.map(s => evaluateExpression(s, pointer));
			if (!val) {

			} else {
				return val.apply(pointer, params);
			}
			return undefined;
		} else
			return val;
	}

	var lhs, rhs;
	if (node.lhs === undefined) {
		if (node.operator === "-") {
			node.operator = "NEG"
		}
	} else {
		lhs = evaluateExpression(node.lhs, pointer);
	}
	rhs = evaluateExpression(node.rhs, pointer);

	switch (node.operator) {
		case "NEG":
			return -rhs;
		case "+":
			return lhs + rhs;
		case "-":
			return lhs - rhs;
		case "*":
			return lhs * rhs;
		case "/":
			return lhs / rhs;
		case "%":
			return lhs % rhs;
		case "^":
			return Math.pow(lhs, rhs);
		case "<":
			return lhs < rhs;
		case ">":
			return lhs > rhs;
		case ">=":
			return lhs >= rhs;
		case "<=":
			return lhs <= rhs;
		case "!=":
			return lhs !== rhs;
		case "==":
			return lhs === rhs;
		case "&&":
			return lhs && rhs;

		case "||":
			return lhs || rhs;
		default:
			console.warn("unknown op " + node.operator);
	}
}

function evaluateCondition(condition, pointer) {
	if (condition === undefined) {
		console.warn("missing condition");
		return false;
	}

	switch (condition.conditionType) {
		case "expression":
			return evaluateExpression(condition.expression, pointer);
			break;
		case "input":
			// May be a rule, or an array
			// 'restart', '#color#', []

			//console.log("test input " + pointer.lastInput + condition.rule);
			// TODO more sophisticated input evaluation

			if (condition.rule === "*") {
				return pointer.lastInput !== undefined && pointer.lastInput.length > 0;
			}

			if (condition.rule === "NUMBER") {
				return !isNaN(parseFloat(pointer.lastInput))
			}
			return pointer.lastInput === condition.rule;

		case "value":
			switch (condition.target) {
				case "wait":
					return pointer.timeInState > evaluateExpression(condition.expression, pointer)
					break;
				default:
					console.warn("unknown value condition: " + condition.target);
			}

			break;
		default:
			console.log("Unknown condition type " + inQuotes(condition.conditionType));
			break
	}


}
