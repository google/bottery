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


// View the currently selected node
var inspector = {
	init: function() {
		this.holder = $("#panel-inspector .panel-content");
	},

	// Inspect an edge, node, etc
	inspect: function(entity) {
		this.holder.html("");
		this.root = new InspectorNode(entity, this.holder);
	}
}


// The div for an 
var InspectorNode = Class.extend({
	init: function(entity, holder) {
		var node = this;
		this.div = $("<div/>", {
			class: "inspector-node inspector-" + entity.type
		}).appendTo(holder);


		this.div.header = $("<div/>", {
			html: entity.name,
			class: "inspector-header"
		}).appendTo(this.div);


		this.div.content = $("<div/>", {
			class: "inspector-content"
		}).appendTo(this.div);

		$("<div/>", {
			class: "inspector-raw",
			html: entity.raw,
		}).appendTo(this.div.header);


		this.subNodes = [];
		switch (entity.type) {
			case "map":
				$.each(entity.exits, function(index, exit) {
					node.subNodes.push(new InspectorNode(exit, node.div.content));
				});
				$.each(entity.states, function(index, state) {
					node.subNodes.push(new InspectorNode(state, node.div.content));
				});


				break;

			case "state":

				var enterActions = $("<div/>", {
					class: "inspector-enterActions",
				}).appendTo(this.div.content);

				var exitHolder = $("<div/>", {
					class: "inspector-exitHolder",
				}).appendTo(this.div.content);

				$.each(entity.onEnter, function(index, action) {
					node.subNodes.push(new InspectorNode(action, enterActions));
				});

				$.each(entity.exits, function(index, exit) {
					node.subNodes.push(new InspectorNode(exit, exitHolder));
				});
				break;

			case "exit":

				var edgeCols = $("<div/>", {
					class: "inspector-colholder",
				}).appendTo(this.div.content);

				var conditionCol = $("<div/>", {
					class: "inspector-col",
				}).appendTo(edgeCols);

				var toCol = $("<div/>", {
					class: "inspector-col",
				}).appendTo(edgeCols);

				toCol.append("►");
				var destinationChip = $("<div/>", {
					html: entity.target,
					class: "inspector-chip",

				}).appendTo(toCol).click(function() {

				});

				var actionCol = $("<div/>", {
					class: "inspector-col",
				}).appendTo(edgeCols);

				$.each(entity.conditions, function(index, condition) {
					new InspectorNode(condition, conditionCol);
				});

				$.each(entity.actions, function(index, action) {
					new InspectorNode(action, actionCol);
				});

				break;

			case "condition":
				break;

			case "action":
				this.div.header.hide();
				this.div.addClass("action-" + entity.actionType);

				switch (entity.actionType) {
					case "set":
						entity.target.toView(this.div.content);

						$("<div/>", {
							class: "chip op-chip",
							html: entity.op
						}).appendTo(this.div.content);
						break;
					case "say":
						this.div.content.html(entity.toSay);
						break;
					case "wait":
						break;
					case "push":
						break;
				}

				this.div.click(function() {
					entity.perform(app.pointer);
				})

				break;
		}


	}
});
