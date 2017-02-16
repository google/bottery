// Actions may be stack actions	foo:bar,baz
// or rule generators			range(0, 10 50)
//								join(animal,', ')
//								animal
//								/names/english/victorian/female


//http://jsfromhell.com/array/shuffle
function shuffle(a) {
	var j, x, i;
	for (i = a.length; i; i--) {
		j = Math.floor(Math.random() * i);
		x = a[i - 1];
		a[i - 1] = a[j];
		a[j] = x;
	}
}

function toCamelCase(str) {

	str = str.replace(/[.,'"-:;?]/g, "");
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
		if (+match === 0) return "";
		return index == 0 ? match.toLowerCase() : match.toUpperCase();
	});
}


function parseAction(s) {
	s = s.trim();


	var sections = splitOnUnprotected(s, [":", "::"], true, "[{('\"", "]})'\"");
	if (sections.length === 1)
		return parseRuleGenerator(s);
	return parseStackAction(s, sections);

}

function parseStackAction(s, sections) {
	// Parse stack action
	var parsed = {
		type: "stackAction",
		subtypes: [""],
		raw: s,
		errors: [],
	};

	if (sections.length > 3) {
		parsed.errors.push("Too many operators in stack action" + inQuotes(s));
		return parsed;
	}

	parsed.address = parseAddress(sections[0], {
		type: "symbol"
	});
	parsed.operator = sections[1].splitter;
	// detect sugared rules [foo:bar, woz, whiz] 
	// or proper generator [foo:["bar", "baz"]]

	var s2 = sections[2].trim();
	// Check for reserved words: "CLEAR", "POP"
	if (s2 === "CLEAR" || s2 === "POP") {
		parsed.command = s2;
	} else {
		if (s2.charAt(0) === "[" && s2.charAt(s2.length - 1) === "]") {
			parsed.ruleGenerator = parseRuleGenerator(s2.substring(1, s2.length - 1));
		} else {
			// sugared!
			var rules = splitOnUnprotected(s2, ",");
			var rulesProtected = rules.map(function(rule) {
				return "'" + rule + "'";
			});


			parsed.ruleGenerator = parseRuleGenerator(rulesProtected.join(","));
		}
	}

	return parsed;

}


// Like an action, but might be a comma-separated array
// 	functions 		[map("I love #PARAM_0#",foo)]
// 	 				[join(map("[x:PARAM_0][y:[random(0,100)]] #drawFlower#",range(0,10,11)), "<br>")]
// 	 				[range(0,10,11)]
//					[filter(animal,rhymesWith("#rhymeScheme#"))]
//					[random(0,100)]
//					[/player/gameEventHandler()]
//	lists of rules	["foo","bar",animal,/player/name,random(0,10)]
//	if statements	[if (condition) [action] else [other action]]
function parseRuleGenerator(s) {

	s = s.trim();
	var parsed = {
		type: "ruleGenerator",
		subtypes: [],
		errors: [],
		raw: s,
	};



	// Concatenation
	var sections = splitOnUnprotected(s, ",");
	if (sections.length > 1) {
		console.log("Concatenation", s);
		parsed.rgType = "rg-concatenation"
		parsed.concatenateRules = sections.map(function(s) {

			// Deal with sugar? TODO
			var s2 = parseExpression(s);
			console.log(s2);
			return s2;
		});
		return parsed;
	}


	// Detect "for" constructors
	var forSections = splitOnUnprotected(s, [" for "]);
	if (forSections.length > 1) {

		parsed.rgType = "rg-for";
		parsed.templateExpression = parseExpression(forSections[0]);

		parsed.loops = [];

		for (var i = 1; i < forSections.length; i++) {
			var parts = splitOnUnprotected(forSections[i], " in ");
			var key = parseAddress(parts[0]);
			var source = parseRuleGenerator(parts[1]);
			parsed.loops.push({
				key: key,
				source: source,
			});

		}
		console.log("FOR", parsed);
		return parsed;
	}

	// Single rule
	if (isInQuotes(s)) {
		parsed.rule = parseRule(s.substring(1, s.length - 1), true);

		parsed.rgType = "rg-rule";
		return parsed;
	}


	// Square brackets
	if (isInSquareBrackets(s)) {
		return parseRuleGenerator(s.substring(1, s.length - 1));
	}

	// Square brackets
	if (isInPipes(s)) {
		parsed.isFunction = parsed.address.isFunction;
		parsed.rgType = "rg-address"
		return parsed;
	}


	// [foo] a rule generator for foo
	// [foo + 5] the value of foo plus 5
	// [|foo|]
	// In parenthesis 
	if (isInParentheses(s)) {
		return parseExpression(s.substring(1, s.length - 1));
	}

	return parseExpression(s);



}



// Return an address object
// "foo": symbol key
// "/foo": object address
// May have internal rule identifiers /{#foo#}/bar
// May be a function "foo(bar,#baz#)"
// The difference between a key and a function is contextual not syntactic (ie, for modifiers)


function parseAddress(s, context) {

	s = s.trim();
	if (s.length === 0) {
		console.log("empty address");
		return undefined;
	}

	var path = splitOnUnprotected(s.substring(0), "/");
	if (path.length > 1) {
		return parsePathAddress(s, path, context);
	}

	// Identify dynamic sections {}
	// Identify functions and parameters "foo()" or keys "foo"
	else {
		var parsed = {
			type: "address",
			context: context,
			raw: s,
			errors: []
		};

		var sections = splitIntoTopSections(s, "{(");

		var keySections = [];
		for (var i = 0; i < sections.length; i++) {
			var s2 = sections[i];
			switch (s2.openChar) {
				case "{":
					parsed.isDynamic = true;
					keySections.push(parseTag(s2.inner, true));
					if (parsed.isFunction) {
						errors.push("Text after function parenthesis:" + inQuotes(s));
					}
					break;
				case "(":
					// if occurs last, this is a function
					parsed.isFunction = true;
					parsed.parameters = splitOnUnprotected(s2.inner, ",").map(function(rawParam) {
						return parseExpression(rawParam);
					});
					break;
				default:
					keySections.push(s2.inner);
					if (parsed.isFunction) {
						parsed.errors.push("Text after function parenthesis:" + inQuotes(s));
					}
					break;
			}
		}

		if (!parsed.isDynamic) {
			parsed.keyType = "static";
			parsed.key = keySections.join("");
		} else {
			parsed.keyType = "dynamic";
			parsed.dynamicSections = keySections;
		}

		if (!parsed.isFunction && parsed.context !== "pathSegment") {
			parsed.isSymbolKey = true;
		}

		return parsed;
	}


}


// Parse an address containing slashes:
//  /foo/bar 
//  /{#foo#}/bar
//  /foo()/bar()

function parsePathAddress(s, pathSections, context) {
	var parsed = {
		type: "address",
		raw: s,
		context: context,
		errors: []
	};

	parsed.path = [];

	// Is the first step empty?  
	//  are we starting with /foo, or foo/.. ?

	if (pathSections[0].length !== 0) {
		// Relative to something from the stacks
		var p = parseAddress(path[i], "pathSegment");
		parsed.path.push(p);
	}

	for (var i = 1; i < pathSections.length; i++) {
		var p = parseAddress(pathSections[i], "pathSegment");
		parsed.path.push(p);
	}

	return parsed;

}



// Parse an expression
// May be 4 + foo() + bar + '#foo#'
// may be "foo"
// If in [], treat as ruleGenerator
// If in quotes, treat as a rule
// If in () or otherwise, treat as expression?  range(0, #foo#, #foo# + #bar#)
function parseExpression(raw) {
	var openChars = "{([#'\"";
	var closeChars = "})]#'\"";
	raw = raw.trim();


	var indices = getUnprotectedIndices(raw, [" if ", "==", "!=", "<=", ">=", "<", ">", "+", "-", "*", "/", "%", "^"], openChars, closeChars);


	// Create an expression tree
	if (indices.length > 0) {

		var parsed = {
			type: "expression",
			raw: raw,
			errors: []
		};

		var priority = 999;
		var splitter;
		for (var i = 0; i < indices.length; i++) {
			if (indices[i].queryIndex < priority) {
				splitter = indices[i];
				priority = splitter.queryIndex;
			}
		}

		// (bar) if (foo) else if (foo) else if (bar) else (boo);
		if (splitter.query === " if ") {
			var postIf = raw.substring(splitter.index + splitter.query.length);

			parsed.expressionType = "if";
			parsed.trueValue = parseExpression(raw.substring(0, splitter.index));

			var elseIndexes = getUnprotectedIndices(postIf, " else ", openChars, closeChars);
			if (elseIndexes.length > 0) {

				var elseIndex = elseIndexes[0].index;

				var condRaw = postIf.substring(0, elseIndex);
				var elseRaw = postIf.substring(elseIndex + " else ".length);
				parsed.condition = parseExpression(condRaw);
				parsed.elseValue = parseExpression(elseRaw);
			} else {
				parsed.condition = parseExpression(postIf);
			}
		} else {
			// NON-IF expression splitter
			// TODO, disambiguate ! and -
			parsed.expressionType = "operator";
			parsed.operator = {
				finished: splitter.query,
				type: "op",
			};


			var lhs = raw.substring(0, splitter.index).trim();
			var rhs = raw.substring(splitter.index + splitter.query.length).trim();


			if (parsed.operator.finished === "-" && lhs === "") {
				parsed.operator.finished = "NEG";
			}
			parsed.lhs = parseExpression(lhs);
			parsed.rhs = parseExpression(rhs);
		}


		return parsed;


	} else {

		// Single expression
		var sections = splitIntoTopSections(raw, "|[('\"#", {
			openChars: openChars,
			closeChars: closeChars
		});
		if (sections.length === 0) {
			//console.warn("Empty sections");
			return undefined;
		}

		// Function
		if (sections.length > 1) {
			return parseAddress(raw, "expressionFunction");
		} else {
			var c = sections[0].openChar;
			var inner = sections[0].inner;

			switch (c) {
				case "'":
					return parseRule(inner);

				case "\"":
					return parseRule(inner);

				case "#":
					return parseTag(inner);

				case "[":
					return parseRuleGenerator(inner);

				case "(":
					return parseExpression(inner);


				case undefined:
					// Bare
					var v = parseFloat(inner);
					if (!isNaN(v)) {
						return {
							type: "number",
							finished: v
						}
					} else {
						// Assume a key?
						return parseTag(inner);
					}

				default:
					console.warn("Unknown expression type " + inQuotes(raw));
			}
		}
	}

	console.warn("Unknown expression type " + inQuotes(raw));
}

function parseTag(s) {
	var parsed = {
		type: "tag",
		modifiers: [],
		errors: [],
		raw: s,

	}

	var s2 = splitIntoTopSections(s, "[", {
		openChars: "[({\"'",
		closeChars: "])}\"'"
	});

	var inner;

	// Split into the address and any actions
	for (var i = 0; i < s2.length; i++) {
		if (s2[i].depth > 0) {
			if (inner !== undefined)
				parsed.postactions.push(parseAction(s2[i].inner, parsed));
			else
				parsed.preactions.push(parseAction(s2[i].inner, parsed));
		} else {
			if (inner !== undefined) {
				console.warn("multiple addresses in tag: " + s2[i].inner + " " + inner);
			}
			inner = s2[i].inner;
		}
	}

	var s3 = splitOnUnprotected(inner, ".");
	if (isInQuotes(s3[0])) {
		//console.log(s, s3);
		parsed.address = parseRule(s3[0].substring(1, s3[0].length - 1));
	} else {
		// An address to either a symbol stack or a function or an object pathaddress
		parsed.address = parseAddress(s3[0]);
	}

	// Parse all the modifiers
	parsed.modifiers = s3.slice(1).map(function(modifierRaw) {


		return parseAddress(modifierRaw, "modifier");
	});

	// Parse the address
	return parsed;
}

function parseRule(rawRule, protected) {
	nodeParses++;

	if (rawRule.search(/[#\{\(\[]/) < 0) {
		var val = parseFloat(rawRule);
		if (!isNaN(val)) {
			return {
				type: "number",
				finished: val
			}
		} else {
			return {
				type: "text",
				finished: rawRule
			}
		}
	}
	var rule = {

		raw: rawRule,
		type: "rule",

	};



	// Non-string rule!
	if (!isString(rawRule)) {
		console.warn("non-string rule");
		rule.nonString = true;
		return rule;
	}

	var baseLevelIgnore = "(\"'";

	if (protected)
		baseLevelIgnore = "";

	var openChars = "[{#'\"";
	var closeChars = "]}#'\"";
	if (protected) {
		openChars = "[{(#'\"";
		closeChars = "]})#'\"";
	}

	rule.sections = splitIntoTopSections(rawRule, openChars, {
		openChars: openChars,
		closeChars: closeChars,
		baseLevelIgnore: baseLevelIgnore
	}).map(function(section) {

		switch (section.openChar) {

			// Protected:
			//  Treat the stuff inside like plaintext "([foo])"

			// A protected section
			case "(":
				rule.wasProtected = true;

				return {
					type: "text",
					finished: section.inner,
					raw: section.inner
				}
				break;

				// A tag section
			case "#":
				return parseTag(section.inner, rule);
				break;

				// An action section
			case "[":

				return parseAction(section.inner, rule);
				break;

				// A Text section
			case undefined:
				{
					return {
						type: "text",
						finished: section.inner

					};
				}
			default:
				console.warn("Unknown " + section.openChar);
		}
	});



	return rule;
}


/*=======================================================================================
 *
 * Abstract general-purpose parsing methods
 */



function splitIntoTopSections(s, sectionTypes, settings) {
	if (!settings)
		settings = {};
	if (!isString(s))
		console.warn("non-string", s);

	var sections = [];
	sections.errors = [];
	var start = 0;
	parseProtected(s, {
		baseLevelIgnore: settings.baseLevelIgnore,
		openChars: settings.openChars,
		closeChars: settings.closeChars,

		onCloseSection: function(section) {

			var isTopSection = section.depth === 1 && (sectionTypes === undefined || sectionTypes.indexOf(section.openChar) >= 0);

			if (isTopSection) {
				var topSection = section;
				start = section.end + 1;
				sections.push(topSection);


			} else {

			}
		},

		onOpenSection: function(section) {
			if (section.depth === 1 && (sectionTypes === undefined || sectionTypes.indexOf(section.openChar) >= 0)) {

				// Make a base-level section from the last section to the start of this one
				var topSection = {

					depth: 0,
					start: start,
					end: section.start,
					inner: s.substring(start, section.start)
				};
				start = section.start;
				sections.push(topSection);
			}
		},

		error: function(error) {
			sections.errors.push(error);
		}
	});

	sections.push({
		depth: 0,
		start: start,
		end: s.length,
		inner: s.substring(start)
	});


	sections = sections.filter(function(s) {
		if (!settings.ignoreEmptySections && s.depth > 0)
			return true;
		return s.inner.length > 0;
	})


	return sections;
}



function splitOnUnprotected(s, splitters, saveSplitters, openChars, closeChars) {
	if (s.length === 0)
		return [];
	if (typeof splitters === 'string' || splitters instanceof String)
		splitters = [splitters];
	var sections = [];
	var lastSplitterEnd = 0;

	parseProtected(s, {
		openChars: openChars,
		closeChars: closeChars,
		onChar: function(c, index, depth) {

			// If at an unprotected level, 
			// *and* we're no longer in a splitter (for ambiguous splitters like "::" and ":")
			// This uses a greedy algorithm, so might miss 'optimal' splits
			if (depth === 0 && index >= lastSplitterEnd) {
				var splitter = undefined;

				// Find the longest valid splitter
				var maxLength = 0;
				for (var i = 0; i < splitters.length; i++) {

					var s2 = splitters[i];
					if (s.startsWith(s2, index) && s2.length > maxLength) {
						splitter = {
							splitterIndex: i,
							index: index,
							splitter: s2,
						}
						maxLength = s2.length;
					}
				}

				if (splitter) {
					var s3 = s.substring(lastSplitterEnd, index);
					sections.push(s3);
					lastSplitterEnd = index + splitter.splitter.length;

					// Add the splitter to the array if we want to record it
					if (saveSplitters) {
						sections.push(splitter);
					}
				}


			}
		},
	})
	sections.push(s.substring(lastSplitterEnd));
	return sections;
}


/*
 * Get indices of unprotected
 * Find each unprotected query
 */

function getUnprotectedIndices(s, queries, openChars, closeChars) {
	if (typeof queries === 'string' || queries instanceof String)
		queries = [queries];
	var indices = [];
	var start = 0;

	parseProtected(s, {
		openChars: openChars,
		closeChars: closeChars,
		onChar: function(c, index, depth) {
			if (index >= start && depth === 0) {
				for (var i = 0; i < queries.length; i++) {
					if (s.startsWith(queries[i], index)) {
						indices.push({
							index: index,
							query: queries[i],
							queryIndex: i,
						});
						start = index + queries[i].length;

						break;
					}

				}
			}
		}
	});

	return indices;
}



// Hero function
// Runs all the parsing stuff
function parseProtected(s, settings) {

	// Defaults
	var openChars = settings.openChars ? settings.openChars : "[({#\"'";
	var closeChars = settings.closeChars ? settings.closeChars : "])}#\"'";
	var baseLevelIgnore = settings.baseLevelIgnore ? settings.baseLevelIgnore : "";

	/*
		console.log("IgnoreInside: " + baseLevelIgnore);
		console.log("CloseChars: " + closeChars);
		console.log("OpenChars: " + openChars);
	*/

	var depth = [];
	var escaped = false;

	for (var i = 0; i < s.length; i++) {
		if (escaped) {
			escaped = false;
		} else {
			var c = s.charAt(i);
			if (c === "\\")
				escaped = true;
			else {

				// Top priority: close an open section
				if (depth.length > 0 && depth[depth.length - 1].closeChar === c) {
					var finished = depth.pop();
					finished.end = i;
					finished.inner = s.substring(finished.start + 1, finished.end);

					if (settings.onCloseSection)
						settings.onCloseSection(finished);
				} else {
					var openIndex = openChars.indexOf(c);


					var top = depth[depth.length - 1];

					var ignore = depth.length === 0 && baseLevelIgnore.indexOf(c) > -1;

					var pastMaxDepth = settings.maxDepth && (depth.length < settings.maxDepth);

					// Ignoring everything in here until the close character is reached
					if (pastMaxDepth || ignore) {


						if (settings.onChar)
							settings.onChar(c, i, depth.length, s);
					} else {
						// Is this also a closing character?  what does it close?
						var closeIndex = closeChars.indexOf(c);

						if (openIndex < 0 && closeIndex >= 0) {
							if (settings.onError)
								settings.onError("Unmatched " + inQuotes(c) + " at " + i);
						}

						// open a new section
						if (openIndex >= 0) {

							var section = {
								openChar: openChars[openIndex],
								closeChar: closeChars[openIndex],
								start: i,
								depth: depth.length + 1,
								type: openIndex,
							}



							depth.push(section);
							var top = depth[depth.length - 1];



							if (settings.onOpenSection) {
								settings.onOpenSection(section);
							}
						} else {


							if (settings.onChar)
								settings.onChar(c, i, depth.length, s);
						}
					}
				}
			}
		}
	}

	if (settings.onError) {
		for (var i = 0; i < depth.length; i++) {
			settings.onError("Unmatched " + inQuotes(depth[i].openChar) + " at " + depth[i].start);
		}
	}

	if (settings.onEnd)
		settings.onEnd(depth);

}


function isInQuotes(s) {
	return (s.charAt(0) === "'" && s.charAt(s.length - 1) === "'") || (s.charAt(0) === '"' && s.charAt(s.length - 1) === '"')
}

function isInSquareBrackets(s) {
	return (s.charAt(0) === "[" && s.charAt(s.length - 1) === "]")
}

function isInParentheses(s) {
	return (s.charAt(0) === "(" && s.charAt(s.length - 1) === ")")
}

function isInPipes(s) {
	return (s.charAt(0) === "|" && s.charAt(s.length - 1) === "|")
}


function isString(s) {
	return (typeof s === 'string' || s instanceof String);
}

function getFinished(s) {
	if (typeof s === 'string' || s instanceof String)
		return s;
	return s.finished;
}

function getRandom(arr) {
	return arr[Math.floor(arr.length * Math.random())];
}

function inQuotes(s) {
	return '"' + s + '"';
}

function inSingleQuotes(s) {
	return "'" + s + "'";
}


function inTags(s) {
	return '#' + s + '#';
}

function inCurlyBrackets(s) {
	return '{' + s + '}';
}

function inSquareBrackets(s) {
	return '[' + s + ']';
}

function inParens(s) {
	return '(' + s + ')';
}

function tabSpacer(count) {
	var s = "";
	for (var i = 0; i < count; i++) {
		s += "\t"
	}
	return s;
}


// For testing
function buildOpTree(binOps, monOps, fxnNames, varNames, lvl) {
	if (!lvl)
		lvl = 0;
	if (lvl >= 3 || (Math.random() + .2 * lvl > 1.2)) {

		return getRandom(varNames);
	}

	if (Math.random() > .6) {
		return getRandom(fxnNames) + inParens(buildOpTree(binOps, monOps, fxnNames, varNames, lvl + 1));
	}

	var s;
	if (Math.random() > .4) {
		var lhs = buildOpTree(binOps, monOps, fxnNames, varNames, lvl + 1);
		var rhs = buildOpTree(binOps, monOps, fxnNames, varNames, lvl + 1);
		var op = getRandom(binOps);
		s = lhs + " " + op + " " + rhs;

	} else {
		var rhs = buildOpTree(binOps, monOps, fxnNames, varNames, lvl + 1);
		var op = getRandom(monOps);
		s = op + "" + rhs;
	}
	if (Math.random() > .6) {
		s = "(" + s + ")";
	}
	return s;
}



function treeToString(tree) {
	if (tree == undefined)
		return "";
	if (tree.op) {
		return inParens(treeToString(tree.lhs) + tree.op + treeToString(tree.rhs));
	}
	if (tree.fxn) {
		return tree.fxn + inParens(tree.params.map(treeToString).join(","));
	}
	return tree;
}