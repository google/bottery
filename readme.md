# Bottery
## A conversational agent prototyping platform by katecompton@

## What is this?

Bottery is a syntax, editor, and simulator for prototyping **generative contextual conversations** modeled as **finite state machines**

Bottery takes inspiration from the Tracery opensource project for generative text (also by katecompton@ in a non-google capacity) and the CheapBotsDoneQuick bot-hosting platform, as well as open FSM-based storytelling tools like Twine.  

Like Tracery, Bottery is a *syntax* that specifies the script of a conversation (a *map*) with JSON.  Like CheapBotsDoneQuick, the BotteryStudio can take that JSON and run a simulation of that conversation in a nice Javascript front-end, with helpful visualizations and editting ability.

The goal of Bottery is to help *everyone*, from designers to writers to coders, be able to write simple and engaging  contextual conversational agents, and to test them out in a realistic interactive simulation, mimicking how they'd work on a "real" platform like API.AI.  


## Maps

Users in Tracery write **grammars**, JSON objects that recursively define how to generate some text, like [the musings of a lost self-driving car](http://cheapbotsdonequick.com/source/losttesla) or [outer-space adventures](http://cheapbotsdonequick.com/source/tinyadv).  Tracery grammars are lists of symbol names (like "animal") and their expansion rules (like "emu, okapi, pangolin").

In Bottery, users write **maps**.  Each map is composed of four sub-components
* a set of states, with information about what to do on entering them, and how to get from one to another
* a set of initial blackboard values
* an optional Tracery grammar
* optional settings, like what voice should be used for TTS

### Blackboard (and the pointer)

You can imagine a Bottery map like a [boardgame board](https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwibnLuC-JDSAhVRyWMKHZQNB3cQjRwIBw&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F361273201334614541%2F&psig=AFQjCNGOTBu2PiFkWuV4zs2eeF-mL0PP-Q&ust=1487208084344985): there are spaces, and connections between the spaces, and rules for how to move between them.  The map itself doesn't change or store information during play.  Instead, you have a pointer showing whch space you're on, and maybe some information stored in that pointer (like the number of kids in your Game of Life car).  There's a pointer in Bottery that stores your position in the map, and it also has a Blackboard object, an object that can store and retrieve information.  An RPG map might use the blackboard to store the number of hitpoints for the main character, their current weapon and its stats, their gold, and quest progress.  A quiz bot might store all of its categories, questions and answers, the players' current points, and which questions it wants to ask next.  You can store strings, booleans, numbers, hierarchical objects, and arrays in the blackboard.  Storing and retrieving information is done with a JS-like syntax: "foo.bar[5]" gets the value at the 5th index of object "bar" in object "foo".  "foo.baz[10][20] = 10" behaves similarly, though unlike JS, if these parameters don't exist, it will create new objects or arrays and fill them rather than throwing an error.



### States
DOC TODO

