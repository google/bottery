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

function shuffle(arr) {

  for (var i = arr.length; i; i--) {
    var swapIndex = Math.floor(Math.random() * i);
    var temp = arr[i - 1];
    arr[i - 1] = arr[swapIndex];
    arr[swapIndex] = temp;
  }
}

function isInQuotes(s) {
  return (s.charAt(0) === "'" && s.charAt(s.length - 1) === "'") || (s.charAt(0) === '"' && s.charAt(s.length - 1) === '"')
}

function isInSquareBrackets(s) {
  return (s.charAt(0) === "[" && s.charAt(s.length - 1) === "]")
}

function isInParentheses(s) {
  return (s.charAt(0) === "(" && s.charAt(s.length - 1) === ")")
}

function isInPipes(s) {
  return (s.charAt(0) === "|" && s.charAt(s.length - 1) === "|")
}

function isString(s) {
  return (typeof s === 'string' || s instanceof String);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

var panelCount = 0;
var Panel = Class.extend({
  init: function(id, startPos) {

    var panel = this;
    this.id = id;
    this.idNumber = panelCount++;
    var div = $("<div/>", {
      class: "panel",
      id: "panel-" + this.id
    }).appendTo($("#panel-holder"));

    var header = $("<div/>", {
      html: id,
      class: "panel-header"
    }).appendTo(div);

    var content = $("<div/>", {
      class: "panel-content"
    }).appendTo(div);

    // Set the positions
    var savedPos = localStorage.getItem("panel-" + this.id);
    if (savedPos) {
      savedPos = JSON.parse(savedPos);
      this.setPosition(Math.max(0, savedPos.x), Math.max(0, savedPos.y), savedPos.w, savedPos.h);
    } else {
      var pos = {
        x: this.idNumber * 90,
        y: this.idNumber * 20,
        w: 200,
        h: 300
      }
      if (startPos) {
        $.extend(pos, startPos);

      }
      this.setPosition(pos.x, pos.y, pos.w, pos.h);
    }


    // Draggability
    div.draggable({
      start: function() {
        if (app.selectPanel)
          app.selectPanel(id);        
      },
      stop: function(ev, ui) {
        panel.savePosition(ui.position.left, ui.position.top, div.width(), div.height());
      },
      handle: ".panel-header"
    }).css({
      position: "absolute",
      zIndex: this.idNumber * 10 + 100,
    }).click(function() {
      $(".panel").css({
          zIndex: 90
        });
        $(this).css({
          zIndex: 100
        });
    });

    div.resizable({
      start: function() {
        if (app.selectPanel)
          app.selectPanel(id);
      },
      stop: function(ev, ui) {
        console.log(ui);
        panel.savePosition(ui.position.left, ui.position.top, ui.size.width, ui.size.height);
      }
    });
  },

  savePosition: function(x, y, w, h) {
    var toSave = JSON.stringify({
      x: x,
      y: y,
      w: w,
      h: h
    });
    localStorage.setItem("panel-" + this.id, toSave);
  },

  setPosition: function(x, y, w, h) {
    $("#panel-" + this.id).css({
      left: x,
      top: y,
      width: w,
      height: h
    });
  }
});
