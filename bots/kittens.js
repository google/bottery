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