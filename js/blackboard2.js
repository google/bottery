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

// A queryable and updateable blackboard

// blackboard object
var BBO = function(viewHolder) {

	this.createView(viewHolder);
};


BBO.prototype.getFromPath = function(path, pointer) {

	if (path.length === 0) {
		if (this.value !== undefined)
			return this.value;
		return this;
	}


	var nextKey = path[0];


	if (nextKey.type !== undefined) {

		nextKey.value = evaluateExpression(nextKey, pointer);
	}


	if (nextKey.value !== undefined)
		nextKey = nextKey.value;

	// Overrides for math and other default functions
	if (path.length === 1) {
		if (nextKey === "length") {
			return Object.keys(this.children).length;
		}

		if (basicFunctions[nextKey] !== undefined) {
			return basicFunctions[nextKey];
		}

		if (Math[nextKey] !== undefined) {
			return Math[nextKey];
		}
	}

	if (this.children === undefined || this.children[nextKey] === undefined) {
		controls.addError(inQuotes(nextKey) + " is not in the blackboard");
		return undefined;
	}


	var v = this.children[nextKey].getFromPath(path.slice(1), pointer);

	if (v !== undefined) {
		if (v.toObj)
			return v.toObj();
		return v;
	}

}

BBO.prototype.toObj = function() {
		var bbo = this;
		// array or obj
		if (this.children !== undefined) {
			var keys = Object.keys(this.children);
			// Are all the keys numerical
			var isArray = keys.filter(key => isNaN(key)).length === 0;
			if (isArray) {
				var arr = [];
				keys.forEach(key => arr[key] = bbo.children[key].toObj());
				return arr;
			} else {
				var obj = {};

				keys.forEach(key => obj[key] = bbo.children[key].toObj());
				return obj;
			}


		} else {
			return this.value;
		}
	},

	BBO.prototype.setFromPath = function(path, val, pointer) {
		var bbo = this;
		if (!Array.isArray(path))
			path = [path];

		// End of the path, place this value here
		if (path.length === 0) {
			if (this.children !== undefined) {
				console.warn("setting parent node to a value ", val);
				this.removeChildren();
			}

			if (typeof val === 'object') {

				this.initChildren();

				$.each(val, function(key, val) {
					bbo.setFromPath(key, val, pointer);
				})
				return true;
			} else {

				// Set a simple value
				this.value = val;
				// update the view
				if (val === undefined || val === null)
					this.view.html("--removed--");
				else
					this.view.html(val);
				return true;
			}



		}
		// is this the last path object?
		var nextKey = path[0];

		if (nextKey.steps) {
			nextKey = evaluateExpression(nextKey, pointer);
			console.log("DOUBLE PATH: " + nextKey);
		} else {
			if (nextKey.value !== undefined)
				nextKey = nextKey.value;
		}



		// create children and a child view

		if (!this.children) {
			if (this.value !== undefined) {
				this.view.html("");
				this.value = undefined;
			}

			this.initChildren();
		}



		if (this.children[nextKey] === undefined) {
			// Create a line and a label
			var childLine = $("<div/>", {
				class: "bbo-childline",
			}).prependTo(this.view.children);

			var childLabel = $("<div/>", {
				class: "bbo-childlabel",
				html: nextKey
			}).appendTo(childLine);

			this.children[nextKey] = new BBO(childLine, bbo);
		}

		var ok = this.children[nextKey].setFromPath(path.slice(1), val, pointer);

		return ok;
	};

BBO.prototype.initChildren = function() {
	// create the child view
	this.view.children = $("<div/>", {
		class: "bbo-children",
	}).prependTo(this.view);
	this.view.addClass("bbo-parent");
	this.children = {};
};

BBO.prototype.removeChildren = function() {
	this.view.children.remove();
	this.children = undefined;
	this.view.removeClass("bbo-parent");
};

BBO.prototype.removeAt = function(key) {
	if (!isNaN(parseFloat(key))) {
		var nodes = [];
		var keys = Object.keys(this.children);
		console.log(keys, key);
		var order = [];
		for (var i = 0; i < keys.length; i++) {

			var key2 = parseFloat(keys[i]);
			if (key2 !== key) {
				order.push(this.children[key2]);
				delete this.children[key2];
			} else {
				console.log("FOUND");
			}
		}

		for (var i = 0; i < order.length; i++) {
			this.children[i] = order[i];
		}
		console.log(this.children);
	}
};

BBO.prototype.createView = function(holder) {


	this.view = $("<div/>", {
		class: "bbo"
	}).appendTo(holder);

};

function createBasicFunctions() {



	var basicFunctions = {
		// Shuffle and return an array
		shuffle: function(arr) {
			var arr2 = [];


			// Convert back to an array from a bbo
			if (typeof arr === 'object') {

				$.each(arr, function(index, v) {

					arr2[index] = v;
				});
			} else {
				arr2 = arr.slice(0);
			}


			//Fisher-Yates Shuffle

			var counter = arr2.length;

			// While there are elements in the array
			while (counter > 0) {
				// Pick a random index
				var index = Math.floor(Math.random() * counter);

				// Decrease counter by 1
				counter--;

				// And swap the last element with it
				var temp = arr2[counter];
				arr2[counter] = arr2[index];
				arr2[index] = temp;
			}


			return arr2;
		},

		hash: function(s) {

			console.log("hash " + s);
			var amt = 0;
			for (var i = 0; i < s.length; i++) {
				amt += s.charCodeAt(i);
			}
			return amt % 100;

			return 0;
		},

		play: function(filename) {
			var audio = new Audio("audio/" + filename);
			audio.volume = .2;
			audio.play();
		},


		inputMatches: function(expression) {
			var val = this.get("INPUT");
			if (val !== undefined) {
				console.log(val);
				console.log("input match", expression);
				return val.toUpperCase() === expression.toUpperCase();
			}
			return false;
		},


		select: function(source) {
			console.log("SELECT", source);
			if (source.children === undefined && !Array.isArray(source)) {
				console.log("single source");
				if (source.toObj)
					return source.toObj();
				return source;
			}
			if (Array.isArray(source)) {
				var selected = getRandom(source);
				console.log(selected);
				return selected;
			}
			console.log("bbo");
			var keys = Object.keys(source.children);
			var key = getRandom(keys);
			return source.children[key];
		},

		deleteAt: function(target, index) {
			target.removeAt(index);
		},


		create: function(recipeName, count, level) {
			var pointer = this;

			var recipe = pointer.map.contentRecipes[recipeName];
			var steps = splitOnUnprotected(recipe, " ", false, openChars, closeChars).map(function(s) {
				var s2 = splitOnUnprotected(s, ":", false, openChars, closeChars);
				var step2 = {
					key: s2[0],
					expression: parseMapExpression(s2[1])
				};
				return step2;

			});

			var g = {};
			steps.forEach(step => g[step.key] = evaluateExpression(step.expression, pointer));

			var pathRaw = recipeName + "s[" + recipeName + "s.length]";
			var path = parseMapPath(pathRaw);
			pointer.set(path, g);

		}
	};

	// More expressive random
	basicFunctions.random = function(a, b) {
		if (b !== undefined)
			return Math.random() * (b - a) + a;
		if (a !== undefined)
			return Math.random() * a;
		return Math.random();
	}
	basicFunctions.randomInt = function(a, b) {
		if (b !== undefined)
			return Math.floor(Math.random() * (b - a) + a);
		if (a !== undefined)
			return Math.floor(Math.random() * a);
		return Math.round(Math.random());
	}


	// More expressive random
	basicFunctions.randomIndex = function(arr) {
		if (arr === undefined)
			return -1;
		var keys = Object.keys(arr);
		var key = getRandom(keys);
		console.log(keys, key);
		return key;
	}
	return basicFunctions;
}

var basicFunctions = createBasicFunctions();
