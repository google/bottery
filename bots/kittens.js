bot = {
  grammar: {
    noun: ["cat", "monkey","butter", "pants", "demon", "fluff", "taco", "mountain", "butt"],
    adj: ["fluffy", "fat", "puff", "tepid", "love", "unruly"],
    name: ["#noun.capitalize##noun#", "#adj.capitalize##noun#", "#noun.capitalize# the #adj.capitalize#"],
    catSpeak: ["mmrrr", "meow", "mmrrrrow", "meep", "#catSpeak# #catSpeak#"],
  },

  states: {
    origin: {
      onEnter: "'You has a kitten!' desired_pets=randomInt(1,5)",
      exits: "->name",
    },

    name: {
      onEnter: "'What do you want to name your kitten?'",
     chips: ["#name#", "#name#", "Cupcake", "Dark Lord Satan"],
     exits: "'*' ->respondToName name=INPUT"
    },

    respondToName: {
      onEnterSay: "The kitten pukes, I guess it likes the name #/name#.",
      exits: "->idle"
    },

    idle: {
      onEnterSay: "#/name# rolls around and makes cute noises",
      // maybe get more hungry or attention demanding
    },

    angry: {
      onEnter: "'The kitten is angry! *bite*'",
      exits: "wait:3 ->sleeping",
    },

    sleeping: {
      onEnter: "'The kitten is sleeping! zzzzzzzzz'",
      exits: "wait:3->hungry",
    },

    hungry: {
      onEnter: "'The kitten is hungry! meow meow #catSpeak#'",
      exits: "wait:3->angry",
    },

    pet: {
      onEnter: "'You pet the kitten' desired_pets--",
      exits: ["desired_pets>=0 ->happy_pet", "->angry_pet"]
    },

    happy_pet: {
      onEnterSay: "#/name# loves you and is in ecstacy"
    },

    angry_pet: {
      onEnterSay: "why did you pet #/name# when it didn't want to be petted!?",
      onEnter: "desired_pets=randomInt(1,5)",
      exits: "->angry"
    }
  },
  exits: "'pet' ->pet",
  // Old execution: directly goes to state
  // exits: "'pet' ->angry 'you pet the kitten, it does not like this'",
  initialBlackboard: {
    name: "Untitled Kitten",
    desired_pets: 3,
  }
};