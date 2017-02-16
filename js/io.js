/*
 * IO functionality
 * accept input
 * create AI output
 */



var io = {
	outputQueue: [],

	lastOutput: 0,

	init: function() {
		io.logHolder = $("<div/>", {
			id: "debug-log",
		}).appendTo($("#panel-debug .panel-content"));


	},


	textToSpeech: function(text, onFinish, onFinishEach) {

		var hollyPrefix = "https://voice-search-prod.sandbox.google.com/synthesize?sky=rad_b924-18a3-c08b-451c&client=webpatts&lang=en-us&engine=Phonetic+Arts&name=" + voices[app.voice] + "&enc=mpeg&speed=" + app.voiceSpeed.toFixed(2) + "&text=";
		if (!Array.isArray(text)) {
			text = [text];
		}
		var index = 0;

		function iterate() {
			var singleText = text[index];

			// Using an audio object
			var aud = new Audio(hollyPrefix + singleText);

			aud.play();
			aud.volume = Math.pow(app.voiceVolume, 2);

			// Interrupting a current voice output?
			if (app.speaking)
				console.warn("Voice interrupt");

			app.speaking = true;

			var finished = false;

			function finish() {
				if (!finished) {
					console.log("finish speaking");
					app.speaking = false;

					if (onFinishEach)
						onFinishEach(singleText);

					index++;
					if (index < text.length) {
						iterate();
					} else {
						if (onFinish)
							onFinish();
					}
					finished = true;
				}
			}

			// Allow finishing events with either event end, or timeout (for broken audio)
			aud.addEventListener("ended", finish);
			//setTimeout(finish, text.length * 50 + 200);

		}

		iterate();
	},


	playSound: function(filename, volume) {
		if (volume === undefined)
			volume = .8;

		var aud = new Audio("audio/" + filename);
		//aud.setVelocity(Math.random()),
		aud.volume = Math.pow(app.sfxVolume * volume, 2);
		aud.play();
	},

	output: function(s, onFinishEach, onFinish) {

		if (!Array.isArray(s)) {
			if (!isString(s)) {
				s = [s + ""];
			} else {
				s = s.split("\n");
			}
		}


		// remove any empty strings
		s = s.filter(function(s2) {
			return s2.trim().length > 0;
		});

		// for each section to say, add it to the queue 
		// with handlers on what to do when its done outputting
		for (var i = 0; i < s.length; i++) {

			var s2 = {
				data: s[i],
			}
			if (i < s.length - 1) {
				s2.onFinish = onFinishEach;
			} else {
				if (onFinish)
					s2.onFinish = function() {
						onFinish();
						if (onFinishEach)
							onFinishEach();
					}
			}
			io.outputQueue.push(s2);
		}


		io.attemptOutput();
	},

	attemptOutput: function() {

		var section = io.outputQueue.shift();

		if (section && !io.isOccupied) {

			// Occupy this channel when in use
			io.isOccupied = true;

			// Callback on text if text-only

			// Activate Chat with timer	
			chat.say(0, section.data);

			// on finish
			function outputDone() {
				if (section.onFinish)
					section.onFinish();
				io.isOccupied = false;
				io.attemptOutput();
			}

			if (app.outputMode === "text") {
				var readTime = Math.sqrt(section.data.length) * 50 + 200;
				setTimeout(function() {
					outputDone();
				}, readTime);
			} else {

				io.textToSpeech(section.data, function() {
					outputDone();
				});
			}


			io.debugLog("Ouput" + inParens(io.outputMode) + ":" + inQuotes(section.data));
		} else {
			// push it back on the queue
			if (section !== undefined)
				io.outputQueue.unshift(section);
		}
	},

	// Some input has arrived, by voice or text
	input: function(source, s) {
		io.debugLog("Input received" + inParens(source) + ":" + inQuotes(s));

		app.pointer.handleInput(s);
	},

	debugLog: function(s) {

		io.logHolder.append("<div class='debug-line'>" + s + "<div/>");
		// scroll to bottom
		if (io.logHolder[0])
			io.logHolder.scrollTop(io.logHolder[0].scrollHeight);

	}

}