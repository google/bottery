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


/*
 * Chat functionality
 */

var chat = {
	bubbles: [],

	init: function() {
		chat.chatHolder = $("<div/>", {
			class: "chat-holder"
		}).appendTo($("#panel-chat .panel-content"));

		chat.bubbleHolder = $("<div/>", {
			class: "chat-bubbles"
		}).appendTo(chat.chatHolder);


		// Create the chat
		chat.dataRow = $("<div/>", {
			class: "chat-datarow"

		}).appendTo(chat.chatHolder);

		// Create the chat
		chat.chipRow = $("<div/>", {
			class: "chat-inputrow"

		}).appendTo(chat.chatHolder);

		// Create the chat
		chat.inputRow = $("<div/>", {
			class: "chat-inputrow"

		}).appendTo(chat.chatHolder);

		// text field
		var inputHolder = $("<div/>", {
			class: "chat-inputholder"
		}).appendTo(chat.inputRow);

		chat.inputField = $("<input/>", {
			class: "chat-inputfield"

		}).appendTo(inputHolder).keyup(function(e) {
			if (e.keyCode === 13) {
				chat.say(1, $(this).val());
				$(this).val("");
			}
		});


	},

	setChips: function(chips) {
		var chat = this;
		chat.chipRow.html("");
		$.each(chips, function(index, chip) {
			var chipDiv = $("<div/>", {
				class: "chat-chip",
				html: chip.displayText,
			}).appendTo(chat.chipRow).click(function() {
				chat.say(1, chip.inputText);
				chat.clearChips();
			});

		});
	},

	clearChips: function() {
		chat.chipRow.html("");
	},

	clear: function() {
		chat.bubbleHolder.html("");
		chat.clearChips();
	},

	say: function(who, s) {
		//console.log(who + ": " + s);
		chat.createBubble(who, s);


		chat.bubbleHolder.scrollTop(chat.bubbleHolder[0].scrollHeight);

		// If human
		if (who === 1)
			io.input("chat", s);
	},

	createBubble: function(who, s) {
		var bubbleRow = $("<div/>", {
			class: "chat-bubblerow  chat-owner" + who,
		}).appendTo(chat.bubbleHolder);

		var bubble = $("<div/>", {
			class: "chat-bubble",
			html: s,
		}).appendTo(bubbleRow);

	}



}
