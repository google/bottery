/*!
Copyright (c) The Cytoscape Consortium

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the “Software”), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

;(function(){ 'use strict';

  // registers the extension on a cytoscape lib ref
  var register = function( cytoscape, Springy ){
    if( !cytoscape || !Springy ){ return; } // can't register if cytoscape unspecified

    var defaults = {
      animate: true, // whether to show the layout as it's running
      maxSimulationTime: 4000, // max length in ms to run the layout
      ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
      fit: true, // whether to fit the viewport to the graph
      padding: 30, // padding on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      randomize: false, // whether to use random initial positions
      infinite: false, // overrides all other options for a forces-all-the-time mode
      ready: undefined, // callback on layoutready
      stop: undefined, // callback on layoutstop

      // springy forces and config
      stiffness: 400,
      repulsion: 400,
      damping: 0.5,
      edgeLength: function( edge ){
        var length = edge.data('length');

        if( length !== undefined && !isNaN(length) ){
          return length;
        }
      }
    };

    function SpringyLayout( options ){
      var opts = this.options = {};
      for( var i in defaults ){ opts[i] = defaults[i]; }
      for( var i in options ){ opts[i] = options[i]; }
    }

    SpringyLayout.prototype.run = function(){
      var layout = this;
      var self = this;
      var options = this.options;

      options.random = options.randomize; // backwards compatibility

      var simUpdatingPos = false;

      var cy = options.cy;
      layout.trigger({ type: 'layoutstart', layout: layout });

      var eles = options.eles;
      var nodes = eles.nodes().not(':parent');
      var edges = eles.edges();

      var bb = options.boundingBox || { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
      if( bb.x2 === undefined ){ bb.x2 = bb.x1 + bb.w; }
      if( bb.w === undefined ){ bb.w = bb.x2 - bb.x1; }
      if( bb.y2 === undefined ){ bb.y2 = bb.y1 + bb.h; }
      if( bb.h === undefined ){ bb.h = bb.y2 - bb.y1; }

      // make a new graph
      var graph = new Springy.Graph();

      // make some nodes
      nodes.each(function(i, node){
        node.scratch('springy', {
          model: graph.newNode({
            element: node
          })
        });
      });

      // connect them with edges
      edges.each(function(i, edge){
        var fdSrc = edge.source().scratch('springy').model;
        var fdTgt = edge.target().scratch('springy').model;

        edge.scratch('springy', {
          model: graph.newEdge(fdSrc, fdTgt, {
            element: edge,
            length: options.edgeLength.call(edge, edge)
          })
        });
      });

      var sim = window.sim = new Springy.Layout.ForceDirected(graph, options.stiffness, options.repulsion, options.damping);

      if( options.infinite ){
        sim.minEnergyThreshold = -Infinity;
      }

      var currentBB = sim.getBoundingBox();
      // var targetBB = {bottomleft: new Springy.Vector(-2, -2), topright: new Springy.Vector(2, 2)};

      // convert to/from screen coordinates
      var toScreen = function(p) {
        currentBB = sim.getBoundingBox();

        var size = currentBB.topright.subtract(currentBB.bottomleft);
        var sx = p.subtract(currentBB.bottomleft).divide(size.x).x * bb.w + bb.x1;
        var sy = p.subtract(currentBB.bottomleft).divide(size.y).y * bb.h + bb.x1;

        return new Springy.Vector(sx, sy);
      };

      var fromScreen = function(s) {
        currentBB = sim.getBoundingBox();

        var size = currentBB.topright.subtract(currentBB.bottomleft);
        var px = ((s.x - bb.x1) / bb.w) * size.x + currentBB.bottomleft.x;
        var py = ((s.y - bb.y1) / bb.h) * size.y + currentBB.bottomleft.y;

        return new Springy.Vector(px, py);
      };

      var movedNodes = cy.collection();

      var numNodes = cy.nodes().size();
      var drawnNodes = 1;
      var fdRenderer = new Springy.Renderer(sim,
        function clear() {
          if( self.stopped ){ return; } // because springy is a buggy layout

          if( movedNodes.length > 0 && options.animate ){
            simUpdatingPos = true;

            movedNodes.positions(function(i, node){
              return node.scratch('springy').position;
            });

            if( options.fit ){
              cy.fit( options.padding );
            }

            movedNodes = cy.collection();

            simUpdatingPos = false;
          }
        },

        function drawEdge(edge, p1, p2) {
          // draw an edge
        },

        function drawNode(node, p) {
          if( self.stopped ){ return; } // because springy is a buggy layout

          var v = toScreen(p);
          var element = node.data.element;

          if( !element.locked() && !element.grabbed() ){
            element.scratch('springy').position = {
              x: v.x,
              y: v.y
            };

            movedNodes.merge(element);
          } else {
            //setLayoutPositionForElement(element);
          }

          if( drawnNodes == numNodes ){
            layout.one('layoutready', options.ready);
            layout.trigger({ type: 'layoutready', layout: layout });
          }

          drawnNodes++;

        }
      );

      // set initial node points
      nodes.each(function(i, ele){
        if( !options.random ){
          setLayoutPositionForElement(ele);
        }
      });

      // update node positions when dragging
      var dragHandler;
      nodes.on('position', dragHandler = function(){
        if( simUpdatingPos ){ return; }

        setLayoutPositionForElement(this);
      });

      function setLayoutPositionForElement(element){
        var fdId = element.scratch('springy').model.id;
        var fdP = fdRenderer.layout.nodePoints[fdId].p;
        var pos = element.position();
        var positionInFd = (pos.x != null && pos.y != null) ? fromScreen(element.position()) : {
          x: Math.random() * 4 - 2,
          y: Math.random() * 4 - 2
        };

        fdP.x = positionInFd.x;
        fdP.y = positionInFd.y;
      }

      var grabbableNodes = nodes.filter(":grabbable");

      function start(){
        self.stopped = false;

        // disable grabbing if so set
        if( options.ungrabifyWhileSimulating ){
          grabbableNodes.ungrabify();
        }

        fdRenderer.start();
      }

      self.stopSystem = function(){
        self.stopped = true;

        graph.filterNodes(function(){
          return false; // remove all nodes
        });

        if( options.ungrabifyWhileSimulating ){
          grabbableNodes.grabify();
        }

        if( options.fit ){
          cy.fit( options.padding );
        }

        nodes.off('drag position', dragHandler);

        layout.one('layoutstop', options.stop);
        layout.trigger({ type: 'layoutstop', layout: layout });

        self.stopSystem = null;
      };

      start();
      if( !options.infinite ){
        setTimeout(function(){
          self.stop();
        }, options.maxSimulationTime);
      }

      return this; // chaining
    };

    SpringyLayout.prototype.stop = function(){
      if( this.stopSystem != null ){
        this.stopSystem();
      }

      return this; // chaining
    };

    cytoscape('layout', 'springy', SpringyLayout);

  };

  if( typeof module !== 'undefined' && module.exports ){ // expose as a commonjs module
    module.exports = register;
  }

  if( typeof define !== 'undefined' && define.amd ){ // expose as an amd/requirejs module
    define('cytoscape-springy', function(){
      return register;
    });
  }

  if( typeof cytoscape !== 'undefined' && typeof Springy !== 'undefined' ){ // expose to global cytoscape (i.e. window.cytoscape)
    register( cytoscape, Springy );
  }

})();
