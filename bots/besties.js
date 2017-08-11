bot = {
  states: {
    origin: {
      onEnterSay: "Let's play Besties.\nGot your bestie ready?",
      exits: {
        assent: "(yes) ->start",
        timeout: "wait:1 ->start",
      }
    },

    start: {
      onEnterSay: "This super-scientific quiz will test your knowledge of each other.",

      exits: {
        start: "->q_start questionIndex=0 playerIndex=0 roundCount=6",
      }
    },

    endgame: {
      onEnter: [
        "score>roundCount*.6  -> 'Superbuds!'     sticker(friend0) playSound(win)",
        "score>roundCount*.4  -> 'Adequate buds!'   sticker(friend0) playSound(friend)",
        "score>roundCount*.2  -> 'Barely buds!'     sticker(friend0) playSound(neutral)",
        "(50*5)*(11-3)>0    -> 'Mortal enemy buds!' sticker(friend0) playSound(enemy)"
      ],
      exits: {
        start: "->origin",
      }
    },

    // For each round, 
    q_question: {
      onEnterSay: "#question#",

      //onEnter: "question=allQuestions[questionIndex] player=players[playerIndex%2]",

      exits: {
        endgame: "roundIndex==roundCount ->endgame",
        q_start: "input:* ->q_evaluation"
      },

      onExitDo: "roundIndex+=1 playerIndex+=1 questionIndex+=1"
    },

    q_start: {
      onEnterSay: "#/player/name#, this is for you",
      exits: {
        start: "->q_question",
      }
    },

    q_evaluation: {
      onEnterSay: "#/player/name#, is that right?",
      exits: {
        start: "input:* ->q_start",
      }
    },



  },

  fxns: {

    shuffleQuestions: function() {
      var obj = this.map.stateSpace;
      obj.questions = obj.questionList.slice(0);
    }
  },
  grammar: {
    thing: ["bread", "car", "musical instrument", "animal", "food", "music"],
    question: ["#allQuestions#", "#allQuestions#", "#allQuestions#", "If your friend were a type of #thing#, what kind would they be?"],
    allQuestions: ["If you and #person# were a Disney princess and her sidekick, which ones would you be?", "You both walk into an art museum. Strangely, all the security guards are missing, and the art is unguarded. You impulsively grab a small painting, and start walking out. Does #person# stop you?", "If #person# were a piece of household furniture, what would they be?", "You win a charity auction. The prize? The right to legally change #person#'s name to whatever they want.  What do you name them?", "If #person# could change their middle name, what would they change it to, or would they keep it the same?", "You bake a cake for #person# to celebrate making it through 2016.  What does the cake say?", "Describe #person# as a novelty donut. Frosted? Filled? Sprinkled? What kind of donut are they?", "#person# has one chance to stop the alien invasion, and an object in this room.  What do they use, and how do they save earth?", "You inherits a vast and sprawling mansion. Its probably haunted. Will #person# stay with you on the first night, or are you on your own?", "#person# is sentenced to live forever in a single building, but they can choose which building. Where is their prison going to be?", "#person# goes to work at the zoo, but gets the worst possible job there. What are they doing?", "#person# wins the lottery and buys you a car. What kind of car do they buy you?", "If #person# were a type of bread, what type would they be?", "#person# is a lone meerkat standing watch on the Kalahari plateau.  A shadow falls across the sky, it's a tawny eagle. They can either dive for safety, or chirp to alert the colony of danger.  Will Meercat #person# save themselves, or their colony?"]
  },

  stateSpace: {
    allQuestions: ["If you and #person# were a Disney princess and her sidekick, which ones would you be?", "You both walk into an art museum. Strangely, all the security guards are missing, and the art is unguarded. You impulsively grab a small painting, and start walking out. Does #person# stop you?", "If #person# were a piece of household furniture, what would they be?", "You win a charity auction. The prize? The right to legally change #person#'s name to whatever they want.  What do you name them?", "If #person# could change their middle name, what would they change it to, or would they keep it the same?", "You bake a cake for #person# to celebrate making it through 2016.  What does the cake say?", "Describe #person# as a novelty donut. Frosted? Filled? Sprinkled? What kind of donut are they?", "#person# has one chance to stop the alien invasion, and an object in this room.  What do they use, and how do they save earth?", "You inherits a vast and sprawling mansion. Its probably haunted. Will #person# stay with you on the first night, or are you on your own?", "#person# is sentenced to live forever in a single building, but they can choose which building. Where is their prison going to be?", "#person# goes to work at the zoo, but gets the worst possible job there. What are they doing?", "#person# wins the lottery and buys you a car. What kind of car do they buy you?", "If #person# were a type of bread, what type would they be?", "#person# is a lone meerkat standing watch on the Kalahari plateau.  A shadow falls across the sky, it's a tawny eagle. They can either dive for safety, or chirp to alert the colony of danger.  Will Meercat #person# save themselves, or their colony?"]
  }
};