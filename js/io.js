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


  loadMap: function(id, editVersion) {
    var found = localStorage.getItem(id);
    if (!found)
      return undefined;

    found = JSON.parse(found);
  },


  saveData: function(map, key, val) {
    localStorage.setItem("data-" + map.settings.id + "-" + key, val);
  },
  

  textToSpeech: function(text, onFinish, onFinishEach) {

    console.log("Speaking: " + text);
    if (!Array.isArray(text)) {
      text = [text];
    }
    var index = 0;

    function iterate() {
      var singleText = text[index];

      var msg = new SpeechSynthesisUtterance(singleText);
      window.speechSynthesis.speak(msg);

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

      msg.onend = finish;

      // Allow finishing events with either event end, or timeout (for broken audio)
      setTimeout(finish, singleText.length * 100 + 100);

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

  // Gets queued text and outputs it.
  // This is called recursively
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
// ** both text+speech & speech should trigger this??
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
    if (io.logHolder[0]) {
      io.logHolder.scrollTop(io.logHolder[0].scrollHeight);
    }
  }
}
