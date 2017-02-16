/**
 * @author Kate
 */

 function isVowel(c) {
 	var c2 = c.toLowerCase();
 	return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
 };

 function isAlphaNum(c) {
 	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
 };
 function escapeRegExp(str) {
 	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
 }

 var baseEngModifiers = {

 	replace : function(s, params) {
		//http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
		return s.replace(new RegExp(escapeRegExp(params[0]), 'g'), params[1]);
	},

	capitalizeAll : function(s) {
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

	capitalize : function(s) {
		return s.charAt(0).toUpperCase() + s.substring(1);
	},

	allcaps : function(s) {
		var s2 = "";
		for (var i = 0; i < s.length; i++) {
			s2 += s.charAt(i).toUpperCase();
		}
		return s2;
	},

	a : function(s) {
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

	firstS : function(s) {
		console.log(s);
		var s2 = s.split(" ");

		var finished = baseEngModifiers.s(s2[0]) + " " + s2.slice(1).join(" ");
		console.log(finished);
		return finished;
	},

	s : function(s) {
		switch (s.charAt(s.length -1)) {
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
	ed : function(s) {
		switch (s.charAt(s.length -1)) {
			case 's':
			return s + "ed";
			break;
			case 'e':
			return s + "d";
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
			return s + "ed";
		}
	}
};

