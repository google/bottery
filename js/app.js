// Copyright 2017 Google Inc. All Rights Reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


var app = {
	start: Date.now(),
	autoprogress: false,

	togglePause: function() {
		app.paused = !app.paused;
		console.log(app.paused);
		if (app.paused)
			$("#pause").html("unpause");
		else
			$("#pause").html("pause");
	},

	// Time
	time: {
		start: Date.now() * .001,
		current: 0,
		elapsed: .1,
		frame: 0,
	},

	updateTime: function() {
		var temp = Date.now() * .001 - app.time.start;
		app.time.elapsed = temp - app.time.current;
		app.time.current = temp;
	},

	selectEntity: function(entity) {
		//inspector.inspect(entity);
	},



	loadMapByID: function(id, allowStorage) {
		var found;
		if (allowStorage) {
			found = localStorage.getItem(id);
			console.log("Searched local storage " + id);
		}

		var last = localStorage.setItem("lastMap", id);
		$("#map-select").val(id);

		if (found) {
			app.loadMap(JSON.parse(found), id);
		} else {
			if (!testMaps[id]) 
				id = "amIPsychic";

				app.loadMap(testMaps[id], id);
			
			
		}

	},

	loadMap: function(raw, id) {
		console.log("ID: " + id);

		if (!raw.settings)
			raw.settings = {
				name: id
			};

		$("#map-name").html(id + "_edited");
console.log(raw);
		var loaded = mapCount++;

		// clear current
		chat.clear();


		app.rawMap = raw;
		app.map = parseMap(raw);

		editMap(app.rawMap, $("#edit-json"));


		// clear chat
		var diagramHolder = $("#panel-inspector .panel-content");
		diagramHolder.html("");
		createMapDiagram(app.map, diagramHolder);
		app.pointer = new Pointer();
		app.pointer.enterMap(app.map);
		//inspector.inspect(app.map);

		//console.log(app.pointer);


		/*
				viz.createMapViz(app.map);

			
				app.pointer.updateView();

				inspector.inspect(app.map);
		*/
	}

};
var mapCount = 0;
var updateSpeed = 20;

$(document).ready(function() {



	new Panel("controls", {
		x: 0,
		y: 520,
		w: 320,
		h: 128,
	});
	new Panel("chat", {
		x: 10,
		y: 10,
		w: 310,
		h: 480,
	});

	//new Panel("viz");
	new Panel("blackboard", {
		x: 350,
		y: 420,
		w: 400,
		h: 230
	});
	new Panel("editor", {
		x: 350,
		y: 10,
		w: 400,
		h: 400,
	});
	new Panel("inspector", {
		x: 780,
		y: 10,
		w: 390,
		h: 650,
	});

	new Panel("stateview", {
		x: 900,
		y: 10,
		w: 200,
		h: 200,
	});



	io.init();
	chat.init();
	viz.init();
	inspector.init();
	controls.init();


	function update() {
		console.log("update");
		if (!app.paused && !app.ioLocked) {
			app.pointer.update();
		}
		setTimeout(update, Math.pow(1 - app.updateSpeed, 2) * 450 + 100);
	}

	app.loadMapByID(app.mapName, true);
	update();


});

function nextRound() {
	console.log("NextRound");
	app.pointer.perform("currentPlayer", "=", "(currentPlayer + 1)%playerCount");

	app.pointer.perform("round", "++");
	console.log("Round " + app.pointer.get("round") + " player: " + app.pointer.get("currentPlayer") + " " + app.pointer.get("players[currentPlayer].name"));

	app.pointer.perform("pointsAwarded", "+=", "ceil(random(0)*10)");
	app.pointer.perform("players[currentPlayer].score", "+=", "pointsAwarded");
	console.log(app.pointer.get("pointsAwarded") + " pts for " + app.pointer.get("players[currentPlayer].name"));

	app.pointer.blackboard.updateView();
}
