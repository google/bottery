# Bottery
## A conversational agent prototyping platform by katecompton@

(This is not an official Google product)

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

You can imagine a Bottery map like a [boardgame board](https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwibnLuC-JDSAhVRyWMKHZQNB3cQjRwIBw&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F361273201334614541%2F&psig=AFQjCNGOTBu2PiFkWuV4zs2eeF-mL0PP-Q&ust=1487208084344985): there are spaces, and connections between the spaces, and rules for how to move between them.  The map itself doesn't change or store information during play.  Instead, you have a pointer showing whch space you're on, and maybe some information stored in that pointer (like the number of kids in your Game of Life car).  There's a pointer in Bottery that stores your position in the map (the current **state**), and it also has a Blackboard object, an object that can store and retrieve information.  An RPG map might use the blackboard to store the number of hitpoints for the main character, their current weapon and its stats, their gold, and quest progress.  A quiz bot might store all of its categories, questions and answers, the players' current points, and which questions it wants to ask next.  You can store strings, booleans, numbers, hierarchical objects, and arrays in the blackboard.  Storing and retrieving information is done with a JS-like syntax: "foo.bar[5]" gets the value at the 5th index of object "bar" in object "foo".  "foo.baz[10][20] = 10" behaves similarly, though unlike JS, if these parameters don't exist, it will create new objects or arrays and fill them rather than throwing an error. See `parseMapPath` in `map.js` for details.

### States

Each state is a node in the Bottery map. A state has
* An id
* A list of actions to be taken when the state is entered
* A dictionary of **exits** to other states.
* Optionally, a list of **suggestion chips** (using tracery syntax) of suggested user inputs. This is commonly used in text based bots.

There are several ways to express the actions that are taken when the state is entered, depending on the desired behavior. The following are currently defined:
* `onEnter`: This takes a string of actions defined in the action syntax (see below). For example: `“‘hello’ greeting++”`. these are space delineated commands, and the extra quotation marks around the phrase are necessary
* `onEnterDoOne` Takes an array of strings in format `"[condition] [action]"`. The first condition that evaluates to true has its action executed.
* `onEnterSay` Takes a singe string and outputs it. The string can use tracery expansion syntax.
* `onEnterPlay` Plays the audio file specified.
* `onEnterFxn` Executes the given function (but must be defined in `map.js`)

All bots must have an `origin` state, which is the first state entered when the map is run.

### Exits

Exits are desscribed by strings in the format:
`[conditions] ->TARGET_NAME [actions to take when taken]`

Syntax for actions and conditions are described below.

If all the conditions are true then the exit becomes active. If there are *no* conditions, the exit is always active.

Then there is an arrow (`->`) and a target.  The target is either an **id of a state** or an at sign `@` that indicates the Pointer should re-enter the current state.

The list of actions is in Action Syntax (see below).

### Condition

Contitions fall under the following categories:
* Inputs: User input matching a string. E.g., `"one"` or `"two"`. The presence of quotes indicates a string that must be matched by the last user input. An asterisk `*` matches *any* user input.
* Expressions: Mathematical syntax representing equality, inequality, and so on. Most basic math expressions are valid e.g. `count>4`. Expressions can use variables that exist in the blackboard, using the blackboard variable syntax (see above). 
* Values: There is only one type of these at present, `wait:[time in seconds to wait]`. This evaluates to true after that much time has elapsed after entering the current state.

### Actions

Action syntax is similar to condition syntax:
* Assignment: Sets a variable in the blackboard. If the variable does not exist it is created. E.g. `partyMember[1].weapon="sword"`.
* Output: Raw text with quotes is outputted using selected output method. ‘"hello"’. This uses tracery expansion syntax, so `"hello #/playerName#"`
* Play sound: `playSound([sound name])`
* Incrementation: Increments or decrements a variable in the blackboard. E.g.:`[varName]++` or `[varName]--`

### How the Pointer decides how to move

When the pointer enters a state, the following things happen:
1. Any `onEnter` actions are executed.
2. Any **suggestion chips** are created and displayed to the user.
3. All available exits (including the exits specified in the state, as well as global exits) are collected.

The Pointer then waits for state change. At the moment, state change includes user input, and the passage of time. If no `wait` conditions are present, then the bot will wait for user input forever. When that state change occurs, the Pointer will re-evaluate all the conditions on the currently available exits. If all the conditions on an exit evaluate to true, then that exit becomes active.

It is often the case that multiple exits are active at the same time. For example:
`"yes" ->startGame`
`* ->askForClarification`

If the user types "yes", both exits are active. The first exit in in the list of active exits is selected. In this case `"yes" ->startGame` will be chosen.

When the Pointer uses an exit, the following occurs:
1. The actions associated with the exit are executed.
2. The pointer moves to the state of that exit and the process begins anew.

## Interface Overview

Review of UI elements

### Chat

Tab for interacting with the bot. Occasionally, the player may be offered suggestion chips (e.g., "heads" and "tails") that can allow the player to interact without entering text.

### Controls

Switches between text and speech, and also commands for working with state.
If there are errors in the bot’s underlying script, then they will appear here.

### Editor

An inline editor for the underlying bot script. A user can edit the script and see changes without having to edit the underlying `.js` files. Changes here will be saved in local storage, so they will only be accessible to the current user.

### Blackboard

Displays the current state of the variables known by the bot. These variables can be used to affect conditional behavior (e.g., the mood of the bot), some tracked information (e.g., the number of correct guesses in a quiz), the name of something (e.g., something the player is allowed to name), and much more.

This information is typically invisible to an end user interacting with the bot.

### Inspector

Presents a view of the bot’s state machine. This shows all the states that the bot can traverse through, and within them indicates the commands that are executed by the bot, and the ways to traverse to the next state[s]. The initial state is always "origin". This view is not interactive, but is a visual representation of the underlying script.

### Stateview

This is a representation of the current state of the bot, and the potential next states, as well as the conditions for enabling these particular transitions.

### Viz

Displays the directed connectivity graph of states and exits. Highlights the current state and any active exit transitions.



