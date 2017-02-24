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

var voices = {
	aussieLady: "afh",
	indianLady: "ahp",
	chillIndianLady: "cxx",
	britDude: "rjs",
	lightDude: "sfg-vocoded%23male_1",
	mellowDude: "sfg-vocoded%23male_3",
	mrGameshow: "tpb-vocoded",
	chillLady: "tpc-vocoded",

	unchillBritLady: "fis",

	holly: "hol",
}

function clearDataWithPrefix(prefix) {
	for (var i = 0, len = localStorage.length; i < len; ++i) {
		var key = localStorage.key(i);
		if (key && key.startsWith(prefix))
			localStorage.removeItem(key);
	}
}
var controls = {
	init: function() {
		//console.log("Init controls");
		createEditorUI();

		// CONTROLS

		// Load previous controls
		this.holder = $("<div/>", {
			class: "control-holder"
		}).appendTo($("#panel-controls .panel-content"));


		this.createRadioControl("outputMode", ["text", "speech", "both"]);

		this.createDropdownControl("voice", Object.keys(voices));
		this.createDropdownControl("mapName", Object.keys(testMaps), function(mapName) {
			console.log("load map " + mapName);
			app.loadMapByID(mapName, false);
		});

		var div = $("<div/>").appendTo(this.holder);
		this.createSliderControl("voiceVolume", 0, 1, .05, div)
		this.createSliderControl("voiceSpeed", 0, 1, .05, div);
		this.createSliderControl("updateSpeed", 0, 1, .05, div);
		this.createSliderControl("exitPause", 0, 1, .05, div);

		this.createSliderControl("sfxVolume", 0, 1, .05, div);

		var buttonDiv = $("<div/>").appendTo(this.holder);

		this.createToggleButton("pause", buttonDiv);
		this.createToggleButton("autoplay", buttonDiv);



		this.clearPos = $("<button/>", {
			html: "clear panel positions"
		}).appendTo(buttonDiv).click(function() {
			clearDataWithPrefix("panel_");
		});


		this.clearSavedData = $("<button/>", {
			html: "clear saved data for this map"
		}).appendTo(buttonDiv).click(function() {
			clearDataWithPrefix("savedata_" + app.map.id + "_");
		});

		this.clearAllSavedData = $("<button/>", {
			html: "clear all saved data"
		}).appendTo(buttonDiv).click(function() {
			clearDataWithPrefix("savedata_");
		});


		this.errors = $("<div/>", {
			class: "error-holder"
		}).appendTo($("#panel-controls .panel-content"));
		// voice toggle

	},

	addError: function(error) {
		console.warn(error);
		this.errors.append("<div>" + error + "</div>");
	},

	clearErrors: function() {
		this.errors.html("");
	},


	changeVal: function(key, val, onChange) {
		app[key] = val;
		localStorage.setItem("control-" + key, val);
		//console.log(key + " = " + app[key]);

		if (onChange) {
			onChange(app[key]);
		}
	},

	getDefaultValue: function(key, defaultVal) {
		var val = localStorage.getItem("control-" + key);
		if (val === null) {
			val = defaultVal;
		}
		//console.log("Loaded val " + key + " = " + val);
		return val;
	},

	createToggleButton: function(key, div, onChange) {

		var button = $("<button/>", {
			html: key,
			class: "toggle"
		}).appendTo(div).click(function() {

			controls.changeVal(key, !app[key], onChange);

			if (app[key])
				button.addClass("toggle-on");
			else
				button.removeClass("toggle-on");
		});

		var val = controls.getDefaultValue(key, "false") === "true";
		app[key] = val;
		if (val)
			button.addClass("toggle-on");
	},

	createSliderControl: function(key, min, max, step, div, onChange) {
		var holder = $("<div/>", {
			class: "slider-holder",
		}).appendTo(div);

		var header = $("<div/>", {
			class: "slider-header",
		}).appendTo(holder);

		var label = $("<div/>", {
			html: key,
			class: "slider-label",
		}).appendTo(header);

		var value = $("<div/>", {
			class: "slider-value",
		}).appendTo(header);

		var bar = $("<div/>", {
			class: "slider-bar",
		}).appendTo(holder);

		bar.slider({
			min: min,
			max: max,
			step: step,
			slide: function(ev, ui) {
				var val = ui.value;
				value.html(val.toFixed(2));
				app[key] = val;
				controls.changeVal(key, val, onChange);
			}
		});

		var val = controls.getDefaultValue(key, .5);
		val = parseFloat(val);
		value.html(val.toFixed(2));
		bar.slider('value', val);
		app[key] = val;
	},

	createRadioControl: function(key, options, onChange) {


		// Create the options
		for (var i = 0; i < options.length; i++) {
			this.holder.append('<input type="radio" value="' + options[i] + '" name="' + key + '">' + options[i]);
		}
		$('input[type=radio][name=' + key + ']').change(function() {
			controls.changeVal(key, $(this).val(), onChange);

		});

		var val = controls.getDefaultValue(key, options[0]);
		$('input[type=radio][name=' + key + '][value=' + val + ']').prop('checked', true);
		app[key] = val;
	},


	createDropdownControl: function(key, options, onChange, holder) {
		// Check for value

		if (holder === undefined)
			holder = this.holder;

		var select = $("<select id='control-" + key + "'/>").appendTo(holder);
		for (var i = 0; i < options.length; i++) {
			select.append("<option>" + options[i] + "</option>");
		}

		select.change(function() {
			var val = select.val();
			app[key] = val;
			localStorage.setItem("control-" + key, val);
			if (onChange)
				onChange(val);
		})

		var val = controls.getDefaultValue(key, options[0]);
		app[key] = val;
		select.val(val);
	},
}


var panelCount = 0;

function Panel(id, startPos) {



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
};

Panel.prototype.savePosition = function(x, y, w, h) {
	var toSave = JSON.stringify({
		x: x,
		y: y,
		w: w,
		h: h
	});
	localStorage.setItem("panel-" + this.id, toSave);
};

Panel.prototype.setPosition = function(x, y, w, h) {
	$("#panel-" + this.id).css({
		left: x,
		top: y,
		width: w,
		height: h
	});
}
