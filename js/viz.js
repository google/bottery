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

var viz = {
  init: function() {
    var holder = $("#panel-viz .panel-content");
    this.vizHolder = $("<div/>", {
      id: "viz"
    }).appendTo(holder);

    /*
        this.minipanel = $("<div/>", {
          id: "viz-mini"
        }).appendTo(holder);
    */
  },

  setClassesIf: function(entity, classes, cond) {
    if (entity && this.cytoscape) {
      var id = '#' + entity.type + "-" + entity.key;
      if (cond)
        this.cytoscape.$(id).addClass(classes);
      else
        this.cytoscape.$(id).removeClass(classes);
    }
  },

  setClassesExclusive: function(entity, classes) {
    if (entity && this.cytoscape) {
      this.cytoscape.$("." + entity.type).removeClass(classes);
      var id = '#' + entity.type + "-" + entity.key;
      this.cytoscape.$(id).addClass(classes);
    }
  },

  removeExitClasses: function() {
    if (this.cytoscape) {
      this.cytoscape.$(".exit").removeClass("open");
      this.cytoscape.$(".exit").removeClass("active");
    }
  },


  createExitData: function(exit, originalID, statesReferenced) {

    if (exit.target) {
      var targetKey = exit.target.raw;
      var target = "state-" + targetKey;

      // self
      if (targetKey === "self") {
        target = originalID;
      }
      if (statesReferenced[targetKey] === undefined)
        statesReferenced[targetKey] = 0;
      statesReferenced[targetKey]++;

      return {
        data: {
          target: target,
          id: "exit-" + exit.key,
          label: exit.label,

        },
        classes: "exit"
      }
    } else {
      console.warn("No exit data for " + inQuotes(exit.raw));
    }
  },

  mapToCytoData: function(map) {


    var statesReferenced = {};
    var cytoData = [];
    $.each(map.states, function(key, state) {
      var stateID = "state-" + state.key;
      cytoData.push({
        data: {
          id: stateID,
          label: state.key,
        },
        classes: "state"
      });

      $.each(state.exits, function(key, exit) {

        var exitData = viz.createExitData(exit, stateID, statesReferenced);
        if (exitData) {
          exitData.data.source = stateID;
          cytoData.push(exitData);
        }
      });

    });

    $.each(statesReferenced, function(key, count) {
      // create a dummy state
      if (map.states[key] === undefined) {
        var stateID = "state-" + key;
        cytoData.push({
          data: {
            id: stateID,
            label: key,
          },
          classes: "state state-missing"
        });
        console.warn("Missing state: " + inQuotes(key));
      }
    })

    return cytoData;

  },

  createMapViz: function(map) {

    // find all missing states


    try {
      this.cytoscape = cytoscape({
        container: this.vizHolder,
        elements: this.mapToCytoData(map),
        style: [{
          selector: '.state',
          style: {
            'width': 'label',
            'color': 'rgb(255, 255, 255)',
            'background-color': '#666',
            'text-valign': 'center',
            'shape': "roundrectangle",
            'label': 'data(label)',

          }
        }, {
          selector: 'node.highlighted',
          style: {
            'background-color': 'blue',

          }
        }, {
          selector: 'node.state-missing',
          style: {
            'background-color': 'darkred',

          }
        }, {
          selector: 'node.active',
          style: {
            'background-color': 'blue',

          }
        }, {
          selector: 'node.dot',
          style: {
            'color': 'rgb(255, 255, 255)',
            'background-color': '#666',
            'text-valign': 'center',
            'shape': "roundrectangle",
            'label': 'data(label)',

            'shape': "ellipse",

            'width': 20,
            'height': 20
          }
        }, {
          selector: '.exit',
          style: {

            'curve-style': 'bezier',
            'line-color': 'grey',
            'color': 'grey',
            'label': 'data(label)',

            'target-arrow-color': '#000',
            'target-arrow-shape': 'triangle',

            'font-size': '14',
            'width': '2',
          }
        }, {
          selector: 'edge.open',
          style: {
            'target-arrow-color': 'hsla(190, 100%, 60%)',
            'line-color': 'hsla(190, 100%, 60%)',
            'width': '7',

          }
        }],

      });

      this.cytoscape.layout({
        name: 'cola',
        infinite: false
      });
      this.cytoscape.on('tap', function(evt) {
        console.log("tap");

        if (evt.cyTarget.id) {

        }
      });

    } catch (err) {
      console.warn("Missing edge", err);
    }
  },


  refreshAll: function() {
    // Deselect all states
  },

  refreshEdges: function() {
  },

}
