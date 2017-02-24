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

var emoji = "🐱 😎 😸 👏 💀 👻 😊 😦 🤖 🎉 🐍 🐳 ⛈ 🔥 🌟 😐 😮 🐰 🐹 🦄 🌎 💨 🐏 🍺 🍰 👾 🚀 🔪 💕 💛 ⛄ 😔 😆 🙄 😛".split(" ");
var funEmoji = "🎫 🎟 🎭 🎨 🎪 🎤 🎧 🎼 🎹 🎷 🎺 🎸 🎻 🎬 🏹 🎣 🚣 🏊 🏄 🛀 ⛹ 🏋 🚴 🚵 🏇 🕴 🏆 🎽 🏅 🐱 😎 😸 👏 💀 👻 😊 😦 🤖 🎉 🐍 🐳 ⛈ 🔥 🌟 😐 😮 🐰 🐹 🦄 🌎 💨 🐏 🍺 🍰 👾 🚀 🔪 💕 💛 ⛄ 😔 😆 🙄 😛".split(" ");
var manyEmoji = emoji.concat(funEmoji);
var emmaText = "Emma Woodhouse, handsome, clever, and rich, with a comfortable home and happy disposition, seemed to unite some of the best blessings of existence; and had lived nearly twenty-one years in the world with very little to distress or vex her.  She was the youngest of the two daughters of a most affectionate, indulgent father; and had, in consequence of her sister's marriage, been mistress of his house from a very early period. Her mother had died too long ago for her to have more than an indistinct remembrance of her caresses; and her place had been supplied by an excellent woman as governess, who had fallen little short of a mother in affection.  Sixteen years had Miss Taylor been in Mr. Woodhouse's family, less as a governess than a friend, very fond of both daughters, but particularly of Emma. Between _them_ it was more the intimacy of sisters. Even before Miss Taylor had ceased to hold the nominal office of governess, the mildness of her temper had hardly allowed her to impose any restraint; and the shadow of authority being now long passed away, they had been living together as friend and friend very mutually attached, and Emma doing just what she liked; highly esteeming Miss Taylor's judgment, but directed chiefly by her own.  The real evils, indeed, of Emma's situation were the power of having rather too much her own way, and a disposition to think a little too well of herself; these were the disadvantages which threatened alloy to her many enjoyments. The danger, however, was at present so unperceived, that they did not by any means rank as misfortunes with her.  Sorrow came--a gentle sorrow--but not at all in the shape of any disagreeable consciousness.--Miss Taylor married. It was Miss Taylor's loss which first brought grief. It was on the wedding-day of this beloved friend that Emma first sat in mournful thought of any continuance. The wedding over, and the bride-people gone, her father and herself were left to dine together, with no prospect of a third to cheer a long evening. Her father composed himself to sleep after dinner, as usual, and she had then only to sit and think of what she had lost.  The event had every promise of happiness for her friend. Mr. Weston was a man of unexceptionable character, easy fortune, suitable age, and pleasant manners; and there was some satisfaction in considering with what self-denying, generous friendship she had always wished and promoted the match; but it was a black morning's work for her. The want of Miss Taylor would be felt every hour of every day. She recalled her past kindness--the kindness, the affection of sixteen years--how she had taught and how she had played with her from five years old--how she had devoted all her powers to attach and amuse her in health--and how nursed her through the various illnesses of childhood. A large debt of gratitude was owing here; but the intercourse of the last seven years, the equal footing and perfect unreserve which had soon followed Isabella's marriage, on their being left to each other, was yet a dearer, tenderer recollection. She had been a friend and companion such as few possessed: intelligent, well-informed, useful, gentle, knowing all the ways of the family, interested in all its concerns, and peculiarly interested in herself, in every pleasure, every scheme of hers--one to whom she could speak every thought as it arose, and who had such an affection for her as could never find fault.  How was she to bear the change?--It was true that her friend was going only half a mile from them; but Emma was aware that great must be the difference between a Mrs. Weston, only half a mile from them, and a Miss Taylor in the house; and with all her advantages, natural and domestic, she was now in great danger of suffering from intellectual solitude. She dearly loved her father, but he was no companion for her. He could not meet her in conversation, rational or playful.  The evil of the actual disparity in their ages (and Mr. Woodhouse had not married early) was much increased by his constitution and habits; for having been a valetudinarian all his life, without activity of mind or body, he was a much older man in ways than in years; and though everywhere beloved for the friendliness of his heart and his amiable temper, his talents could not have recommended him at any time.  Her sister, though comparatively but little removed by matrimony, being settled in London, only sixteen miles off, was much beyond her daily reach; and many a long October and November evening must be struggled through at Hartfield, before Christmas brought the next visit from Isabella and her husband, and their little children, to fill the house, and give her pleasant society again.  Highbury, the large and populous village, almost amounting to a town, to which Hartfield, in spite of its separate lawn, and shrubberies, and name, did really belong, afforded her no equals. The Woodhouses were first in consequence there. All looked up to them. She had many acquaintance in the place, for her father was universally civil, but not one among them who could be accepted in lieu of Miss Taylor for even half a day. It was a melancholy change; and Emma could not but sigh over it, and wish for impossible things, till her father awoke, and made it necessary to be cheerful. His spirits required support. He was a nervous man, easily depressed; fond of every body that he was used to, and hating to part with them; hating change of every kind. Matrimony, as the origin of change, was always disagreeable; and he was by no means yet reconciled to his own daughter's marrying, nor could ever speak of her but with compassion, though it had been entirely a match of affection, when he was now obliged to part with Miss Taylor too; and from his habits of gentle selfishness, and of being never able to suppose that other people could feel differently from himself, he was very much disposed to think Miss Taylor had done as sad a thing for herself as for them, and would have been a great deal happier if she had spent all the rest of her life at Hartfield. Emma smiled and chatted as cheerfully as she could, to keep him from such thoughts; but when tea came, it was impossible for him not to say exactly as he had said at dinner,  'Poor Miss Taylor!--I wish she were here again. What a pity it is that Mr. Weston ever thought of her!' ";

var numberMultipliers = {
	quintillion: 1000000000000000000,
	quadrillion: 1000000000000000,
	trillion: 1000000000000,
	billion: 1000000000,
	million: 1000000,
	thousand: 1000,
}

function shuffle(arr) {

	for (var i = arr.length; i; i--) {
		var swapIndex = Math.floor(Math.random() * i);
		var temp = arr[i - 1];
		arr[i - 1] = arr[swapIndex];
		arr[swapIndex] = temp;
	}
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

function createProcessing(holder, onDraw, onUpdate, onStart) {
	var canvas = $("<canvas/>", {}).appendTo(holder).css({
		position: "relative",
	});

	var w = canvas.width();
	var h = canvas.height();

	var processingInstance = new Processing(canvas.get(0), function(g) {
		g.size(w, h);
		var t = {
			current: 0,
			start: Date.now(),
			frameCount: 0,
		}

		g.colorMode(g.HSB, 1);
		g.draw = function() {
			var t2 = (Date.now() - t.start) / 1000;
			t.elapsed = t2 - t.current;
			t.current = t2;

			g.pushMatrix();
			g.translate(w / 2, h / 2);
			onDraw(g, t);
			g.popMatrix();

		}
	});

}

function setIDs(obj) {
	$.each(obj, function(key, obj2) {
		obj2.id = key;
	});
	return obj;
}

function setIDDepth(obj, depth, recurseKey) {
	obj.depth = depth;
	var children = obj[recurseKey];
	if (children) {
		var keys = Object.keys(children);
		obj.childCount = keys.length;
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			children[key].id = key;
			children[key].index = i;
			children[key].parent = obj;
			setIDDepth(children[key], depth + 1, recurseKey);

		}
	}
}

function matchCapitalization(src, target) {
	// Uppercase
	if (src.charAt(0).toUpperCase() === src.charAt(0)) {
		return target.charAt(0).toUpperCase() + target.substring(1);
	} else {
		return target.charAt(0).toLowerCase() + target.substring(1);
	}
}

function capitalizeFirst(s) {
	return s.charAt(0).toUpperCase() + s.substring(1);
}

// Unsubtle and a bit inefficient, but works ;-)
function hasDuplicates(arr) {
	for (var i = 0; i < arr.length; i++) {
		for (var j = i + 1; j < arr.length; j++) {
			if (arr[i] === arr[j])
				return true;
		}
	}
	return false;
}

function toCamelCase(s2) {
	var s = "";
	var uppercaseNext = false;
	for (var i = 0; i < s2.length; i++) {
		var c = s2.charAt(i);
		if (c === " ")
			uppercaseNext = true;

		else {
			if (uppercaseNext) {
				uppercaseNext = false;
				s += c.toUpperCase();
			} else
				s += c.toLowerCase();
		}
	}
	s = s.replace(/[.,\/#!?'"%\^&\*;:{}=\-_`~()]/g, "")
	return s;
}

function replaceInAll(array, replacements) {
	return array.map(function(item) {
		var s = item;
		$.each(replacements, function(key, value) {
			var regex = new RegExp(key, "g");
			s = s.replace(regex, value);
		});
		return s;
	})
}



function enumeratePossibleCombos(stepChoices, prefix) {
	var enumerated = [];
	if (!prefix)
		prefix = [];

	var index = prefix.length;
	for (var i = 0; i < stepChoices[index].length; i++) {
		var s = prefix.slice(0);
		s.push(stepChoices[index][i]);
		if (index < stepChoices.length - 1)
			enumerated = enumerated.concat(enumeratePossibleCombos(stepChoices, s));
		else {
			enumerated.push(s);
		}

	}
	return enumerated;
}

function trimAll(arr) {
	return arr.map(function(s) {
		return s.trim();
	});
}

function unsortedEqualArrays(v0, v1) {
	var items0 = v0.slice(0);
	var items1 = v1.slice(0);
	if (items0.length !== items1.length) {
		return false;
	}

	for (var i = 0; i < items1.length; i++) {
		if (items1[i] !== items0[i])
			return false
	}
	return true;
}

function getRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomProp(obj) {
	var keys = Object.keys(obj);
	return obj[getRandom(keys)];
}

function pluralize(s) {
	return s + "s";
}
/*
 * Complete-garbage-hack text parsing utilities.  
 * Someday replace with not-completely-garbage-hack.
 * Or don't.
 */



function isString(s) {
	return typeof s === 'string' || s instanceof String;
}

function isUppercase(code) {
	return (code >= 65 && code <= 90);
}

function isLowercase(code) {
	return (code >= 97 && code <= 122);
}

function isNonEngAlphabet(code) {
	return (code >= 192 && code <= 6870);
}


function isNumeral(code) {
	return (code >= 48 && code <= 57);
}

function isPartEmoji(code) {
	return (code > 50000);
}

function isAlphabet(code) {
	return isNonEngAlphabet(code) || isLowercase(code) || isUppercase(code);
}

function isVowel(c) {
	return "AaEeIiOoUu".indexOf(c) > 0;
}

function isVowelY(c) {
	return "AaEeIiOoUuYy".indexOf(c) > 0;
}

function pluralize(s) {
	var last = s.charAt(s.length - 1).toLowerCase();
	var last2 = s.charAt(s.length - 2).toLowerCase();

	switch (last) {
		case "s":
			return s + "es";
		case "h":
			if (last2 === "s")
				return s + "es";
			if (last2 === "c")
				return s + "es";
			return s + "s";
		case "x":
			return s + "es";
		case "z":
			return s + "zes";
		case "y":
			if (isVowel(last2))
				return s + "s";
			else
				return s.substring(0, s.length - 1) + "ies";
	}
	return s + "s";
}

function getRoundingPrefix(amt, roundedAmt) {
	var amtOver = (amt - roundedAmt);
	//	console.log(amt + " " + roundedAmt + " " + amtOver);

	if (amtOver < -.25)
		return "less than ";

	if (amtOver > .25)
		return "more than ";


	if (Math.abs(amtOver) > .18) {
		return "about ";
	}


	if (amtOver > .1) {
		return "just over ";
	}

	if (amtOver < -.1) {
		return "just under ";
	}


	if (Math.abs(amtOver) > .05) {
		return "almost exactly ";
	}

	return "";
	//return "exactly ";
}

function testReadability() {
	var num = 1;
	for (var i = 0; i < 50; i++) {
		console.log(num.toFixed(2) + " \t => " + toReadableNumber(num));

		num *= 1.14 * Math.random() + 1;
	}
}


var integerNames = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

function toReadableHundreds(amt) {
	var roundedAmt = amt;
	if (amt < 20) {
		if (amt - Math.floor(amt) > .48 && amt - Math.floor(amt) < .51) {
			roundedAmt = Math.floor(amt);
			return integerNames[roundedAmt] + " and a half";
		} else {
			roundedAmt = Math.round(amt);

			if (Math.abs(amt - roundedAmt) > .15)
				return amt.toFixed(1);
			return getRoundingPrefix(amt, roundedAmt) + integerNames[roundedAmt];
		}
	} else {
		if (Math.round(amt) === 100)
			return "one hundred";
		return Math.round(amt);
	}
}


function roundToReadableNumber(amt) {

	if (amt <= 20)
		return Math.round(amt);
	if (Math.round(amt) < 100) {
		return Math.round(amt);
	}

	var digits = Math.floor(Math.log10(Math.round(amt)));
	var power = Math.pow(10, digits - 1);
	return power * Math.round(amt / power);
	/*
		if (Math.round(amt) < 1000) {
			
		}
	*/
}


// 7,490,000 => Seven and a half million
// 74,900,000 => 75 million

function toReadableNumber(amt) {
	// < 100
	if (amt < 1)
		return amt.toPrecision(3);

	var prefix = "";
	if (amt < 100) {
		return toReadableHundreds(amt);
	}

	var bigNumber = [
		[1000000, "thousand", 1000],
		[1000000000, "million", 1000000],
		[1000000000000, "billion", 1000000000],
		[1000000000000000, "trillion", 1000000000000],
		[1000000000000000000, "quadrillion", 1000000000000000],
		[1000000000000000000000, "quintillion", 1000000000000000000],
		[1000000000000000000000000, "sextillion", 1000000000000000000000]
	];

	var roundedAmt = roundToReadableNumber(amt);

	if (roundedAmt < 1000)
		return roundedAmt;

	for (var i = 0; i < bigNumber.length; i++) {
		var v = bigNumber[i];
		if (roundedAmt < v[0]) {
			return toReadableHundreds(amt / v[2]) + " " + v[1];
		}

	}
	//return rounded;
}

function testPluralize() {
	var words = text.split(/\W+/);
	var uniques = {};
	for (var i = 0; i < words.length; i++) {
		uniques[words[i]] = words[i];
	}

	$.each(uniques, function(word) {
		console.log(word + " " + pluralize(word));
	});
}

function objToArray(obj) {
	var vals = [];
	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			vals.push(obj[key]);
		}
	}
	return vals;
}

function mapProperties(array, f) {
	var vals = [];
	for (var key in array) {
		if (array.hasOwnProperty(key)) {
			vals.push(f(array[key], key));
		}
	}
	return vals;
}

function filterProperties(array, f) {
	var found = [];
	for (var key in array) {
		if (array.hasOwnProperty(key)) {
			var val = f(array[key], key);
			if (val)
				found.push(array[key]);
		}
	}
	return found;
}


function getInBrackets(data, openBracket, closeBracket) {

	if (!data)
		throw ("No data ");


	var parsed = {
		bracketContents: [],
		bracketIndices: [],
		notInBrackets: [],
		remainder: ""
	};
	var last = 0;
	var levels = [];

	for (var i = 0; i < data.length; i++) {
		var c = data.charAt(i);
		if (c === openBracket) {
			if (levels.length === 0) {
				var s = data.substring(last, i);
				parsed.notInBrackets.push(s);
			}
			levels.push(i);

		} else if (c === closeBracket) {
			var start = levels.pop();
			if (levels.length === 0) {
				parsed.bracketContents.push(data.substring(start + 1, i));
				parsed.bracketIndices.push(start);
				last = i + 1;
			}
		}
	}
	parsed.notInBrackets.push(data.substring(last));
	parsed.remainder = parsed.notInBrackets.join("");
	return parsed;
}

function removeNumberCommas(s) {
	var s2 = s.charAt(0);
	for (var i = 1; i < s.length - 1; i++) {
		var c = s.charAt(i);
		if (c === ",") {
			if (isNumeral(s.charCodeAt(i - 1)) && isNumeral(s.charCodeAt(i + 1))) {
				// skip
			} else
				s2 += c;


		} else
			s2 += c;

	}
	s2 += s.charAt(s.length - 1);
	return s2;
}


function splitWith(s, options) {
	for (var i = 0; i < options.length; i++) {
		var splitIndex = s.indexOf(options[i]);
		if (splitIndex >= 0) {
			return [s.substring(0, splitIndex), options[i], s.substring(splitIndex + 1)];
		}
	}
	return null;

};

function htmlSpacer(count) {
	var s = "";
	for (var i = 0; i < count; i++) {
		s += "&nbsp";
	}
	return s;
}

function tabSpacer(count) {
	var s = "";
	for (var i = 0; i < count; i++) {
		s += "\t";
	}
	return s;
}

function spacer(count) {
	var s = "";
	for (var i = 0; i < count; i++) {
		s += " ";
	}
	return s;
}

function inParens(s) {
	return '(' + s + ')';
}

function inBrackets(s) {
	return '[' + s + ']';
}

function inCurlyBrackets(s) {
	return '{' + s + '}';
}


function inAngleBrackets(s) {
	return '<' + s + '>';
}

function inQuotes(s) {
	return '"' + s + '"';
}


//==========================================================================

var Vector = Class.extend({

	init: function(x, y, z) {
		// actually another vector, clone it
		if (x === undefined) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			if (x.x !== undefined) {
				this.x = x.x;
				this.y = x.y;
				this.z = x.z;
			} else {
				this.x = x;
				this.y = y;

				this.z = 0;
				if (z !== undefined)
					this.z = z;

			}
		}

		if (!this.isValid())
			throw new Error(this.invalidToString() + " is not a valid vector");
	},

	clone: function() {
		return new Vector(this);
	},

	cloneInto: function(v) {
		v.x = this.x;
		v.y = this.y;
		v.z = this.z;

	},

	addMultiple: function(v, m) {
		this.x += v.x * m;
		this.y += v.y * m;
		this.z += v.z * m;
	},
	addPolar: function(r, theta) {
		this.x += r * Math.cos(theta);
		this.y += r * Math.sin(theta);
	},

	addSpherical: function(r, theta, phi) {
		this.x += r * Math.cos(theta) * Math.cos(phi);
		this.y += r * Math.sin(theta) * Math.cos(phi);
		this.z += r * Math.sin(phi);
	},

	addRotated: function(v, theta) {
		var cs = Math.cos(theta);
		var sn = Math.sin(theta);
		var x = v.x * cs - v.y * sn;
		var y = v.x * sn + v.y * cs;
		this.x += x;
		this.y += y;
	},

	setToPolar: function(r, theta) {
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
	},
	setToCylindrical: function(r, theta, z) {
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
		this.z = z;
	},
	setToPolarOffset: function(v, r, theta) {
		this.x = v.x + r * Math.cos(theta);
		this.y = v.y + r * Math.sin(theta);
		this.z = v.z;
	},
	setToMultiple: function(v, m) {
		this.x = v.x * m;
		this.y = v.y * m;
		this.z = v.z * m;
	},
	setToLerp: function(v0, v1, m) {
		var m1 = 1 - m;
		this.x = v0.x * m1 + v1.x * m;
		this.y = v0.y * m1 + v1.y * m;
		this.z = v0.z * m1 + v1.z * m;
	},

	setToAddMultiple: function(v0, m0, v1, m1) {
		this.x = v0.x * m0 + v1.x * m1;
		this.y = v0.y * m0 + v1.y * m1;
		this.z = v0.z * m0 + v1.z * m1;
	},

	setToDifference: function(v0, v1) {
		this.x = v0.x - v1.x;
		this.y = v0.y - v1.y;
		this.z = v0.z - v1.z;
	},

	setTo: function(x, y, z) {
		// Just in case this was passed a vector
		if (x.x !== undefined) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			if (this.z === undefined)
				this.z = 0;

		} else {
			this.x = x;
			this.y = y;
			if (z !== undefined)
				this.z = z;
		}
		if (!this.isValid())
			throw new Error(this.invalidToString() + " is not a valid vector");

	},

	setScreenPosition: function(g) {
		if (this.screenPos === undefined)
			this.screenPos = new Vector();

		this.screenPos.setTo(g.screenX(this.x, this.y), g.screenY(this.x, this.y));
	},

	magnitude: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},

	normalize: function() {
		this.div(this.magnitude());
	},

	constrainMagnitude: function(min, max) {
		var d = this.magnitude();
		if (d !== 0) {
			var d2 = utilities.constrain(d, min, max);
			this.mult(d2 / d);
		}
	},

	getDistanceTo: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;
		var dz = this.z - p.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},

	getDistanceToIgnoreZ: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;

		return Math.sqrt(dx * dx + dy * dy);
	},

	getAngleTo: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;
		//var dz = this.z - p.z;
		return Math.atan2(dy, dx);
	},

	//===========================================================
	//===========================================================
	// Complex geometry

	dot: function(v) {
		return v.x * this.x + v.y * this.y + v.z * this.z;
	},
	cross: function(v) {
		return new Vector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
	},

	getAngleBetween: function(v) {
		return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
	},

	getCrossAngleBetween: function(v) {
		var cross = this.cross(v);
		if (cross.z > 0)
			return -Math.asin(cross.magnitude() / (this.magnitude() * v.magnitude()));
		else
			return Math.asin(cross.magnitude() / (this.magnitude() * v.magnitude()));
	},

	getNormalizedAngleBetween: function(v) {
		var theta0 = this.getAngle();
		var theta1 = v.getAngle();
		return normalizeAngle(theta1 - theta0);
	},

	isInTriangle: function(triangle) {

		//credit: http://www.blackpawn.com/texts/pointinpoly/default.html
		var ax = triangle[0].x;
		var ay = triangle[0].y;
		var bx = triangle[1].x;
		var by = triangle[1].y;
		var cx = triangle[2].x;
		var cy = triangle[2].y;

		var v0 = [cx - ax, cy - ay];
		var v1 = [bx - ax, by - ay];
		var v2 = [this.x - ax, this.y - ay];

		var dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
		var dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
		var dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
		var dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
		var dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

		return ((u >= 0) && (v >= 0) && (u + v < 1));

	},

	isInPolygon: function(poly) {
		var pt = this;
		for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
		return c;
	},

	//===========================================================
	//===========================================================
	// Add and sub and mult and div functions

	add: function(v) {
		this.x += v.x;
		this.y += v.y;
		this.z += v.z;
	},

	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
	},
	mult: function(m) {
		this.x *= m;
		this.y *= m;
		this.z *= m;
	},
	div: function(m) {
		this.x /= m;
		this.y /= m;
		this.z /= m;
	},
	getOffsetTo: function(v) {
		return new Vector(v.x - this.x, v.y - this.y, v.z - this.z);
	},
	getAngle: function() {
		return Math.atan2(this.y, this.x);
	},

	rotate: function(theta) {
		var cs = Math.cos(theta);
		var sn = Math.sin(theta);
		var x = this.x * cs - this.y * sn;
		var y = this.x * sn + this.y * cs;
		this.x = x;
		this.y = y;
	},

	//===========================================================
	//===========================================================

	// Lerp a vector!
	lerp: function(otherVector, percent) {
		var lerpVect = new Vector(utilities.lerp(this.x, otherVector.x, percent), utilities.lerp(this.y, otherVector.y, percent), utilities.lerp(this.z, otherVector.z, percent));
		return lerpVect;
	},

	//===========================================================
	//===========================================================
	isValid: function() {
		var hasNaN = isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
		var hasUndefined = this.x === undefined || this.y === undefined || this.z === undefined;
		var hasInfinity = Math.abs(this.x) === Infinity || Math.abs(this.y) === Infinity || Math.abs(this.z) === Infinity;

		var valid = !(hasNaN || hasUndefined || hasInfinity);
		// if (!valid)
		//   console.log(hasNaN + " " + hasUndefined + " " + hasInfinity);
		return valid;
	},

	//===========================================================
	//===========================================================
	translateTo: function(g) {
		g.translate(this.x, this.y);
	},

	//===========================================================
	//===========================================================

	bezier: function(g, c0, c1) {
		g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.x, this.y);
	},

	bezierTo: function(g, c0, c1, p) {
		g.bezier(this.x, this.y, c0.x, c0.y, c1.x, c1.y, p.x, p.y);
	},
	bezierWithRelativeControlPoints: function(g, p, c0, c1) {
		// "x" and "y" were not defined, so I added "this." in front. Hopefully that's the intended action (April)
		g.bezierVertex(p.x + c0.x, p.y + c0.y, this.x + c1.x, this.y + c1.y, this.x, this.y);
	},

	vertex: function(g) {
		g.vertex(this.x, this.y);
	},

	offsetVertex: function(g, offset, m) {
		if (m === undefined)
			m = 1;
		g.vertex(this.x + offset.x * m, this.y + offset.y * m);
	},

	drawCircle: function(g, radius) {
		g.ellipse(this.x, this.y, radius, radius);
	},

	drawOffsetCircle: function(g, offset, radius) {
		g.ellipse(this.x + offset.x, this.y + offset.y, radius, radius);
	},

	drawOffsetMultipleCircle: function(g, offset, m, radius) {
		g.ellipse(this.x + offset.x * m, this.y + offset.y * m, radius, radius);
	},

	drawLineTo: function(g, v) {
		g.line(this.x, this.y, v.x, v.y);
	},

	drawOffsetLineTo: function(g, v, m, offset) {
		var mx = m * offset.x;
		var my = m * offset.y;

		g.line(this.x + mx, this.y + my, v.x + mx, v.y + my);
	},

	drawLerpedLineTo: function(g, v, startLerp, endLerp) {
		var dx = v.x - this.x;
		var dy = v.y - this.y;

		g.line(this.x + dx * startLerp, this.y + dy * startLerp, this.x + dx * endLerp, this.y + dy * endLerp);
	},

	drawArrow: function(g, v, m) {
		g.line(this.x, this.y, v.x * m + this.x, v.y * m + this.y);
	},

	drawAngle: function(g, r, theta) {
		g.line(this.x, this.y, r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y);
	},

	drawAngleBall: function(g, r, theta, radius) {
		g.ellipse(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, radius, radius);
	},

	drawArc: function(g, r, theta0, theta1) {
		var range = theta1 - theta0;
		var segments = Math.ceil(range / .2);
		for (var i = 0; i < segments + 1; i++) {
			var theta = theta0 + range * (i / segments);
			g.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta));
		}
	},

	drawText: function(g, s, xOffset, yOffset) {
		g.text(s, this.x + xOffset, this.y + yOffset);
	},
	//===========================================================
	//===========================================================
	toThreeVector: function() {
		return new THREE.Vector3(this.x, this.y, this.z);
	},
	toSVG: function() {
		return Math.round(this.x) + " " + Math.round(this.y);
	},

	toB2D: function() {
		return new Box2D.b2Vec2(this.x, -this.y);
	},

	toCSSDimensions: function() {
		return {
			width: this.x + "px",
			height: this.y + "px",

		}
	},

	//===========================================================
	//===========================================================

	toString: function(precision) {
		if (precision === undefined)
			precision = 2;

		return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ", " + this.z.toFixed(precision) + ")";
	},

	toSimpleString: function() {
		precision = 1;
		return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ")";

	},

	invalidToString: function() {

		return "(" + this.x + ", " + this.y + ", " + this.z + ")";
	},
});

// Class functions
Vector.sub = function(a, b) {
	return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
};

Vector.dot = function(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
};

Vector.polar = function(r, theta) {
	return new Vector(r * Math.cos(theta), r * Math.sin(theta));
};

Vector.angleBetween = function(a, b) {
	return Math.acos(Vector.dot(a, b) / (a.magnitude() * b.magnitude()));
};

Vector.addMultiples = function(u, m, v, n) {
	var p = new Vector();
	p.addMultiple(u, m);
	p.addMultiple(v, n);
	return p;
};

Vector.average = function(array) {
	var avg = new Vector();
	$.each(array, function(index, v) {
		avg.add(v);
	});
	avg.div(array.length);
	return avg;
};

Vector.calculateIntersection = function(p, q, u, v) {
	var s = Vector.sub(p, u);
	var m = (s.y / v.y - s.x / v.x) / (q.x / v.x - q.y / v.y);

	var n0 = s.x / v.x + m * q.x / v.x;

	// for verification
	//var n1 = s.y / v.y + m * q.y / v.y;
	return [m, n0];
};


function mergeObjs(obj0, obj1, obj2, obj3) {
	var obj = {};
	for (var key in obj0) {
		if (obj0.hasOwnProperty(key)) {
			obj[key] = obj0[key];
		}
	}
	if (obj1) {
		for (var key in obj1) {
			if (obj1.hasOwnProperty(key)) {
				obj[key] = obj1[key];
			}
		}
	}

	if (obj2) {
		for (var key in obj2) {
			if (obj2.hasOwnProperty(key)) {
				obj[key] = obj2[key];
			}
		}
	}

	if (obj3) {
		for (var key in obj3) {
			if (obj3.hasOwnProperty(key)) {
				obj[key] = obj3[key];
			}
		}
	}
	return obj;
}

function stripTags(s) {
	return $("<div/>").html("<div>" + s + "</div>").text();
}

function isNonAlphaNum(c) {
	return (c <= 47 || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123));
}

function getFirstNonAlphaNumSequence(s) {
	var startIndex;

	for (var i = 0; i < s.length; i++) {
		var c = s.charCodeAt(i);
		var c2 = s.charAt(i);
		if (isNonAlphaNum(c)) {
			if (startIndex === undefined) {
				startIndex = i;
			}
		} else {
			if (startIndex !== undefined) {
				return s.substring(startIndex, i);
			}
		}
	}

	if (startIndex !== undefined)
		return s.substring(startIndex);
	return "";
}

function getFirstSequence(s, chars) {
	var start = undefined;
	for (var i = 0; i < s.length; i++) {
		var c = s.charAt(i);
		if (chars.indexOf(c) >= 0) {
			if (start === undefined)
				start = i;
		} else {
			if (start !== undefined)
				return {
					index: start,
					sequence: s.substring(start, i)
				}
		}
	}

	if (start === undefined)
		return null;
	return {
		index: start,
		sequence: s.substring(start, i)
	}
}


// HALF ASSED AND BROKEN
var isNumber = function(s) {
	var hasDecimal = false;
	for (var i = 0; i < s.length; i++) {
		var c = s.charAt(i);
		if (c === ".") {
			if (hasDecimal)
				return false;
			hasDecimal = true;
		} else if (c === "-") {
			if (i > 0)
				return false;
		} else {
			var num = isNumeral(s.charCodeAt(i));
			if (!num)
				return false;
		}


	}
	return true;
}

function parseEnglishNumber(s) {
	if (englishNumbers[s] !== undefined) {
		return englishNumbers[s];
	} else if (isNumber(s)) {
		return parseFloat(s);
	}
	return null;
}


var englishNumbers = {
	zero: 0,
	zed: 0,
	one: 1,
	two: 2,
	three: 3,
	four: 4,
	five: 5,
	six: 6,
	seven: 7,
	eight: 8,
	nine: 9
}


function scrollToBottom(div) {
	var objDiv = div.get(0);
	objDiv.scrollTop = objDiv.scrollHeight;
}


var MiniCard = Class.extend({
	init: function(holder, settings) {
		this.div = $("<div/>", {
			class: "minicard"
		}).appendTo(holder);

		if (settings.classes)
			this.div.addClass(settings.classes);

		this.header = $("<div/>", {
			class: "minicard-header"
		}).appendTo(this.div);

		this.title = $("<div/>", {
			class: "minicard-title",
			html: settings.title
		}).appendTo(this.header);

		this.controls = $("<div/>", {
			class: "minicard-controls"
		}).appendTo(this.header);

		this.content = $("<div/>", {
			class: "minicard-content"
		}).appendTo(this.div);
	}
})



function testTree() {
	var variables = ["a", "b", "c", "d", "e", "f", "g", "h"];
	var lhs = getRandom(variables);
	var rhs = getRandom(variables);
	if (Math.random() > .6) {
		lhs = inParens(testTree());
	}
	if (Math.random() > .6) {
		rhs = inParens(testTree());
	}


	return rhs + "->" + lhs
}

function getFirst(s, options) {

	for (var i = 0; i < s.length; i++) {
		var longest = "";

		for (var j = 0; j < options.length; j++) {
			if (s.startsWith(options[j], i)) {
				if (options[j].length > longest)
					longest = options[j];
			}
		}

		if (longest.length > 0)
			return {
				index: i,
				option: longest
			}
	}



}

var panelCount = 0;
var Panel = Class.extend({
	init: function(id, startPos) {



		var panel = this;
		this.id = id;
		this.idNumber = panelCount++;
		var div = $("<div/>", {
			class: "panel",
			id: "panel-" + this.id
		}).appendTo($("#panel-holder"));

		var header = $("<div/>", {
			html: id,
			class: "panel-header"
		}).appendTo(div);

		var content = $("<div/>", {
			class: "panel-content"
		}).appendTo(div);

		// Set the positions
		var savedPos = localStorage.getItem("panel-" + this.id);
		if (savedPos) {
			savedPos = JSON.parse(savedPos);
			this.setPosition(Math.max(0, savedPos.x), Math.max(0, savedPos.y), savedPos.w, savedPos.h);
		} else {
			var pos = {
				x: this.idNumber * 90,
				y: this.idNumber * 20,
				w: 200,
				h: 300
			}
			if (startPos) {
				$.extend(pos, startPos);

			}
			this.setPosition(pos.x, pos.y, pos.w, pos.h);



		}


		// Draggability
		div.draggable({
			start: function() {
				if (app.selectPanel)
					app.selectPanel(id);

				
			},
			stop: function(ev, ui) {
				panel.savePosition(ui.position.left, ui.position.top, div.width(), div.height());
			},
			handle: ".panel-header"
		}).css({
			position: "absolute",
			zIndex: this.idNumber * 10 + 100,
		}).click(function() {
			$(".panel").css({
					zIndex: 90
				});
				$(this).css({
					zIndex: 100
				});
		});

		div.resizable({
			start: function() {
				if (app.selectPanel)
					app.selectPanel(id);
			},
			stop: function(ev, ui) {
				console.log(ui);
				panel.savePosition(ui.position.left, ui.position.top, ui.size.width, ui.size.height);
			}
		});
	},

	savePosition: function(x, y, w, h) {
		var toSave = JSON.stringify({
			x: x,
			y: y,
			w: w,
			h: h
		});
		localStorage.setItem("panel-" + this.id, toSave);
	},

	setPosition: function(x, y, w, h) {
		$("#panel-" + this.id).css({
			left: x,
			top: y,
			width: w,
			height: h
		});


	}
});



function sectionizeOpTree(s, settings) {
	var ops = settings.ops;

	var sections = splitOnUnprotected(s, ops, true);
	sections = sections.map(function(s) {
		if (s.index === undefined) {
			return s.trim();
		}
		return s;
	});

	sections = sections.filter(function(s) {
		if (s.index === undefined) {
			return s.length > 0;
		}
		return s;
	});
	var lastValue;
	for (var i = 0; i < sections.length; i++) {
		var s2 = sections[i];
		// value
		if (s2.index === undefined) {
			lastValue = s2;
		} else {
			if (lastValue === undefined) {

				// Replace monops
				if (settings.replacers[s2.splitter])
					s2.splitter = settings.replacers[s2.splitter];
				s2.monop = true;
			}

			lastValue = undefined;
		}
	}
	return sections;
}


function parseOpTreeSections(sections, settings) {
	// 
	if (sections.length === 0)
		return undefined;

	if (sections.length === 1) {

		var parenSections = splitIntoTopSections(sections[0], "(");
		// Function
		if (parenSections.length > 1) {
			return {
				fxnName: parenSections[0].inner,
				params: splitOnUnprotected(parenSections[1].inner, ",").map(function(param) {
					return parseOpTree(param, settings);
				})
			}
		}

		// Single section, either all in parens, or not
		else {
			var s2 = parenSections[0];
			var s3 = s2.inner;

			if (s2.depth > 0) {
				return parseOpTree(s3, settings);
			} else {
				var v = parseFloat(s3);
				if (isNaN(v)) {

					return {
						path: s3
					}
				} else {
					return {
						number: v
					}
				}

			}
		}
	}

	var splitOp = undefined;
	var splitIndex;
	var lowestPriority = 999;
	for (var i = 0; i < sections.length; i++) {
		var s2 = sections[i];
		// check priority
		if (s2.splitterIndex < lowestPriority) {
			splitOp = s2;
			splitIndex = i;
			lowestPriority = s2.splitterIndex;
		}
	}


	var lhs = sections.slice(0, splitIndex);
	var rhs = sections.slice(splitIndex + 1);
	return {
		lhs: parseOpTreeSections(lhs, settings),
		op: splitOp.splitter,
		rhs: parseOpTreeSections(rhs, settings),
		// replace fake-binops(-) with monops
	}
}

function parseOpTree(s, settings) {

	var sections = sectionizeOpTree(s, settings);
	var tree = parseOpTreeSections(sections, settings);

	return tree;
}

function treeToString(tree) {
	if (tree.op !== undefined) {
		var s = "";
		if (tree.lhs !== undefined)
			s = treeToString(tree.lhs) + " ";
		s += tree.op;
		s += " " + treeToString(tree.rhs);
		return inParens(s);
	}

	if (tree.number !== undefined)
		return tree.number;
	if (tree.path !== undefined)
		return tree.path;

	if (tree.fxnName !== undefined)
		return tree.fxnName + inParens(tree.params.map(function(param) {
			return treeToString(param);
		}).join(","));

}
