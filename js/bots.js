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

// Load bots for demo

function loadBot(name, map) {
  console.log("loading " + name);
  req = $.ajax("bots/" + name + ".js", {
    async: false,
    dataType: "script",
  });  
  req.done(function(data) {
    console.log("Bot '" + name + "' loaded successfully");
    map[name] = eval(data);
  });
  req.fail(function( jqXHR, textStatus ) {
    console.log("Bot '" + name + "' could not be loaded: " + textStatus );
  });
}

var testMaps = {};

var bots = [
  "amIPsychic",
  "besties",
  "emotionFlow",
  "kittens",
  "maraudersMap",
  "petSim",
  "quiz",
  "rhymes",
  "tesla",
];

for (var i = 0; i < bots.length; i++) {
  loadBot(bots[i], testMaps);
}

