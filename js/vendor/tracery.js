/*
Copyright 2017 Kate Compton

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var tracery = (function() {

	var nodeExpansions = 0;
	var nodeParses = 0;

	function TraceryGrammar(raw) {

		var rawSymbols = raw;


		this.symbols = {};
		this.modifiers = {};
		// Complex raw (with settings)
		if (raw.symbols !== undefined) {
			rawSymbols = raw.symbols;
		}

		for (var key in rawSymbols) {
			if (rawSymbols.hasOwnProperty(key)) {

				// Wrap in an array if neccessary
				if (!Array.isArray(rawSymbols[key]))
					this.symbols[key] = [rawSymbols[key]];
				else
					this.symbols[key] = rawSymbols[key].slice(0);
			}
		}

	};

	TraceryGrammar.prototype.addModifiers = function(mods) {
		for (var key in mods) {
			if (mods.hasOwnProperty(key)) {
				this.modifiers[key] = mods[key];
			}
		}

	};

	TraceryGrammar.prototype.getFunction = function(key, isModifier) {

		if (isModifier)
			return this.modifiers[key];

		if (this.functions) {
			if (this.functions[key] !== undefined)
				return this.functions[key];

		}

		// fall back to modifiers
		if (this.modifiers[key] !== undefined)
			return this.modifiers[key];

		// Return a wrapped version of the math fxn
		if (Math[key] !== undefined) {

			return function() {
				return Math[key].apply(null, Array.from(arguments).map(function(arg) {
					return parseFloat(arg)
				}));

			}
		}

	};



	TraceryGrammar.prototype.setSymbol = function(key, rules) {
		this.symbols[key] = rules;
	}

	TraceryGrammar.prototype.getActiveRuleset = function(key, context) {
		var stack = context.stacks[key];
		if (stack)
			return stack[stack.length - 1];
		else
			return this.symbols[key];
	};


	TraceryGrammar.prototype.pushRules = function(key, rules, context) {

		if (rules === undefined) {
			console.warn("Pushing non-existant rules");
		}


		if (!Array.isArray(rules))
			rules = [rules];

		if (rules.filter(s => isNaN(s) || s === undefined).length > 0) {
			console.warn("Contains bad rules: " + rules);
		}

		if (!context.stacks[key])
			context.stacks[key] = [];


		context.stacks[key].push(rules);

	};

	// Stomp rules
	TraceryGrammar.prototype.setRules = function(key, rules, context) {
		context.stacks[key] = rules;

	};

	TraceryGrammar.prototype.popRules = function(key, context) {
		if (context.stacks[key] && context.stacks[key].length > 0) {
			return context.stacks[key].pop();
		}
	};


	TraceryGrammar.prototype.clearRules = function(key, context) {
		context.stacks[key] = [];
	};


	TraceryGrammar.prototype.getRule = function(rules, context) {

		// todo, shuffling

		if (!Array.isArray(rules))
			console.warn("non-array rules: ", rules);
		var index = Math.floor(Math.random() * rules.length);

		// Cache parsing of string rules
		// Replace the plaintext rule with a parsed version
		if (isString(rules[index])) {
			rules[index] = parseRule(rules[index]);
		}


		var templateRule = rules[index];

		// Create a new instance of this rule

		if (isString(templateRule) || !isNaN(templateRule)) {
			return templateRule;
		}

		// Deep clone
		if (templateRule === undefined) {
			console.warn("undefined rule", rules);
			return undefined;
		}
		var rule = jQuery.extend(true, {}, templateRule);

		return rule;
	};

	TraceryGrammar.prototype.expand = function(rule, context) {
		var protected = false;
		if (context && context.protected)
			protected = true;
		var node = parseRule(rule, protected);

		return this.expandNode(node, context);

	};


	TraceryGrammar.prototype.flatten = function(rule, context) {
		return getFinished(this.expand(rule, context));
	};



	// Expand a node
	TraceryGrammar.prototype.expandNode = function(node, context) {
		nodeExpansions++;
		var grammar = this;
		if (node === undefined) {
			throw ("empty node");
		}

		if (!context) {
			context = {};
		}

		if (context.stacks === undefined) {
			context.stacks = {};
		}

		function scrapeTags() {
			// Scrape tags 
			if (grammar.openTag && getFinished(node) !== undefined) {


				var s = getFinished(node).split(grammar.openTag);
				var tags = [];
				var text = s[0];
				for (var i = 1; i < s.length; i++) {
					var index = s[i].indexOf(grammar.closeTag);
					var tag = s[i].substring(0, index);
					tags.push(tag);

					text += s[i].substring(index + grammar.closeTag.length);
				}
				node.tags = tags;
				node.finished = text;
			}
		}

		if (isString(node)) {
			node = {
				finished: node,
				type: "text"
			}
		}



		// wrap number
		if (!isNaN(node) || isString(node) || Array.isArray(node)) {


			return;
		}
		switch (node.type) {

			case "number":
				break;

			case "text":
				scrapeTags();
				break;


			case "expression":
				switch (node.expressionType) {
					case "operator":
						var lhs, rhs;
						grammar.expandNode(node.operator, context);
						grammar.expandNode(node.rhs, context);
						if (node.lhs !== undefined) {
							grammar.expandNode(node.lhs, context);
							lhs = parseFloat(getFinished(node.lhs));
						}
						rhs = parseFloat(getFinished(node.rhs));

						var op = getFinished(node.operator);

						switch (op) {
							case "!":
								node.finished = !rhs;
								break;
							case "NEG":
								node.finished = -rhs;
								break;
							case "+":
								node.finished = lhs + rhs;
								break;
							case "-":
								node.finished = lhs - rhs;
								break;
							case "*":
								node.finished = lhs * rhs;
								break;
							case "/":
								node.finished = lhs / rhs;
								break;
							case "^":
								node.finished = lhs ^ rhs;
								break;
							case "%":
								node.finished = lhs % rhs;
								break;
							case "==":
								node.finished = lhs == rhs;
								break;
							case "!=":
								node.finished = lhs != rhs;
								break;
							case ">":
								node.finished = lhs > rhs;
								break;
							case "<":
								node.finished = lhs < rhs;
								break;
							case ">=":
								node.finished = lhs >= rhs;
								break;
							case "<=":
								node.finished = lhs <= rhs;
								break;
							default:
								console.warn("unkown operator " + inQuotes(op), node);
						}

						//	console.log(lhs + node.operator.finished + rhs + " = " + node.finished);
						break;

					case "if":
						break;

					default:
						console.warn("Unknown " + node.expressionType);

				}
				break;

			case "ruleGenerator":

				node.generatedRules = [];

				switch (node.rgType) {

					// Filter a list of nodes through a function
					case "rg-filter":
						grammar.expandNode(node.source, context);
						grammar.expandNode(node.conditions, context);
						var possibleRules = node.source.generatedRules;
						node.generatedRules = possibleRules.filter(function(rule) {
							var accepted = true;
							for (var i = 0; i < node.conditions.length; i++) {
								var cond = node.conditions[i];
								var address = cond.address;
								var key = address.key;
								// If this address is a function, run it
								if (address.isFunction) {

									var parameters = address.parameters.map(function(param) {
										grammar.expandNode(param, context);

										return getFinished(param);
									});

									// Create the parameter values for this function

									var passCondition = grammar.functions[key].call(rule, parameters);
									if (!passCondition)
										accepted = false;
								}
							}
							return accepted;
						});
						break;



						// For loops
						// For each rule value, generate the rules
					case "rg-for":


						var generatedRules = [];
						// Expand all the rules of the for loops
						for (var i = 0; i < node.loops.length; i++) {

							// Expand the key that we'll be pushing to
							grammar.expandNode(node.loops[i].key, context);
							grammar.expandNode(node.loops[i].source, context);

						}



						// For each variant in the loops, push those rules, then do all the templates, then pop
						function makeTemplates(loopIndex) {
							var loop = node.loops[loopIndex];


							// All the rules to iterate through (may be finished, or generated rules, 
							// language inconsistency TODO)

							rules = getFinished(loop.source);



							// For each possible rule, generate expansions with the other loops' values
							for (var i = 0; i < rules.length; i++) {
								var key = loop.key.key;

								grammar.pushRules(key, rules[i], context);

								// recurse
								if (loopIndex < node.loops.length - 1) {
									makeTemplates(loopIndex + 1);
								}
								// Otherwise, generate the rules
								else {


									// We're going to be filling a template, with some values
									grammar.expandNode(node.templateExpression, context);

									generatedRules.push(getFinished(node.templateExpression));
								}


								grammar.popRules(key, context);
							}


						}

						makeTemplates(0);
						node.finished = generatedRules;

						break;

						// Concatenate rule sets
					case "rg-concatenation":

						var rulesets = node.concatenateRules.map(function(ruleGenerator) {
							grammar.expandNode(ruleGenerator, context);

							return getFinished(ruleGenerator);
						});

						// Merge the arrays
						node.finished = [].concat.apply([], rulesets);
						break;

						// Parse and generate a text rule
					case "rg-rule":
						grammar.expandNode(node.rule, context);

						node.finished = [getFinished(node.rule)];
						break;

						// Generate rules from an address
					case "rg-address":
						grammar.expandNode(node.address, context);
						var address = node.address;
						var target = address.finishedTarget;

						// May be a ruleset, a function (with params), or some random crap we pulled from the world object
						if (address.isFunction) {
							if (!target) {
								node.errors.push("No function " + inQuotes(address.raw));
							} else {
								node.finished = fxn.apply(node, address.parameters);
							}
						} else if (address.isSymbolKey) {
							// Clone the rules
							if (!target || !target.rules) {
								console.warn("No rules found for " + address.key);
							}
							if (!target || !target.rules)
								node.finished = [];
							else
								node.finished = target.rules.slice(0);
						} else {
							// Crap from world object
							node.finished = target;
						}

						break;

					default:
						console.warn("Unknown rule generator type " + inQuotes(node.rgType));
				}



				break;


			case "stackAction":

				this.expandNode(node.address, context);

				// Push onto the appropriate stack
				if (node.address.path) {
					// TODO, do something with a path
					console.warn("No path pushing implemented yet");

				} else {
					if (node.address.key) {

						var key = node.address.key;

						if (node.ruleGenerator) {

							this.expandNode(node.ruleGenerator, context);
							var finishedRules = getFinished(node.ruleGenerator);
							if (finishedRules === undefined) {
								console.warn("No rules to push to " + inQuotes(key), node.ruleGenerator);
							}

							// :: set rules, : push rules
							if (node.operator === "::")
								grammar.setRules(key, finishedRules, context);
							else
								grammar.pushRules(key, finishedRules, context);
						} else {
							if (node.command) {
								switch (node.command) {
									case "POP":
										grammar.popRules(key, context);
										break;
									case "CLEAR":
										grammar.clearRules(key, context);
										break;
									default:
										console.warn("Unknown stackaction command: " + inQuotes(node.command));
								}
							}

						}
					} else {
						console.warn("unknown key");
					}
				}

				node.finished = "";
				break;



				// Rules may be non-string, ie, are objects, or numbers
				// Or may have non-string sections, like rule-generators

			case "rule":
				node.tags = [];

				var dataSections = [];

				// Expand all the subnodes and collect tags
				for (var i = 0; i < node.sections.length; i++) {
					var section = node.sections[i];
					this.expandNode(section, context);

					var tags = node.sections[i].tags;

					if (tags) {
						node.tags = node.tags.concat(tags);
					}

					if (section.type === "data")
						dataSections.push(section);
				}

				node.finishedSections = node.sections.map(s => getFinished(s));

				// Join them all together
				//  Skip non-joinable sections
				// Special cases: 
				//   contents contains data: return array?

				// Do the joining thing, if a custom one
				if (grammar.merge !== undefined) {
					node.finished = grammar.merge(node.finishedSections);
					return;
				} else {

					// Data sections found!
					if (dataSections.length > 0) {

						// Error handling for multiple data sources and mixed data-non-data sources
						if (dataSections.length > 1) {
							addError(node, "Multiple data sections, only returning the first");
						}

						if (sections.length > 1) {
							addError(node, "Mixed data and non-data rule sections.  Custom merge function needed!");
						}

						// return the first data section, since we can't merge
						node.finished = getFinished(dataSections[0]);
						node.containsData = true;
						return;
					}

					// Standard best-effort merge

					// Map to useful info (or undefined), then join 
					node.finished = node.finishedSections.map(function(val) {
						if (val === undefined)
							return val;

						switch (typeof val) {
							// object or array
							case "object":

								// just concatenate arrays
								if (val instanceof Array)
									return val.map(s => getFinished(s)).join("");

								// if an object....?!?!?
								return "[[" + JSON.stringify(val) + "]]";
								break;
							case "number":
								// cast to string
								return val + "";
							case "string":
								return val;
							case "function":
								return undefined;
							default:
								console.warn("Unknown section type", val);
						}
					}).filter(val => val !== undefined).join("");
				}

				// Clear escape chars
				var s = getFinished(node);
				if (typeof s === "string") {
					var escaped = false;

					var c = "";
					for (var i = 0; i < s.length; i++) {
						if (escaped) {
							c += s.charAt(i);
							escaped = false;
						} else {
							if (s.charAt(i) === "\\")
								escaped = true;
							else
								c += s.charAt(i);
						}
					}
					node.finished = c;
				}
				break;


			case "tag":
				// get inner value

				this.expandNode(node.address, context);
				// Get the value from the address
				node.innerFinished = getFinished(node.address.finished);

				if (node.innerFinished !== undefined) {
					if (node.innerFinished.containsData) {
						node.containsData;
					}

					// grab the tags, if they exist
					if (node.innerFinished.tags !== undefined) {
						this.tags = innerFinished.tags.slice(0);
					}
				}

				node.finished = node.innerFinished;

				// Expand and apply the modifiers

				for (var i = 0; i < node.modifiers.length; i++) {
					this.expandNode(node.modifiers[i], context);

					var mod = node.modifiers[i];

					var name = mod.raw;
					var fxn = mod.finishedTarget;

					// Append an error signal if unfinished
					if (fxn === undefined) {
						addError(node, "No modifier " + inQuotes(name));
						node.finished += "[[." + name + "]]";
					} else {
						if (mod.parameters === undefined)
							mod.parameters = [];

						// Apply the mod, with any parameters


						mod.finished = fxn.apply({
							node: node.address,
							context: context,
							grammar: grammar,
						}, [node.finished].concat(mod.parameters));

						var modFinished = getFinished(mod.finished);
						if (modFinished !== undefined) {
							mod.inner = modFinished;
							node.finished = mod.finished;
						}



						//


					}
				}

				break;



				// Expand an address
				//   Get the target (symbol, modifier, or worldObject)
				//   Get the parameters (if a function)
			case "address":

				// Expand out any dynamic stuff to get the real key
				if (node.isDynamic) {
					var val = "";
					for (var i = 0; i < node.dynamicSections.length; i++) {
						this.expandNode(node.dynamicSections[i], context);
						if (node.dynamicSections[i].finished !== undefined)
							val += node.dynamicSections[i].finished;
						else
							val += node.dynamicSections[i];
					}
					node.key = val;
				}


				// Path addresses
				if (node.path !== undefined) {
					if (context.worldObject) {

						node.finishedPath = [];

						// Expand each step of the path
						for (var i = 0; i < node.path.length; i++) {
							// This may be either a "player", "5", "player{player.foo}",
							// or a path in itself "/player/{/stats/topPlayer}/5"
							this.expandNode(node.path[i], context);
							if (node.path[i].key !== undefined)
								node.finishedPath.push(node.path[i].key);
							else
								node.finishedPath.push(getFinished(node.path[i]));
						}

						// Use a custom access function if it exists
						if (context.worldObject.getFromPath !== undefined) {
							node.finishedTarget = context.worldObject.getFromPath(node.finishedPath);
						} else {
							node.finishedTarget = getFromPath(context.worldObject, node.finishedPath);
						}



						if (typeof node.finishedTarget === "object") {
							if (Array.isArray) {

							} else {
								node.finishedTarget = {
									type: "data",
									data: node.finishedTarget
								}
							}
						}

						if (node.finishedTarget === undefined) {
							node.finished = "[[" + node.finishedPath.join(",") + "]]";
							addError(node, inQuotes(node.raw) + " not found in worldObject");
							return;
						}

						// if not a function, we're done
						if (!node.isFunction) {
							node.finished = node.finishedTarget;
							return;
						}



					} else {
						addError(node, "No world object");
						// Path but no world object
						node.finished = "[[" + node.finishedPath.join(",") + "]]";
						return;
					}



				}


				// If not a path-found function, get it from the modifier registry
				if (node.isFunction) {
					if (node.parameters === undefined)
						node.parameters = [];
					// If not a fxn in the stateobj, look it up
					if (node.path === undefined) {
						node.finishedTarget = grammar.getFunction(node.key, node.isModifier);
					}

					// Expand all the parameters, if this is a function, 
					//  but do not run it yet, the owner of this function will call it 
					//  (sometimes has to be called with appropriate params, eg as a modifier)
					node.finishedParameters = [];

					for (var i = 0; i < node.parameters.length; i++) {
						this.expandNode(node.parameters[i], context);
						node.finishedParameters[i] = getFinished(node.parameters[i]);
					}

					if (node.finishedTarget === undefined) {
						console.warn("Cannot find fxn:" + node.raw);
					}

					if (!node.isModifier) {

						node.finished = node.finishedTarget.apply({
							node: node.address,
							context: context,
							grammar: grammar,
						}, node.finishedParameters);


					}
					return;
				}

				// active key
				node.ruleset = grammar.getActiveRuleset(node.key, context);
				if (node.ruleset === undefined) {

					node.finished = "[[" + node.key + "]]";
				} else {
					// Set the selection for this address
					node.rule = this.getRule(node.ruleset, context);

					this.expandNode(node.rule, context);
					node.finished = getFinished(node.rule);

				}

				break;


			case "data":
				break;

			case "op":
				break;


			default:

				console.warn("unknown node type " + inQuotes(node.type), node);
				break;
		}

		if (node.parameters) {
			for (var i = 0; i < node.parameters.length; i++) {
				grammar.expandNode(node.parameters[i], context);
			}
		}
		return node;
	};



	//==================================================================================================
	//==================================================================================================
	//==================================================================================================


	return {

		createGrammar: function(raw, useBaseModifiers) {
			var grammar = new TraceryGrammar(raw);

			// Basic function
			grammar.functions = {

				random: function(a, b) {
					if (b !== undefined)
						return Math.random() * (parseFloat(b) - parseFloat(a)) + parseFloat(a);
					if (a !== undefined)
						return Math.random() * parseFloat(a);

					return Math.random();
				},


				randomInt: function(a, b) {

					if (b !== undefined)
						return Math.floor(Math.random() * (parseFloat(b) - parseFloat(a)) + parseFloat(a));
					if (a !== undefined)
						return Math.floor(Math.random() * parseFloat(a));

					return Math.round(Math.random());
				},

				range: function(min, max, steps) {
					var s = [];
					if (!steps)
						steps = max - min;

					if (steps === 1)
						return [(min + max) / 2]

					for (var i = 0; i < steps; i++) {
						s.push(i * (max - min) / (steps - 1));
					}

					return s;
				},


				rangeUn: function(min, max, steps) {

					var s = [];
					if (!steps)
						steps = max - min;

					if (steps === 1)
						return [(min + max) / 2]

					for (var i = 0; i < steps; i++) {
						s.push(i * (max - min) / (steps));
					}

					return s;
				},


				lerp: function(min, max, a) {
					return min + (max - min) * a;
				},

			}
			if (useBaseModifiers) {

				function isVowel(c) {
					var c2 = c.toLowerCase();
					return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
				};

				function isAlphaNum(c) {
					return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
				};

				var baseModifiers = {

					modify: function(s, amt) {
						// Clone this node
						var node = JSON.parse(JSON.stringify(this.node));
						node.isClone = true;
						this.grammar.expandNode(node, this.context);
						return node;

					},

					varyTune: function(s) {
						var s2 = "";
						var d = Math.ceil(Math.random() * 5);
						for (var i = 0; i < s.length; i++) {
							var c = s.charCodeAt(i) - 97;
							if (c >= 0 && c < 26) {
								var v2 = (c + d) % 13 + 97;
								s2 += String.fromCharCode(v2);
							} else {
								s2 += String.fromCharCode(c + 97);
							}

						}
						return s2;
					},

					capitalizeAll: function(s) {
						var s2 = "";
						var capNext = true;
						for (var i = 0; i < s.length; i++) {

							if (!isAlphaNum(s.charAt(i))) {
								capNext = true;
								s2 += s.charAt(i);
							} else {
								if (!capNext) {
									s2 += s.charAt(i);
								} else {
									s2 += s.charAt(i).toUpperCase();
									capNext = false;
								}

							}
						}
						return s2;
					},

					despace: function(s) {

						var s2 = s.replace(/[^A-Za-z0-9]+/g, "");
						s2 = s2.replace(/\s+/g, '');

						return s2;
					},
					allCaps: function(s) {
						var s2 = "";
						var capNext = true;
						for (var i = 0; i < s.length; i++) {
							s2 += s.charAt(i).toUpperCase();
						}
						return s2;
					},

					capitalize: function(s) {
						var s2 = s.charAt(0).toUpperCase() + s.substring(1);
						return s2;
					},

					a: function(s) {
						if (s.length > 0) {
							if (s.charAt(0).toLowerCase() === 'u') {
								if (s.length > 2) {
									if (s.charAt(2).toLowerCase() === 'i')
										return "a " + s;
								}
							}

							if (isVowel(s.charAt(0))) {
								return "an " + s;
							}
						}


						return "a " + s;

					},

					// modifiers are called with this = node, s = finsihed
					s: function(s) {

						switch (s.charAt(s.length - 1)) {
							case 's':
								return s + "es";
								break;
							case 'h':
								return s + "es";
								break;
							case 'x':
								return s + "es";
								break;
							case 'y':
								if (!isVowel(s.charAt(s.length - 2)))
									return s.substring(0, s.length - 1) + "ies";
								else
									return s + "s";
								break;
							default:
								return s + "s";
						}
					},
					ed: function(s) {
						switch (s.charAt(s.length - 1)) {
							case 's':
								return s + "ed";
								break;
							case 'h':
								return s + "ed";
								break;
							case 'x':
								return s + "ed";
								break;
							case 'y':
								if (!isVowel(s.charAt(s.length - 2)))
									return s.substring(0, s.length - 1) + "ied";
								else
									return s + "d";
								break;
							default:
								return s + "d";
						}
					},
					ing: function(s) {
						switch (s.charAt(s.length - 1)) {

							case 'e':
								if (!isVowel(s.charAt(s.length - 2)))
									return s.substring(0, s.length - 1) + "ing";
								else
									return s + "ing";
								break;
							default:
								return s + "ing";

						}
					}
				};
				grammar.addModifiers(baseModifiers);

			}
			return grammar;
		},

	}

	// Paths

	function getFromPath(obj, path) {
		if (!obj) {
			console.warn("No object provided for path");
			return undefined;
		}

		var obj2 = obj;
		var next;

		// For each path segment
		for (var i = 0; i < path.length; i++) {
			next = path[i];

			// Subpath: get the name of this link by following this subpath
			if (Array.isArray(next)) {
				var subpath = next;
				next = getFromPath(obj, subpath);
				if (next === undefined) {
					console.warn("No object path found for " + inSquareBrackets(subpath));
					return undefined;
				}
			}


			if (i < path.length - 1) {
				if (obj2[next] === undefined) {
					console.warn("No address " + inQuotes(next) + " found in path " + inSquareBrackets(path));
					return undefined;
				}

				obj2 = obj2[next];
			}
		}

		if (obj2[next] === undefined) {
			console.warn("No address " + inQuotes(next) + " found in path " + inSquareBrackets(path));
			return undefined;
		}
		var found = obj2[next];

		return found;

	}

	function setFromPath(obj, path, val) {
		var obj2 = obj;
		var next;
		for (var i = 0; i < path.length; i++) {
			next = path[i];

			// Subpath: get the name of this link by following this subpath
			if (Array.isArray(next)) {
				var subpath = next;
				next = getFromPath(obj, subpath);
				if (next === undefined) {
					console.warn("No object path found for " + inSquareBrackets(subpath));
					return undefined;
				}
			}


			if (i < path.length - 1) {
				if (obj2[next] === undefined) {
					obj2[next] = {};
				}
			}


			obj2 = obj2[next];

		}

		return obj2[next];
	}


	// Actions may be stack actions	foo:bar,baz
	// or rule generators			range(0, 10 50)
	//								join(animal,', ')
	//								animal
	//								/names/english/victorian/female
	var nodeCount = 0;

	function createNode(raw, type) {
		return {
			id: nodeCount++,
			raw: raw,
			type: type
		}
	}

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
		var parsed = createNode(s, "stackAction");

		if (sections.length > 3) {
			parsed.errors.push("Too many operators in stack action" + inQuotes(s));
			return parsed;
		}

		parsed.address = parseAddress(sections[0]);
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
		var parsed = createNode(s, "ruleGenerator");



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


	function parseAddress(s) {

		s = s.trim();
		if (s.length === 0) {
			console.log("empty address");
			return undefined;
		}

		// Are there forward slashes? Then this is a path address
		// like "/foo/bar()" or /foo/{bar#Name#}/select(house)/4
		var path = splitOnUnprotected(s.substring(0), "/");
		if (path.length > 1) {
			return parsePathAddress(s, path);
		}


		// Identify dynamic sections {}
		// Identify functions and parameters "foo()" or keys "foo"

		var parsed = createNode(s, "address");


		var sections = splitIntoTopSections(s, "{('\"");

		// Some protected section, either "(foo)" or 
		if (sections.length === 1 && sections[0].depth === 1) {
			// Is this in quotes? Then its actually a rule
			if (path.isInQuotes) {
				return parseRule(s);
			}

			// Is this in quotes? Then its actually a rule
			if (path.isInParentheses) {
				return parseExpression(s);
			}

			addError(parsed, "Unknown top-level section in address: " + inQuotes(s));
			return parsed;
		}

		var keySections = [];
		for (var i = 0; i < sections.length; i++) {
			var s2 = sections[i];
			switch (s2.openChar) {
				case "{":
					parsed.isDynamic = true;
					keySections.push(parseTag(s2.inner, true));
					if (parsed.isFunction) {
						addError(parsed, "Text after function parenthesis:" + inQuotes(s));
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
						addError(parsed, "Text after function parenthesis:" + inQuotes(s));
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



		return parsed;



	}


	// Parse an address containing slashes:
	//  /foo/bar 
	//  /{#foo#}/bar
	//  /foo()/bar()

	function parsePathAddress(s, pathSections) {
		var parsed = createNode(s, "address");

		parsed.path = [];
		if (pathSections[0].length !== 0) {
			parsed.errors.push("Path does not start with a '/', this has no meaning yet");
		}
		for (var i = 1; i < pathSections.length; i++) {
			var p = parseRule(pathSections[i]);
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

			var parsed = createNode(raw, "expression");


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
				return parseAddress(raw, "function");
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
							return v;
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
		var parsed = createNode(s, "tag");

		var s2 = splitOnUnprotected(s, ".");
		var target = s2[0];

		// Allow rules in tags, for easy modifier use, e.g. "#'#bar# #foo#'.camelCase#"
		// An address to either a symbol stack or a function or an object pathaddress
		parsed.address = parseAddress(target);


		// Parse all the modifiers
		parsed.modifiers = s2.slice(1).map(function(modifierRaw) {
			var mod = parseAddress(modifierRaw);
			mod.isFunction = true;
			mod.isModifier = true;
			return mod;
		});

		// Parse the address
		return parsed;
	}

	function parseRule(rawRule, protected) {
		nodeParses++;

		if (rawRule.search(/[#\{\(\[]/) < 0) {
			var val = parseFloat(rawRule);
			if (!isNaN(val)) {
				return val;
			} else {
				return rawRule;
			}
		}
		var rule = createNode(rawRule, "rule");



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



}());


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
	if (s === undefined || s === null)
		return undefined;

	if (typeof s === 'number' || typeof s === 'string' || s instanceof String)
		return s;

	if (Array.isArray(s))
		return s;

	// distinguise between a node object and a data object?
	if (s.type === "data") {
		return s.data;
	}

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

function addError(node, error) {
	if (node.errors === undefined)
		node.errors = [];

	node.errors.push(error);
	console.warn(error);
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