/*
// Railroad diagrams

ParameterList::=  ((('"' Rule '"' | "'" Rule "'" | '[' RuleGenerator ']' | '(' Expression ')' | Expression) ) ( ',' ('"' Rule '"' | "'" Rule "'" | '[' RuleGenerator ']' | '(' Expression ')' | Expression))*)?

Address ::=((("/" Key )+) | Key) ("(" ParameterList ")")?
Key::= (("{" Rule "}")|(plaintext))+
*/

var nodeExpansions = 0;
var nodeParses = 0;

var tracery = (function() {
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

		if (this.functions[key] !== undefined)
			return this.functions[key];


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

	TraceryGrammar.prototype.getActiveRuleset = function(key, node, state) {
		var stack = state.stacks[key];
		if (stack)
			return stack[stack.length - 1];
		else
			return this.symbols[key];
	};


	TraceryGrammar.prototype.pushRules = function(key, rules, state) {

		if (!Array.isArray(rules))
			rules = [rules];

		if (!state.stacks[key])
			state.stacks[key] = [];


		state.stacks[key].push(rules);

	};

	// Stomp rules
	TraceryGrammar.prototype.setRules = function(key, rules, state) {
		state.stacks[key] = rules;

	};

	TraceryGrammar.prototype.popRules = function(key, state) {
		if (state.stacks[key] && state.stacks[key].length > 0) {
			return state.stacks[key].pop();
		}
	};


	TraceryGrammar.prototype.clearRules = function(key, state) {
		state.stacks[key] = [];
	};


	TraceryGrammar.prototype.getRule = function(rules, node, state) {

		// todo, shuffling

		if (!Array.isArray(rules))
			console.warn("non-array rules: " + rules);
		var index = Math.floor(Math.random() * rules.length);

		// Cache parsing of string rules
		// Replace the plaintext rule with a parsed version
		if (isString(rules[index])) {
			rules[index] = parseRule(rules[index]);
		}

		//console.log(rules, index, rules[index]);

		return rules[index];
	};

	TraceryGrammar.prototype.expand = function(rule, parent, state, isProtected) {

		var node = parseRule(rule, isProtected);
		return this.expandNode(node, parent, state);

	};


	TraceryGrammar.prototype.flatten = function(rule, state) {

		var node = parseRule(rule);
		return this.expandNode(node, undefined, state).finished;
	};


	TraceryGrammar.prototype.expandWithOverrides = function(rule, ruleOverrides) {
		var state = {
			stacks: {}
		};

		var node = parseRule(rule, true);
		if (ruleOverrides) {
			for (var key in ruleOverrides) {
				if (ruleOverrides.hasOwnProperty(key)) {
					this.pushRules(key, ruleOverrides[key], state);
				}
			}

		}
		this.expandNode(node, undefined, state);
		return node;
	};

	// Expand a node
	TraceryGrammar.prototype.expandNode = function(node, parent, state) {
		nodeExpansions++;
		var grammar = this;
		if (node === undefined) {
			throw ("empty node");
		}
		if (state === undefined) {
			state = {};
		}
		if (state.stacks === undefined) {
			state.stacks = {};
		}

		if (parent === undefined)
			node.depth = 0;
		else {
			node.parent = parent;
			node.depth = parent.depth + 1;
		}

		// wrap number
		if (!isNaN(node)) {
			node = {
				type: "number",
				finished: node
			};
		}
		switch (node.type) {

			case "number":
				break;


			case "expression":
				switch (node.expressionType) {
					case "operator":
						var lhs, rhs;
						grammar.expandNode(node.operator, node, state);
						grammar.expandNode(node.rhs, node, state);
						if (node.lhs !== undefined) {
							grammar.expandNode(node.lhs, node, state);
							lhs = parseFloat(node.lhs.finished);
						}
						rhs = parseFloat(node.rhs.finished);
						switch (node.operator.finished) {
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
								console.warn(node);
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
						grammar.expandNode(node.source, node, state);
						grammar.expandNode(node.conditions, node, state);
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
										grammar.expandNode(param, node, state);

										return param.finished;
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
							grammar.expandNode(node.loops[i].key, node, state);
							grammar.expandNode(node.loops[i].source, node, state);

						}



						// For each variant in the loops, push those rules, then do all the templates, then pop
						function makeTemplates(loopIndex) {
							var loop = node.loops[loopIndex];

							// All the rules to iterate through (may be finished, or generated rules, 
							// language inconsistency TODO)
							var rules = loop.source.finished;

							if (loop.source.finished !== undefined)
								rules = loop.source.finished;

							// For each possible rule, generate expansions with the other loops' values
							for (var i = 0; i < rules.length; i++) {
								var key = loop.key.key;

								grammar.pushRules(key, rules[i], state);

								// recurse
								if (loopIndex < node.loops.length - 1) {
									makeTemplates(loopIndex + 1);
								}
								// Otherwise, generate the rules
								else {


									// We're going to be filling a template, with some values
									grammar.expandNode(node.templateExpression, node, state);

									generatedRules.push(node.templateExpression.finished);
								}

								grammar.popRules(key, state);
							}

						}

						makeTemplates(0);

						node.finished = generatedRules;

						break;

						// Concatenate rule sets
					case "rg-concatenation":

						var rulesets = node.concatenateRules.map(function(ruleGenerator) {
							grammar.expandNode(ruleGenerator, node, state);

							return ruleGenerator.finished;
						});

						// Merge the arrays
						node.finished = [].concat.apply([], rulesets);
						break;

						// Parse and generate a text rule
					case "rg-rule":


						grammar.expandNode(node.rule, node, state);
						node.finshed = [node.rule.finished];

						break;



						// Generate rules from an address
					case "rg-address":
						grammar.expandNode(node.address, node, state);
						var address = node.address;
						var target = address.finishedTarget;

						// May be a ruleset, a function (with params), or some random crap we pulled from the world object
						if (address.isFunction) {
							if (!target) {
								node.errors.push("No function " + inQuotes(address.raw));
							} else {
								node.finished = target.apply(null, address.finishedParameters);
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

				this.expandNode(node.address, parent, state);

				// Push onto the appropriate stack
				if (node.address.path) {
					// TODO, do something with a path
					console.warn("No path pushing implemented yet");

				} else {
					if (node.address.key) {

						var key = node.address.key;

						if (node.ruleGenerator) {

							this.expandNode(node.ruleGenerator, parent, state);
							var finishedRules = node.ruleGenerator.finished;
							if (!isNaN(finishedRules))
								finishedRules = {
									type: "number",
									finished: finishedRules
								}

							// :: set rules, : push rules
							if (node.operator === "::")
								grammar.setRules(key, finishedRules, state);
							else
								grammar.pushRules(key, finishedRules, state);
						} else {
							if (node.command) {
								switch (node.command) {
									case "POP":
										grammar.popRules(key, state);
										break;
									case "CLEAR":
										grammar.clearRules(key, state);
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

				if (node.nonString) {
					node.finished = node.raw;
				} else {
					node.finishedSections = [];
					var val = "";
					var onlyText = true;
					var joinable = true;

					for (var i = 0; i < node.sections.length; i++) {
						var section = node.sections[i];
						this.expandNode(section, node, state);

						if (section.containsData)
							node.containsData = true;

						switch (section.type) {
							case "ruleGenerator":
								if (section.finished !== undefined) {
									// Join an array (because commas aren't usually wanted)
									if (Array.isArray(section.finished)) {
										node.finishedSections.push(section.finished.filter(function(s2) {
											return s2 !== undefined
										}).join(""));
									} else {
										node.finishedSections.push(section.finished);
									}

								}
								break;
							case "text":
								node.finishedSections.push(section.finished);

								break;

							case "tag":
								if (section.containsData) {
									console.warn("data found in rule, preventing concatenation");
									joinable = false;

								}


								node.finishedSections.push(section.finished);


								break;

							case "number":
								node.finishedSections.push(section.finished);

								break;
							case "address":
								if (section.isFunction) {

									var result = section.finishedTarget.apply(null, section.finishedParameters);
									section.finished = result;
								}
								node.finishedSections.push(section.finished);


								break;
							case "stackAction":
								node.finishedSections.push("");
								break;
							case "expression":
								// Maybe format better if numbers?
								node.finishedSections.push(section.finished);
								break;
							default:

								console.warn("unknown rule section type:", section.type, section.raw, node.raw);
								node.finishedSections.push(section.finished);
								break

						}


					}

					if (joinable) {
						// Do the joining thing, if a custom one
						if (grammar.joinRuleSections !== undefined)
							node.finished = grammar.joinRuleSections(node.finishedSections);
						else {
							node.finished = node.finishedSections.join("");
						}

						// Clear escape chars
						var escaped = false;

						var c = "";
						for (var i = 0; i < node.finished.length; i++) {
							if (escaped) {
								c += node.finished.charAt(i);
								escaped = false;
							} else {
								if (node.finished.charAt(i) === "\\") {
									escaped = true;
								} else
									c += node.finished.charAt(i);
							}
						}
						node.finished = c;

					} else {
						node.finished = node.finishedSections;
					}

					// Assemble tags
					node.tags = [];
					for (var i = 0; i < node.sections.length; i++) {
						var tags = node.sections[i].tags;

						if (tags) {
							node.tags = node.tags.concat(tags);
						}
					}



				}

				break;


			case "tag":
				// do preactions TODO
				// get inner value

				this.expandNode(node.address, node, state);

				if (node.address.path !== undefined) {
					// Get from path
					node.innerFinished = node.address.finished;

				} else if (node.address.type === "rule") {
					this.expandNode(node.address, node, state);
					node.innerFinished = node.address.finished;
					console.log(node.innerFinished);
				} else {

					// Look up a rule from a symbol stack
					var key = node.address.key;
					if (key !== undefined) {
						node.ruleset = this.getActiveRuleset(key, node, state);
						if (node.ruleset === undefined) {
							node.errors.push("No ruleset for " + inQuotes(key));
						} else {
							node.rule = grammar.getRule(node.ruleset, node, state);

							if (node.rule === undefined) {
								console.warn("No rule for " + key, node.ruleset);
							}

							this.expandNode(node.rule, node, state);

							// Inner value is the selected rule, if data,
							// or the finished expansion, if the rule was parseable text
							if (node.rule.type === "data" || node.rule.containsData) {

								if (node.rule.finished !== undefined)
									node.innerFinished = node.rule.finished[0];
								else
									node.innerFinished = node.rule;
								node.containsData = true;

							} else {
								// special case for numbers
								if (!isNaN(node.rule)) {
									node.innerFinished = node.rule;
								} else {
									node.innerFinished = node.rule.finished;

								}
							}

							node.tags = node.rule.tags;

						}


					} else
						console.warn("No key for tag" + inQuotes(node.raw));
				}

				node.finished = node.innerFinished;


				// Expand and apply the modifiers
				for (var i = 0; i < node.modifiers.length; i++) {
					this.expandNode(node.modifiers[i], node, state);
				}

				if (node.finished !== undefined) {
					// apply modifiers
					node.midsteps = [];
					if (node.modifiers) {

						for (var i = 0; i < node.modifiers.length; i++) {
							var mod = node.modifiers[i];
							var name;
							var fxn;
							if (mod.path) {
								fxn = mod.finished;
								name = mod.raw;
							} else {
								fxn = grammar.modifiers[mod.key];
								name = mod.key;
							}

							// Append an error signal if unfinished
							if (fxn === undefined) {
								node.errors.push("No modifier " + inQuotes(name));
								node.finished += "[[." + name + "]]";

							} else {
								if (mod.parameters === undefined)
									mod.parameters = [];

								// get the finished value of each parameter
								var parameters = mod.parameters.map(function(p) {
									return p.finished;
								});

								// Apply the mod, with any parameters
								node.midsteps[i] = node.finished;
								node.finished = fxn.apply(undefined, [node.finished].concat(parameters));
							}
						}
					}
				} else {
					// Do default behavior for missing rules
					if (node.address.path !== undefined)

						node.finished = "[[" + node.address.path.map(function(pathSegment) {
						return pathSegment.key;
					}).join("/") + "]]";
					else {

						node.finished = "[[" + node.address.key + "]]";
					}
				}

				// do postactions TODO


				break;
			case "text":
				// Do nothing
				node.raw = node.finished;

				// Scrape tags 
				if (grammar.openTag) {

					var s = node.finished.split(grammar.openTag);
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
				break;


				// Expand an address
				//   Get the target (symbol, modifier, or worldObject)
				//   Get the parameters (if a function)
			case "address":
				if (node.path !== undefined) {

					node.finishedPath = [];
					// Expand each step of the path
					for (var i = 0; i < node.path.length; i++) {
						// This may be either a "player", "5", "player{player.foo}",
						// or a path in itself "/player/{/stats/topPlayer}/5"
						this.expandNode(node.path[i], node, state);
						if (node.path[i].key !== undefined)
							node.finishedPath.push(node.path[i].key);
						else
							node.finishedPath.push(node.path[i].finished);
					}

					if (state.worldObject) {


						// Use a custom access function
						if (state.worldObject.getFromPath) {
							node.finishedTarget = state.worldObject.getFromPath(node.finishedPath);
						} else {
							node.finishedTarget = getFromPath(state.worldObject, node.finishedPath);
						}
						// if not a function, we're done
						if (!node.isFunction)
							node.finished = node.finishedTarget;
					} else {
						console.warn("No world obj");
						node.errors.push("No world object");
						// Path but no world object
						node.finished = "[[" + node.finishedPath.join(",") + "]]";
					}

				} else {


					// Expand out any dynamic stuff to get the real key
					if (node.isDynamic) {
						var val = "";
						for (var i = 0; i < node.dynamicSections.length; i++) {
							this.expandNode(node.dynamicSections[i], node, state);
							if (node.dynamicSections[i].finished !== undefined)
								val += node.dynamicSections[i].finished;
							else
								val += node.dynamicSections[i];
						}
						console.log("Dynamic key: " + val);
						node.key = val;

					}

					if (node.isFunction) {
						// Get from functions or modifiers
						node.finishedTarget = grammar.getFunction(node.key, node.context === "modifier");

					} else {
						node.finishedTarget = grammar.getActiveRuleset(node.key, node, state);
					}

				}

				// if this is a function, perform the function
				if (node.isFunction) {

					if (node.finishedTarget !== undefined) {

						// Expand out all the parameters
						node.finishedParameters = node.parameters.map(function(param) {
							grammar.expandNode(param, node, state);
							return param.finished;
						});


						// Not a modifier?  Apply immediately (Ie, dont need to wait for an inner value to pass as a parameter)
						if (node.context !== "modifier") {
							node.finished = node.finishedTarget.apply(null, node.finishedParameters);
						}
					} else {

						node.errors.push("No function named " + inQuotes(key));
					}
				} else {
					// The target is either a ruleset, or a world value

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
				grammar.expandNode(node.parameters[i], node, state);
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



}());