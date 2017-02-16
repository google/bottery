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


var mapSections = ["states", "initialBlackboard", "grammar"];


function createEditorUI() {

	// EDITOR
	var editorHolder = $("#panel-editor .panel-content");

	var editPane = $("<div/>", {
		class: "section"
	}).appendTo(editorHolder).css({
		height: "100%"
	});

	var editBar = $("<div/>", {
		class: "section-header",
		id: "edit-controls"
	}).appendTo(editPane);

	var editContent = $("<div/>", {
		class: "section-content",
		id: "edit-json"
	}).appendTo(editPane).css({
		display: "flex",
		flexDirection: "column"
	});

	mapSections.forEach(function(key) {

		var section = $("<div/>", {
			class: "openable-section section",
			id: "section-" + key,
		}).appendTo(editContent).click(function() {
			$(".openable-section").removeClass("open");
			$(this).addClass("open");
		});

		var header = $("<div/>", {
			class: "section-header",
			html: key,
			id: "edit-header-" + key
		}).appendTo(section);

		var content = $("<div/>", {
			class: "openable-section-content section-content",
			contenteditable: true,
			id: "edit-content-" + key,
		}).appendTo(section).css({

		}).on('blur keyup paste input focus', function() {
			var obj = parseJSONSection($(this).text());
			if (obj !== undefined) {
				content.removeClass("error");
				// reconstruct the raw map


			} else {
				content.addClass("error");
			}
		}).click(function() {

		});

	});

	$("#section-states").addClass("open");



	var mapName = $("<div/>", {
		id: "map-name",
		contenteditable: true
	}).appendTo(editBar);

	var reloadButton = $("<button/>", {
		html: "restart"
	}).appendTo(editBar).click(function() {
		// Create a map from this 

		app.loadMap(rebuildMap());
	});

	var copyAll = $("<button/>", {
		html: "copy",
	}).appendTo(editBar).click(function() {
		var map = rebuildMap();

		copyToClipboard(JSON.stringify(map, "null", 2));
	});

	var savebutton = $("<button/>", {
		html: "save",

	}).appendTo(editBar).click(function() {
		save();
	});

	var output = $("<textarea/>", {
		id: "output"
	}).appendTo(editBar);
}


function editMap(map) {
	// show the states, grammar, and 
	for (var i = 0; i < mapSections.length; i++) {
		var s = JSON.stringify(map[mapSections[i]], null, 2);
		$("#edit-content-" + mapSections[i]).html(s);
	}
}

function save() {
	app.map.name = $("#map-name").text();
	console.log("SAVING ", app.map.name);

	var toSave = JSON.stringify(rebuildMap(), "null", 2);

	localStorage.setItem(app.map.name, toSave);
	var found = localStorage.getItem(app.map.name);
	console.log(found);

	app.loadMap(JSON.parse(found));


}



function rebuildMap() {
	var newMap = {};
	$.each(mapSections, function(index, key) {
		var s = $("#edit-content-" + key).text();
		var obj = parseJSONSection(s);

		if (obj) {
			newMap[key] = obj;
		} else {
			console.log("current " + key + " broken, use previous version");
			newMap[key] = app.rawMap[key];
		}

	});
	return newMap;
}


function parseJSONSection(json) {

	var parsed;

	try {
		parsed = JSON.parse(json)
	} catch (ev) {
		// ignore 
	}

	return parsed;
}

function copyToClipboard(text) {


	var target = $("#output");

	target.val(text);
	target.select();
	target.focus();


	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Copying text command was ' + msg);
	} catch (err) {
		console.log('Oops, unable to copy');
	}
}
