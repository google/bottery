function testTracery() {



	// For each in a table, do something relative
	//'#emoji##name#' for a in /emojiTable [emoji:a/emoji][name:a/name] ''
	//"'#myNum##animal#' for myNum in number", "'#myNum##myAnimal#' for myNum in number for myAnimal in animal",
	var tests = {
	//	rule: ["[/names/british/female]", "#/names/british/female/{/indices/2}#", "foo", "\\\\\\foo", "foo#bar#", "#animalName.capitalize.s#", "foo#missingSymbol#", "foo[bar]", "foo[#bar#]", "[#animalName.replace([vowel],'X')#]", "[range(0,4,5)]", "[join([range(0,4,5)],',')]", "[doSomethingWithNoReturn(#foo#)]", "foo\\#bar\\#", "\\[foo{#'\\]", "(#foo#)", "!صَبَاحُ الخَيْر", "בוקר טוב.", "早上好", "I 💖 emoji🏄🏾"],
		rule: ["#/names/british/female/{/indices/{/indices/{number1}}}#"],
		//rule: ["[/names/british/female]", "#/names/british/female/3#"],
		//rule: ["#animalName.replace([vowel],'X')#"],
		//rule: ["['#x# + 1' for foo in number1]"],
		//rule: ["<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'>['<circle fill=\\'hsl([(x*10 + y*50)],50%,[(y)]0%)\\' cx=\\'[ (x * #/spacing/x# + 15)  ]\\' cy=\\'[ (y * #/spacing/y# + 15)  ]\\' r=\\'[(random(10) + 3)]\\'/>' for x in number for y in number ]<svg>"],
		//rule: ["[(random(5))]"],
		// "['#drawFlower#' for x in number1 for y in number1]"],
		//rule: ["#origin#"] ,
		//rule: ["[sin(max(2,5))]"],
		//	action: ["foo,bar", "foo", "/foo", "/foo/bar()", "replace('a','foo#bar#, yeah',[foo])", "foo('bar,baz',10e2,10e-2,0x3123ff,5)",range(0,'foo',10)", "foo()", "foo(bar)", "foo('{#bar#}Name')", "'foo'", "\"bar\""],
		//action: ["'test#foo#'", "'test(#foo#)'", "foo", "foo()", "foo('bar')", "leet('foo')", "/foo", "/foo()", "[foo],[bar]", "[foo],'bar','(#baz#)'", "range(0, 10, 11)","range(0, 10, #number#)", "/names/british/female"],
		//action: ["'#number# #foo#' for foo in [animal]", "'#bar# #foo#' for foo in [animal] for bar in [number]", "/names/british/female filter startsWith('A')", "'Miss #name#' for name in /names/british/female filter startsWith('A')"],
		//action: ["'Miss #foo#' for foo in /names/british/female ", "/names/british/female if startsWith('A') if endsWith('A')", "'Miss #name#' for name in /names/british/female if (startsWith('A'))"],
		//action: ["'Miss #foo#' for foo in /names/british/female ", "'Miss #foo#' for foo in [[/names/british/female] if startsWith('A') if endsWith('a')]"],
		//action: ["'#name# the dog', '#name# the cat', 'Miss #foo#' for foo in [/names/british/female if startsWith('a')]"],
		//rule: ["#x#[x:a]#x#[x:b]#x#[x:c]#x#[x:POP]#x#[x::z]#x#[x:POP]#x#[x:POP]#x#", "#x#[x:a]#x#[x:b]#x#[x:c]#x#[x:POP]#x#[x:z]#x#[x:POP]#x#[x:POP]#x#"],
		//action: ["'#x##y#(#letter1#)' for x in [animal1] for y in [number1]"],
		// "/names/british/female if startsWith('A') if endsWith('A')", "'Miss #name#' for name in /names/british/female if (startsWith('A'))"],
		//rule: ["foo #foo# #/foo#", "baz #foo.replace([a],'bar')# bar"],
		address: ["foo", "{foo}", "{#foo#}", "/foo", "/foo/bar", "/foo/bar(#/foo#)", "/foo/{#bar#baz}", "/foo/5/bar", "foo()", "foo(bar)", "foo(#/bar/{#/baz#}#)", "foo(bar,baz)", "foo(bar,'test,1,2,3')"],
		//address: ["/foo/5/bar"],
	};


	function testParsing(type, parseFxn, grammar, worldObject, viewHolder, expand) {
		console.log("Testing " + type);


		for (var i = 0; i < tests[type].length; i++) {
			var test = tests[type][i];
			console.log("----------------------");
			console.log(test);
			var div = $("<div/>", {
				class: "tracery-test",
			}).appendTo(viewHolder);

			var label = $("<div/>", {
				class: "tracery-test-label",
				text: test
			}).appendTo(div);


			var node = parseFxn(test);

			if (expand) {
				grammar.expandNode(node, undefined, {
					worldObject: worldObject
				});
			}

			createDiagram(node, div);
			console.log(node);


			var html = $("<div/>", {

				html: node.finished
			}).appendTo($("#panel-preview .panel-content"));


			var html = $("<div/>", {
				class: "large",
				text: node.raw
			}).appendTo($("#panel-rule .panel-content"));

		}
	};


	var worldObject = {
		foo: {
			bar: "WORLD_FOO",
		},
		indices: [3, 2, 1, 0],
		count: {
			value: "**I'm a path!**"
		},
		playerName: "Judge Judy",
		fooName: "Beyoncé",
		barName: "Tilda Swinton",
		spacing: {
			x: 23,
			y: 23,
		},
		names: {
			british: {
				female: ["Alice", "Victoria", "Eugenia", "Anastasia"],
				male: ["Percy", "Marcus", "Alastair", "Drake"],
			}
		},
		emojiTable: [{
			name: "beer",
			emoji: "🍺"
		}, {
			name: "octopus",
			emoji: "🐙"
		}, {
			name: "fire",
			emoji: "🔥"
		}]
	};


	var grammar = tracery.createGrammar({

		origin: "['#drawFlower#' for x in number1 for y in number1]",
		drawFlower: ["<translate x=[#x# * 10 + 5] y=[#y# * 10 + 5]>"],
		foo: ["FOO", "F00"],
		number: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
		animal: "🐌 🐙 🐬 🐅 🐪 🐀 🐿 🐓 🐠 🐈 🐑".split(" "),
		animalName: ["boa", "emu", "okapi", "unicorn"],
		star: "🌝 🌞 🌛 🌜 🌙 💫 ⭐️ 🌟 ✨️ ⚡️ 🔥 💥☄☀️".split(" "),
		animal1: ["🐌", "🐙", "🐬"],
		number1: [0, 1, 2],
		letter1: ["A", "B", "C"],
		fooAddress: "foo",
		fooName: "F$$",
		vowel: "aeiou".split(""),
		bar: ["BAR"],
		baz: ["BAZ"],
		wiz: ["WIZ"],
		count: 3,
		name: ["Sniffly", "Mittens", "Nelson", "Mipsy", "Wellington"],

	}, true);

	grammar.functions = {
		startsWith: function(c) {
			return this.charAt(0).toLowerCase() === c[0].toLowerCase();
		},
		endsWith: function(c) {

			return this.charAt(this.length - 1).toLowerCase() === c[0].toLowerCase();
		},

		formatNum: function(c) {

			return c.toFixed(2);
		},
		foo: function(s) {
			var s2 = ""
			if (s) {
				for (var i = 0; i < s.length; i++) {
					s2 += s.charAt(i) + "_FOO_";
				}
				return s2;
			}
			return "LOTS_A_FOO";
		},


		// for each letter in s, replace with
		leet: function(s) {
			var replacements = {
				"o": "0",
				"a": "4",
				"i": "!",
				"t": "7",
				"s": "z",
				"e": "3",
			}
			var s3 = [];
			for (var i = 0; i < s.length; i++) {
				var s2 = "";
				for (var j = 0; j < s.length; j++) {
					var c = s.charAt(j).toLowerCase();
					if (replacements[c] && Math.random() > .5)
						s2 += replacements[c]
					else {
						if (Math.random() > .5)
							s2 += c;
						else
							s2 += c.toUpperCase();
					}
				}
				s3.push(s2);
			}
			return s3;

		}
	};


	grammar.addModifiers({


		foo: function(s) {
			return "foo" + s + "foo";
		},

		bar: function(s) {
			return "bar" + s + "bar";
		},
		allBs: function(s) {
			var s2 = "";
			for (var i = 0; i < s.length; i++) {
				var c = s.charCodeAt(i);
				if (c => 65 && c <= 90)
					s2 += "B";
				else if (c => 97 && c <= 122)
					s2 += "b";
				else
					s2 += s.charAt(i);
			}
		},

		add: function(s, a) {
			return s + a;
		},

		// Greedy replacement
		replace: function(s, queries, replacementRule) {

			console.log(s, queries, replacementRule);
			console.log("REPLACE", s);

			if (!Array.isArray(queries))
				queries = [queries];

			for (var i = 0; i < queries.length; i++) {
				var query = getFinished(queries[i]);
				var re = new RegExp(query, 'g');

				var s2 = getFinished(replacementRule);
				s = s.replace(re, s2);
			}

			return s;
		}
	});

	var displayHolder = $("#panel-expansion .panel-content");

	//tracery.testParsing("action", parseAction, grammar, worldObject, displayHolder, true);
	testParsing("rule", parseRule, grammar, worldObject, displayHolder, true);
	//tracery.testParsing("expression", parseExpression, grammar, worldObject, displayHolder, true);
	//tracery.testParsing("address", parseAddress, grammar, worldObject, displayHolder, true);

}