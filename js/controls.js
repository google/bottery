// 
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
		this.createSliderControl("exitPause", 0, 1, .5, div);

		this.createSliderControl("sfxVolume", 0, 1, .05, div);

		var buttonDiv = $("<div/>").appendTo(this.holder);

		this.createToggleButton("pause", buttonDiv);
		this.createToggleButton("autoplay", buttonDiv);

		this.clearPos = $("<button/>", {
			html: "clear panel positions"
		}).appendTo(buttonDiv).click(function() {
			for (var i = 0, len = localStorage.length; i < len; ++i) {

				var key = localStorage.key(i);

				if (key && key.startsWith("panel"))
					localStorage.removeItem(key);
			}
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