bot = {
  states: {
    origin: {
      onEnterSay: "#intro#",
      exits: ["->firstTimePlayer"],
    },

    firstTimePlayer: {
      onEnterSay: "#firstTimeInstructions#\n#firstTimePrompt#",
      exits: "->predict"
    },

    predict: {
      chips: ["heads", "tails"],
      exits: [
        "'heads' ->doFlip prediction='heads'", 
        "'tails' ->doFlip prediction='tails'", 
        "'*' ->askForClarification", 
        "wait:30 ->whineAtPlayer"
      ],
    },

    whineAtPlayer: {
      onEnterSay: "#whine#",
      exits: ["->predict"],
    },

    askForClarification: {
      onEnterSay: "#askForClarification#",
      exits: ["->predict"]
    },

    doFlip: {
      onEnter: "'#flipping#' value=random()",
      exits: ["value<.5 ->result_heads", "(value>=0.5)&&(value<(0.5+edgeChance)) ->result_edge", "->result_tails"],
    },

    result_heads: {
      // onEnterPlay: "'coinflip_heads.wav'",
      onEnter: "result='heads' '#itsHeads#'",
      exits: ["->tally"],
    },

    result_tails: {
      // onEnterPlay: "'coinflip_tails.wav'",
      onEnter: "result='tails' '#itsTails#'",
      exits: ["->tally"],
    },

    result_edge: {
      // onEnterPlay: "'coinflip_edge.wav'",
      onEnter: "result='edge' '#itsEdge#'",
      exits: ["->tally"],
    },

    tally: {
      exits: ["prediction==result ->right ", "->wrong"],
    },

    right: {
      onEnter: "'#youWereRight#' winStreak++ lastLoseStreak=loseStreak loseStreak=0 rightGuesses++ pattern+='C' accuracy=rightGuesses/(wrongGuesses + rightGuesses) if(winStreak>maxWinStreak, '#newWinBestScore#')",

      onEnterDoOne: ["lastLoseStreak>2 '#lostLosingStreak#'",
        "winStreak>streak2 '#winningStreak2#'",
        "winStreak>streak1 '#winningStreak1#'",
        "winStreak>streak0 '#winningStreak0#'",
        "'#genericWin#'"
      ],

      exits: ["->predict"]
    },

    wrong: {
      onEnter: "'#youWereWrong#' loseStreak++ lastWinStreak=winStreak  winStreak=0 wrongGuesses++ pattern+='X' accuracy=rightGuesses/(wrongGuesses + rightGuesses) if(winStreak>maxWinStreak, '#newWinBestScore#')",

      onEnterDoOne: ["lastWinStreak>2 '#lostWinningStreak#'",
        "loseStreak>streak2 '#losingStreak2#'",
        "loseStreak>streak1 '#losingStreak1#'",
        "loseStreak>streak0 '#losingStreak0#'",
        "'#genericLose#'"
      ],

      exits: ["->predict"]
    },
  },

  initialBlackboard: {
    wrongGuesses: 0,
    rightGuesses: 0,
    maxLoseStreak: 0,
    maxWinStreak: 0,
    pattern: "",
    winStreak: 0,
    loseStreak: 0,
    edgeChance: .001,
    streak0: 2,
    streak1: 4,
    streak2: 6,
    lastLoseStreak: 0,
    lastWinStreak: 0
  },

  grammar: {

    // BAD WRITING FROM KATE
    newWinBestScore: "You've got a new record of #/maxWinStreak# wins in a row",
    newLoseBestScore: "You've got a new record of #/maxWinStreak# losses in a row",
    winningStreak2: "That's amazing, you're so good!",
    winningStreak1: "You've really got a winning streak going!",
    winningStreak0: "Very promising",
    genericWin: "Nice, go again?",
    losingStreak2: "That's amazing, you're terrible at this!",
    losingStreak1: "Wow, you might be reverse psychic.",
    losingStreak0: "Not looking good for your psychic ability",
    genericLose: "Aww, Go again?",
    lostLosingStreak: "What a comeback from #/lastLoseStreak# losses!",
    lostWinningStreak: "Oh no, you lost your #/lastWinStreak# wins!",

    youWereRight: "You were right!",
    youWereWrong: "You were wrong 🙁",

    debugData: "(debug info: loseStreak:#/loseStreak# winStreak:#/winStreak# chain:#/pattern# accuracy:#/accuracy#)",

    itsHeads: ["Heads!"],
    itsTails: ["Tails!"],
    itsEdge: ["It’s in the air! It’s arcing magnificently, it’s falling, it’s coming down, it’s head—no, tail—no, it isn’t either. The coin landed on its edge. The odds are astronomically against this, [memory_name]. Congratulations, you’ve earned the Against All Odds achievement."],

    flipping: "I'm flipping the coin...",

    intro: "To most people, the future is dark and murky, but maybe you’re different. Maybe the future to you is an unread book, just waiting to be pulled off the shelf. Will you flip through its pages? Will you read into the future? Will you discover your psychic potential?",
    returningInstructions: ["I’ll flip a coin, and you try to predict the results.", "You know the drill: I'll flip a coin. You predict what it'll be.", "Welcome back! All our testing equipment is still set up. Just make a prediction, and I'll flip a coin."],
    firstTimeInstructions: ["I’m going to flip a coin. You tell me what you think it’ll land on. We’ll keep a running tally and see how many you get right."],
    returningPrompt: ["Here we go again: heads or tails?",
      "Call it: heads or tails?",
      "What do you think, heads or tails?",
      "Let’s do it again: heads or tails?",
      "Take another shot: heads or tails?",
      "Let’s keep going and see where we end up! Heads or tails?",
      "How are you feeling today, heady or tail-ish?",
      "Let’s try again! Heads or tails?",
      "Look into the future and call it, heads or tails?",
      "What’s the next flip, heads or tails?",
      "Let’s keep going! Heads or tails?"
    ],
    firstTimePrompt: ["Here we go—heads or tails?",
      "Get ready—heads or tails?",
      "Clear your mind and focus: heads or tails?"
    ],

    whine: "Use your psychic powers and FOCUS!",

    c: ["It’s #/result#! {Correct SFX} It’s too early to say for sure, but your psychic abilities are showing quite a bit of potential. Let’s try again.", "You got it right!", "Go team! That means you."],
    x: ["Oh, it was #/result#. {Incorrect SFX} Even world-class psychics take some time to get warmed up. Let’s keep going. Take a deep breath, let your mental energy flow, and try again."],

    askForClarification: ["Sorry, you need to choose either 'heads' or 'tails'.",
      "'heads' or 'tails' please.",
      "The inputs I understand are 'heads' or 'tails'.",
    ],
  }
};