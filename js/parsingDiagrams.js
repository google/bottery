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

function createMapDiagram(node, holder, settings) {

  if (node === undefined || node === null) {
    return;
  }
  // Array
  if (Array.isArray(node)) {
    var arrayHolder = $("<div/>", {
      class: "traceryparse-array map-array",

    }).appendTo(holder);

    if (settings.classes) {
      arrayHolder.addClass(settings.classes);
    }

    if (settings.label) {
      var label = $("<div/>", {
        class: "small-label",
        text: settings.label

      }).appendTo(arrayHolder);
    }

    var arrayContent = $("<div/>", {
      class: "map-content",
    }).appendTo(arrayHolder);

    $.each(node, function(index, item) {
      createMapDiagram(item, arrayContent, {
        classes: settings.arrayClasses
      });
    });
    return;
  }



  // Create the div and add relevant classes
  var div = $("<div/>", {
    class: "traceryparse-node map-" + node.type,
  }).appendTo(holder);

  if (settings && settings.label) {
    var labelClass =  "small-label";
    if (settings.labelClass)
      labelClass += " " + settings.labelClass;
    var label = $("<div/>", {
      class: labelClass,
      text: settings.label

    }).appendTo(div);
  }

  if (settings && settings.classes) {
    div.addClass(settings.classes);
  }

  if (node.type === "text" || node.type === "number") {
    div.addClass("map-const");
    div.text(node.value);
    return div;
  }



  if (typeof node === "number" || typeof node === "string") {
    div.addClass("map-const");
    div.text(node);
    return div;
  }

  var header = $("<div/>", {
    class: "map-header",
  }).appendTo(div);

  if (node.raw) {
    header.text(node.type + ": " + node.raw.substring(0, 100) + "....");
  }

  header.hide();

  var content = $("<div/>", {
    class: "map-content",
  }).appendTo(div);
  switch (node.type) {
    case "map":
      var stateHolder = $("<div/>", {
        class: "map-stateholder"
      }).appendTo(content);

      $.each(node.states, function(key, state) {

        createMapDiagram(state, stateHolder, {
          label: key,
          labelClass: "stateID"
        });
      });


      break;

    case "state":

      if (node.onEnter.length > 0) {
        createMapDiagram(node.onEnter, content, {
          label: "onEnter",
          classes: "map-onEnter",
        });

      }
      if (node.exits.length > 0) {
        createMapDiagram(node.exits, content, {
          label: "exits",
          classes: "map-exits",
        });
      }
      break;

    case "exit":
      div.dblclick(function(event) {
        useExit(node, app.pointer);
        event.stopPropagation();
      });

      if (node.conditions.length > 0) {
        createMapDiagram(node.conditions, content, {
          arrayClasses: "map-condition"
        });
      }
      content.append("▶");
      createMapDiagram(node.target, content, {
      
        classes: "target stateID"
      });
      if (node.actions.length > 0) {
        createMapDiagram(node.actions, content, {
          arrayClasses: "map-action"
        });
      }
      break;
    case "label":
      content.addClass("label-" + node.labelClass);
      content.text(node.text);
      break;


  case "target":
      content.text(node.raw);
      break;

    case "action":

      div.click(function(event) {
        performAction(node, app.pointer);
        event.stopPropagation();
        return false;
      });

      switch (node.actionType) {

        case "expression":

          createMapDiagram(node.expression, content);
          break;

        case "forEach":
          createMapDiagram(node.action, content);
          createMapDiagram({
            type: "label",
            labelClass: "syntax",
            text: "for"
          }, content);
          createMapDiagram({
            type: "label",
            labelClass: "key",
            text: node.key
          }, content);
          createMapDiagram({
            labelClass: "syntax",
            type: "label",
            text: "in"
          }, content);
          createMapDiagram(node.source, content);
          break;

        case "doOne":

          node.options.forEach(function(option) {
            var line = $("<div/>", {

            }).appendTo(content);
            if (option.condition)
              createMapDiagram(option.condition, line);
            createMapDiagram(option.action, line);

          })
          break;

        case "output":
          createMapDiagram(node.rule, content, {
            classes: "map-say map-outputTemplate"
          });
          break;
        case "setter":
          createMapDiagram(node.target, content);
          createMapDiagram(node.operator, content, {
            classes: "operator operator-setter"
          });
          createMapDiagram(node.expression, content);

          break;
        default:
          controls.addError("Unknown action type " + inQuotes(node.actionType));
          break
      }
      break;

    case "condition":

      div.dblclick(function(event) {
        var s = evaluateCondition(node, app.pointer);
        event.stopPropagation();
      });

      switch (node.conditionType) {
        case "value":

          createMapDiagram(node.target, content);
          createMapDiagram(node.expression, content);
          break;
        case "input":
          createMapDiagram(node.rule, content, {
            classes: "map-say map-inputTemplate"
          });

          break;
        case "expression":
          createMapDiagram(node.expression, content);

          break;
        default:
          createMapDiagram(node.expression, content);
          console.warn("Unknown condition node " + inQuotes(node.conditionType));
          break
      }
      break;

    case "expression":


      createMapDiagram(node.lhs, content, {});
      createMapDiagram(node.operator, content, {
        classes: "operator operator-expression"
      });
      createMapDiagram(node.rhs, content, {});
      break;

    case "path":

      var arrayClasses = "path-step";
      if (node.isFunction)
        arrayClasses += " fxn-name";

      createMapDiagram(node.steps, content, {
        arrayClasses: arrayClasses
      });
      if (node.isFunction)
        div.addClass("map-function");
      if (node.parameters && node.parameters.length > 0) {
        createMapDiagram(node.parameters, content, {
          //  label: "parameters",
          classes: "map-parameters"
        });
      }

      break;
    default:
      console.log("Unknown map node " + inQuotes(node.type), node);
      break
  }

}

function pathToString(path) {
  var s = "[" + path.steps.map(function(s) {
    if (s.type === "number" || s.type === "text") {
      return s.value;
    }
    if (s.type === "path") {

      var s2 = pathToString(s);
      return s2;
    }

    if (s.type === "expression")
      return expressionToString(s);

    else
      console.warn(s);
  }).join(",") + "]";

  if (path.parameters !== undefined) {
    s += inParens(path.parameters.map(expressionToString).join(","));
  }
  return s;
}

function expressionToString(s) {
  return s.raw;
}
