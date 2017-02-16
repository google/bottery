/*=======================================================================================
 *
 * Visualization of parsing
 */

function createDiagramPlainNode(holder, value, type) {
	var div = $("<div/>", {
		text: node,
		class: "tracery-node tracery-" + type
	}).appendTo(holder);
}


function createCanvasImg(holder, img) {
	var canvas = $("<canvas/>").appendTo(holder).css({
		display: "inline-block"

	}).css({
		display: "inline-block"
	});
	canvas[0].width = img.width;
	canvas[0].height = img.height;
	var context = canvas[0].getContext('2d');
	//	context.drawImage(img, 0, 0, 128, 128);
	context.putImageData(img, 0, 0);
}

function createDiagram(node, holder, classes) {

	if (node === undefined || node === null) {

		//	console.warn("No node to diagram!");
		return;
	}



	// Array
	if (Array.isArray(node)) {
		var arrayHolder = $("<div/>", {
			class: "traceryparse-array",
		}).appendTo(holder);

		$.each(node, function(index, item) {
			createDiagram(item, arrayHolder, classes);
		});
		return;
	}

	// A Number
	if (!isNaN(node) || node.type === "number") {
		var div = $("<div/>", {
			text: node,
			class: "traceryparse-node traceryparse-number"
		}).appendTo(holder);

		if (!isNaN(node.finished))
			div.text(node.finished);
		return;
	}


	// A String
	if (typeof node === 'string' || node instanceof String || node.type === "text") {

		var div = $("<span/>", {
			text: node,
			class: "traceryparse-text"
		}).appendTo(holder);


		if (node.finished !== undefined)
			div.text(node.finished);


		if (classes) {
			div.addClass(classes);
		}
		return;
	}



	var subNodes = [];

	// Other types of objects

	var div = $("<div/>", {
		class: "traceryparse-holder  traceryparse-node traceryparse-" + node.type
			//	class: "traceryparse-node traceryparse-" + node.type,
	}).appendTo(holder);


	if (node.subtypes) {

		div.addClass(node.subtypes.map(function(s) {
			return "traceryparse-" + s
		}).join(" "));
	}


	var header = $("<div/>", {
		text: node.raw,
		class: "traceryparse-header",
	}).appendTo(div);
	//header.hide();



	var content = $("<div/>", {
		class: "traceryparse-content",
		//class: "traceryparse-content",
	}).appendTo(div);

	var subnodeHolder = $("<div/>", {
		class: "traceryparse-subnodes",
		//class: "traceryparse-content",
	}).appendTo(content);

	var baseNodes = $("<div/>", {
		class: "traceryparse-baseNodes",
	}).appendTo(content);

	var footer = $("<div/>", {
		class: "traceryparse-footer",
	}).appendTo(content);

	switch (node.type) {


		case "expression":
			if (node.expressionType === "if") {
				createDiagram(node.trueValue, content);
				content.append("<span class='traceryparse-minitext'> if </span>");
				createDiagram(node.condition, content);

				if (node.elseValue !== undefined) {
					content.append("<span class='traceryparse-minitext'> else </span>");
					createDiagram(node.elseValue, content);
				}

			}
			if (node.expressionType === "operator")
				subNodes = [node.lhs, node.operator, node.rhs];
			break;

		case "ruleGenerator":
			div.addClass("traceryparse-" + node.rgType);
			switch (node.rgType) {
				case "rg-address":
					subNodes = [node.address];


					break;


				case "rg-rule":
					subNodes = [node.rule];


					break;


				case "rg-filter":
					createDiagram(node.source, content);
					content.append("<span class='traceryparse-minitext'> if </span>");

					createDiagram(node.conditions, content)
					break;

				case "rg-for":

					createDiagram(node.templateExpression, content);

					var forLoopHolder = $("<div>", {
						class: "traceryparse-forloopholder"
					}).appendTo(content);
					$.each(node.loops, function(index, loopParams) {
						var div = $("<div>", {
							class: "traceryparse-forloop"
						}).appendTo(forLoopHolder);
						div.append("<span class='traceryparse-minitext'>for </span>");
						createDiagram(loopParams.key, div);
						div.append("<span class='traceryparse-minitext'> in </span>");
						createDiagram(loopParams.source, div);
					})

					break;

				case "rg-concatenation":

					subNodes = [node.concatenateRules];


					break;
				default:
					console.warn("Unknown type of rule generator " + node.rgType, node);
			}

			break;

		case "stackAction":
			subNodes = [node.address, node.operator, node.ruleGenerator, node.command];

			break;


		case "tag":
			//subNodes = node.preactions.slice(0);
			subNodes.push(node.address);
			createDiagram(node.rule, baseNodes);
			subNodes = subNodes.concat(node.modifiers);
			//subNodes = subNodes.concat(node.postactions);

			break;


		case "rule":
			subNodes = node.sections.slice(0);

			break;


		case "address":
			// types of addresses
			// Paths /foo/5/bar
			// Dynamic bar{#foo#}bar
			// Key

			if (node.context)
				content.addClass("traceryparse-" + node.context);


			if (node.path !== undefined) {
				content.addClass("traceryparse-path");
				$.each(node.path, function(index, pathAddress) {
					createDiagram(pathAddress, content);
				});
			} else {
				content.addClass("traceryparse-" + node.keyType);

				if (node.isFunction)
					content.addClass("traceryparse-function");

				if (node.isSymbolKey)
					content.addClass("traceryparse-symbolKey");


				var prefixHolder = $("<div/>", {
					class: "traceryparse-prefix",
				}).appendTo(content);

				// if a dynamic key
				if (node.dynamicSections !== undefined) {
					var sectionHolder = $("<div/>", {
						class: "traceryparse-sections",
					}).appendTo(prefixHolder);


					$.each(node.dynamicSections, function(index, subnode) {
						createDiagram(subnode, sectionHolder);
					});

				}

				if (node.key !== undefined) {
					var sectionHolder = $("<div/>", {
						text: node.key
					}).appendTo(prefixHolder);
				}

				if (node.parameters && node.parameters.length > 0) {
					var parameterHolder = $("<div/>", {
						class: "traceryparse-parameters",

					}).appendTo(content);

					$.each(node.parameters, function(index, subnode) {
						createDiagram(subnode, parameterHolder);
					});
				}


			}

			break;


		case "path":

			subNodes = node.path.slice(0);
			break;
		case "data":
			// draw image


			break;

		default:
			console.log("Unknown node type: " + node.type);

	}


	if (node.wasProtected) {
		content.addClass("traceryparse-nodeprotected");
	}


	if (subNodes.length > 0) {


		$.each(subNodes, function(index, subnode) {
			createDiagram(subnode, subnodeHolder);
		});
	}


	// Add the finished elements to an array
	if (Array.isArray(node.finished)) {

		$.each(node.finished, function(index, subNode) {
			createDiagram(subNode, footer);
		});
	} else {
		if (node.midsteps) {
			node.midsteps.forEach(function(step) {

				if (step.type === "data") {
					createCanvasImg(footer, step.data);
				} else {
					footer.append(step);
				}

			});

		}
		if (node.finished && node.finished.type === "data") {
			createCanvasImg(footer, node.finished.data);
		} else {
			footer.append(node.finished);
		}


	}


	if (node.errors && node.errors.length > 0) {
		var errors = $("<div/>", {
			html: node.errors.concat("<br>"),
			class: "traceryparse-errors",
		}).appendTo(content);
	}


}