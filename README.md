# Bottery

## A conversational agent prototyping platform by [Kate Compton](https://github.com/galaxykate).

(This is not an official Google product.)

## What is this?

Bottery is a syntax, editor, and simulator for prototyping **generative contextual conversations** modeled as **finite state machines**.

Bottery takes inspiration from the **[Tracery](http://tracery.io/)** open-source project for generative text (also by katecompton@ in a non-google capacity) and the [Cheap Bots, Done Quick!](https://cheapbotsdonequick.com/) bot-hosting platform, as well as open FSM-based storytelling tools like Twine.  

Like Tracery, Bottery is a *syntax* that specifies the script of a conversation (a *map*) with JSON.  Like Cheap Bots, Done Quick!, the BotteryStudio can take that JSON and run a simulation of that conversation in a nice JavaScript front-end, with helpful visualizations and editing ability.

The goal of Bottery is to help *everyone*, from designers to writers to coders, be able to write simple and engaging  contextual conversational agents, and to test them out in a realistic interactive simulation, mimicking how they'd work on a "real" platform like DialogFlow.  


## Bottery concepts

Users in Tracery write **grammars**, JSON objects that recursively define how to generate some text, like [the musings of a lost self-driving car](https://cheapbotsdonequick.com/source/losttesla) or [outer-space adventures](https://cheapbotsdonequick.com/source/tinyadv).  Tracery grammars are lists of symbol names (like "animal") and their expansion rules (like "emu, okapi, pangolin").

In Bottery, users write **maps**. Each map is composed of four sub-components
* A set of **states**, with information about what to do on entering them, and how to get from one to another
* A set of initial **blackboard** values
* An optional Tracery **grammar**

### Blackboard (and the pointer)

You can imagine a Bottery map like a finite state machine or a [boardgame board](https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=0ahUKEwibnLuC-JDSAhVRyWMKHZQNB3cQjRwIBw&url=https%3A%2F%2Fwww.pinterest.com%2Fpin%2F361273201334614541%2F&psig=AFQjCNGOTBu2PiFkWuV4zs2eeF-mL0PP-Q&ust=1487208084344985): there are spaces, and connections between the spaces, and rules for how to move between them.  The map itself doesn't change or store information during play.  Instead, you have a **pointer** showing which state you are on, all the variables in the blackboard (like the number of kids in your Game of Life car).

An RPG map might use the blackboard to store the number of hit points for the main character, their current weapon and its stats, their gold, and quest progress.  A quiz bot might store all of its categories, questions and answers, the players' current points, and which questions it wants to ask next.  You can store strings, booleans, numbers, hierarchical objects, and arrays in the blackboard.  Storing and retrieving information is done with a JavaScript-like syntax: `foo.bar[5]` gets the value at the 5th index of object `bar` in object `foo`.  `foo.baz[10][20] = 10` behaves similarly, though unlike JavaScript, if these parameters don't exist, it will create new objects or arrays and fill them rather than throwing an error. See `parseMapPath` in `map.js` for details.

Variables in the blackboard can be accessed from within Tracery with the syntax `You have guessed #/guessCount# times.`

### States

Each state is a node in the Bottery map. A state has
* An **id**
* A list of **actions** to be taken when the state is entered
* A dictionary of **exits** to other states.
* Optionally, a list of **suggestion chips** (using tracery syntax) of suggested user inputs. This is commonly used in text based bots.

There are several ways to express the actions that are taken when the state is entered, depending on the desired behavior. The following are currently defined:
* `onEnter`: This takes a string of actions defined in the action syntax (see below). For example: `“‘hello’ greeting++”`. these are space delineated commands, and the extra quotation marks around the phrase are necessary
* `onEnterDoOne` Takes an array of strings in format `"[condition] [action]"`. The first condition that evaluates to true has its action executed.
* `onEnterSay` Takes a singe string and outputs it. The string can use tracery expansion syntax.
* `onEnterPlay` Plays the audio file specified.
* `onEnterFxn` Executes the given function (but must be defined in `map.js`)

All bots must have an `origin` state, which is the first state entered when the bot starts.

### Exits

Exits are described by strings in the format:
`[conditions] ->TARGET_NAME [actions to take when taken]`

Syntax for actions and conditions are described below.

If all the conditions are true then the exit becomes active. If there are *no* conditions, the exit is always active.

Then there is an arrow (`->`) and a target.  The target is either an **id of a state** or an at sign `@` that indicates the pointer should re-enter the current state.

The list of actions is in **action syntax** (see below).

### Condition

Conditions fall under the following categories:
* Inputs: User input matching a string. E.g., `"one"` or `"two"`. The presence of quotes indicates a string that must be matched by the last user input. An asterisk `*` matches *any* user input.
* Expressions: Mathematical syntax representing equality, inequality, and so on. Most basic math expressions are valid e.g. `count>4`. Expressions can use variables that exist in the blackboard, using the blackboard variable syntax (see above). 
* Values: There is only one type of these at present, `wait:[time in seconds to wait]`. This evaluates to true after that much time has elapsed after entering the current state.

### Actions

Action syntax is similar to condition syntax:
* Assignment: Sets a variable in the blackboard. If the variable does not exist it is created. E.g. `partyMember[1].weapon="sword"`.
* Output: Raw text with quotes is outputted using selected output method. ‘"hello"’. This uses tracery expansion syntax, so `"hello #/playerName#"`
* Play sound: `playSound([sound name])`
* Incrementation: Increments or decrements a variable in the blackboard. E.g.:`[varName]++` or `[varName]--`

### How the pointer decides how to move

When the pointer enters a state, the following things happen:
1. Any `onEnter` actions are executed.
2. Any **suggestion chips** are created and displayed to the user.
3. All available exits (including the exits specified in the state, as well as global exits) are collected.

The pointer then waits for state change. At the moment, state change includes user input, and the passage of time. If no `wait` conditions are present, then the bot will wait for user input forever. When that state change occurs, the pointer will re-evaluate all the conditions on the currently available exits. If all the conditions on an exit evaluate to true, then that exit becomes active.

It is often the case that multiple exits are active at the same time. For example:
`"yes" ->startGame`
`* ->askForClarification`

If the user types "yes", both exits are active. The first exit in in the list of active exits is selected. In this case `"yes" ->startGame` will be chosen.

When the pointer uses an exit, the following occurs:
1. The actions associated with the exit are executed.
2. The pointer moves to the state of that exit and the process begins anew.

## Interface Overview

![UI overview](doc_images/bottery_ui.png?raw=true)

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

### State view

This is a representation of the current state of the bot, and the potential next states, as well as the conditions for enabling these particular transitions.

### Viz

Displays the directed connectivity graph of states and exits. Highlights the current state and any active exit transitions.

## Example bot (kitten simulator!)

Now that we have reviewed the underlying concepts and the interface, it is time to build a bot!

When you have checked out the git repository, create a new file `kittens.js` in the `bots` directory, and add `kittens` to the list of bots in `bots.js`.

We can start with the following in `kittens.js`:

```javascript
bot = {
  states: {
    origin: {
      onEnter: "'You have a kitten!'",
    },
  },
}
```

This is a minimal valid bot. It has one state, the `origin`, and that has a single `onEnter` associated with it. Note the fact that the text `'You have a kitten!'` is in single quotes. This is an output action and denotes that this string is to be output as text. We will add additional actions later.

A note on syntax: The format of this is valid javascript, and is very similar to JSON, but is not valid JSON because of two key differences: trailing commas are permitted, and object keys do not require quotes.

### Interactive kitten

A bot isn't very interesting until you can interact with it, so let's add some interactivity:

```javascript
bot = {
  states: {
    origin: {
      onEnter: "'You have a kitten!'",
      exits: "->name",
    },
    name: {
      onEnter: "'What do you want to name your kitten?'",
      exits: "'*' ->respondToName name=INPUT",
    },
    respondToName: {
      onEnterSay: "The kitten purrs happily, I guess it likes the name #/name#!",
    },
  },
}
```

This example introduces two new states: `name` and `respondToName`. These states are connected via `exits`. The exit on `origin` has no conditions, and therefore is entered immediately by the Pointer. The exit in the state `name` requires some form of user input indicated by the asterisk. This exit has an action associated with it in the form `name=INPUT`. `INPUT` is a special variable indicating the user's input. `name=INPUT` has the effect that the variable `name` is assigned to what the user entered, and is saved in the blackboard. In state `respondToName` there is an `onEnterSay` behavior, which is similar to `onEnter`, but does not require extra single quotes around the text outputted. The blackboard variable `name` is accessed via Tracery syntax using `#/name#`.

Interacting with this bot, you can see that the **viz** view displays the state graph, and the blackboard view displays the user-entered name.

![](doc_images/kittens1.png?raw=true)

### Suggestion chips

User interactions can be expedited though the use of suggestion chips. These are prompts that are shown to the user when interacting through text. 

```javascript
bot = {
  states: {
    origin: {
      onEnter: "'You have a kitten!'",
      exits: "->name",
    },
    name: {
      onEnter: "'What do you want to name your kitten?'",
      chips: ["Cupcake", "Dark Lord Satan"],
      exits: "'*' ->respond_to_name name=INPUT",
    },
    respond_to_name: {
      onEnterSay: "The kitten purrs happily, I guess it likes the name #/name#!",
    },
  },
}
```

### Adding Tracery grammar

A little more flavor can be added using a Tracery grammar:

```javascript
bot = {
  grammar: {
    noun: ["cat", "monkey","butter", "pants", "demon", "fluff", "taco", "mountain", "butt"],
    adj: ["fluffy", "fat", "puff", "tepid", "love", "unruly"],
    name: ["#noun.capitalize##noun#", "#adj.capitalize##noun#", "#noun.capitalize# the #adj.capitalize#"],
  },
  states: {
    origin: {
      onEnter: "'You have a kitten!'",
      exits: "->name",
    },
    name: {
      onEnter: "'What do you want to name your kitten?'",
      chips: ["#name#", "#name#", "Cupcake", "Dark Lord Satan"],
      exits: "'*' ->respond_to_name name=INPUT",
    },
    respond_to_name: {
      onEnterSay: "The kitten purrs happily, I guess it likes the name #/name#!",
    },
  },
}
```

![](doc_images/kittens2.png?raw=true)

### Petting the kitten

What are some of the things that a user might want to do with a kitten bot? A natural thing to do would be to pet the kitten. Real life kittens are temperamental creatures, and can behave unpredictably. We can use the blackboard to store a variable indicating the number of times the kitten wants to be petted, and anything beyond that will cause the kitten to bite the user.

```javascript
bot = {
  grammar: {
    noun: ["cat", "monkey","butter", "pants", "demon", "fluff", "taco", "mountain", "butt"],
    adj: ["fluffy", "fat", "puff", "tepid", "love", "unruly"],
    name: ["#noun.capitalize##noun#", "#adj.capitalize##noun#", "#noun.capitalize# the #adj.capitalize#"],
  },
  states: {
    origin: {
      onEnter: "'You have a kitten!' desired_pets=randomInt(1,5)",
      exits: "->name",
    },
    name: {
      onEnter: "'What do you want to name your kitten?'",
      chips: ["#name#", "#name#", "Cupcake", "Dark Lord Satan"],
      exits: "'*' ->respond_to_name name=INPUT",
    },
    respond_to_name: {
      onEnterSay: "The kitten purrs happily, I guess it likes the name #/name#!",
    },
    pet: {
      onEnter: "'You pet the kitten' desired_pets--",
      exits: ["desired_pets>=0 ->happy_pet", "->angry_pet"]
    },
    happy_pet: {
      onEnterSay: "#/name# loves you and is in ecstacy",
    },
    angry_pet: {
      onEnterSay: "why did you pet #/name# when it didn't want to be petted!?",
      onEnter: "desired_pets=randomInt(1,5)",
    }
  },
  exits: "'pet' ->pet",
  initialBlackboard: {
    name: "the kitten",
  },
}
```

This example adds a global exit. No matter where the Pointer is at on the graph, the user can always pet the kitten. This introduces a problem, though, because the user could potentially pet the kitten before it was named, so an initial value for the name is configured in the blackboard. When the origin is entered, the variable `desired_pets` is set to a random value between 1 and 5. When the user pets the kitten too much, the `angry_pet` node is entered. 

![](doc_images/kittens3.png?raw=true)

### State flow

Finally, we should add some idle behavior for the kitten when it is not being petted.

```javascript
bot = {
  grammar: {
    noun: ["cat", "monkey","butter", "pants", "demon", "fluff", "taco", "mountain", "butt"],
    adj: ["fluffy", "fat", "puff", "tepid", "love", "unruly"],
    name: ["#noun.capitalize##noun#", "#adj.capitalize##noun#", "#noun.capitalize# the #adj.capitalize#"],
    catSpeak: ["mmrrr", "meow", "mmrrrrow", "meep", "#catSpeak# #catSpeak#"],
  },
  states: {
    origin: {
      onEnter: "'You have a kitten!' desired_pets=randomInt(1,5)",
      exits: "->name",
    },
    name: {
      onEnter: "'What do you want to name your kitten?'",
      chips: ["#name#", "#name#", "Cupcake", "Dark Lord Satan"],
      exits: "'*' ->respond_to_name name=INPUT",
    },
    respond_to_name: {
      onEnterSay: "The kitten purrs happily, I guess it likes the name #/name#!",
      exits: "->idle"
    },
    pet: {
      onEnter: "'You pet the kitten' desired_pets--",
      exits: ["desired_pets>=0 ->happy_pet", "->angry_pet"]
    },
    happy_pet: {
      onEnterSay: "#/name# loves you and is in ecstacy",
      exits: "wait:10 ->idle"
    },
    angry_pet: {
      onEnterSay: "why did you pet #/name# when it didn't want to be petted!?",
      onEnter: "desired_pets=randomInt(1,5)",
      exits: "->angry"
    },
    idle: {
      onEnterSay: "#/name# rolls around and makes cute noises",
      exits: "wait:10 ->hungry",
    },
    angry: {
      onEnter: "'The kitten is angry! *bite*'",
      exits: "wait:10 ->sleeping",
    },
    sleeping: {
      onEnter: "'The kitten is sleeping! zzzzzzzzz'",
      exits: "wait:10 ->hungry",
    },
    hungry: {
      onEnter: "'The kitten is hungry! meow meow #catSpeak#'",
      exits: "wait:10 ->angry",
    },
  },
  exits: "'pet' ->pet",
  initialBlackboard: {
    name: "the kitten",
  },
}
```

This final example adds state transitions that form a cycle of activity. If no interaction occurs, the kitten will naturally cycle between the states of `hungry`, `sleeping`, and `angry`. The `wait:10` condition on the exit will delay for a particular amount of time before automatically advancing into that state. 

![](doc_images/kittens4.png?raw=true)

### Additional resources.

This concludes the tutorial. For more examples of types of bots, check out:
* `amIPsychic.js` This is a simple guessing game where the user guesses whether a random coin will flip heads or tails. The bot tracks the longest winning and losing streak.
* `quiz.js` A basic quiz game where the user answers questions and these are used to determine a Hip Hop DJ name.
* `tesla.js` A bot based on the tracery [twitter bot](https://twitter.com/losttesla) of the same name.

