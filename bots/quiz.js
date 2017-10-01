bot = {
  states: {
    origin: {
      onEnterSay: "Welcome to the hip hop name quiz\nI'll ask you some questions to determine your optimal hiphop DJ name\nAnswer each question with 'one' or 'two', or 'reset' to start over",
      onEnter: "count=0 scores.Kawaii=0 scores.Nature=0 scores.Tough=0 scores.Nerd=0 scores.Money=0",
      exits: ["->q_start"],
      //exits: ["->cheat"],
    },

    cheat: {
      onEnter: "count=4 scores[select(themes)]++ scores[select(themes)]++ scores[select(themes)]++ scores[select(themes)]++ scores[select(themes)]++",
      exits: "->calculateScore"
    },

    q_start: {
      exits: ["(count<qCount) ->q_ask", "->calculateScore"],
    },

    // Compare two things
    q_ask: {
      onEnter: "count++ q0=select(themes) q1=select(themes)",
      onEnterSay: ["#question#"],
      exits: [
        "'one' ->q_start '#/q0#++' scores[q0]++",
        "'two' ->q_start '#/q1#++' scores[q1]++"
      ]
    },

    // Find the two highest scores
    calculateScore: {

      onEnterFxn: function() {
        var pointer = this;

        console.log("Calculate");
        var sorted = ["Tough", "Nature", "Nerd", "Kawaii", "Money"].sort(function(a, b) {
          var scoreA = pointer.get("scores." + a);
          var scoreB = pointer.get("scores." + b);

          return scoreB - scoreA;
        });

        console.log("score." + sorted[0]);
        console.log("score." + sorted[1]);


        if (pointer.get("score." + sorted[1]) === 0) {
          pointer.set("theme1", sorted[0]);
        } else {
          pointer.set("theme1", sorted[1]);
        }

        pointer.set("theme0", sorted[0]);

        console.log(sorted[0], sorted[1]);


      },
      exits: "->assignName"
    },

    assignName: {
      onEnter: ["'Your traits are #/theme0# and #/theme1#\n So your hiphop name is #rapperName#\nor #rapperName#\nor #rapperName#\nor #rapperName#'"],

      exits: ["wait:60 ->origin"],
    },

    random: {

      onEnter: "theme0=select(themes) theme1=select(themes)",
      exits: "->assignName"
    },

    universal: {
      exits: "'reset' ->origin"
    }
  },

  initialBlackboard: {
    qCount: 3,
    themes: ["Tough", "Nature", "Nerd", "Kawaii", "Money"],
  },
  grammar: {
    question: ["#rather#", "#rather#", "#rather#", "#pet#"],
    pet: ["Would you rather have #pet{/q0}.a# or #pet{/q0}.a#?"],
    rather: ["Would you rather #activity{/q0}#, or #activity{/q1}#?"],


    petNerd: ["robot servant", "clone of yourself", "killbot", "space station", "lightsaber"],
    petNature: ["pet squirrel", "tree you could talk to", "whale as a friend", "treehouse"],
    petKawaii: ["actual unicorn", "pet hamster", "pony", "gallon of glitter", "miniature poodle", "literal ton of candy"],
    petTough: ["bodyguard", "pet grizzly bear", "secret island fortress", "private gym", "collection of samurai swords"],
    petMoney: ["private island", "private airplane", "secret art museum", "mansion", "castle", "toilet made of solid gold"],



    activityNerd: ["write code", "win the Nobel prize in physics", "start a software company", "be famous in Silicon Valley", "have a shiny new computer"],
    activityNature: ["go for a hike", "see a tiger in the wild", "go horseback riding", "scuba dive on a coral reef", "go surfing", "be able to fly", "be able to talk to animals"],
    activityKawaii: ["be covered in kittens", "pet a puppy", "own a candy store", "have an ice cream flavor named after you", "be reincarnated as a hamster", "be a dolphin"],
    activityMoney: ["win the lottery", "own a mansion", "win a new car", "take your friends out to dinner", "own an amusement park"],
    activityTough: ["be able to punch through a brick wall", "be the strongest person in the world", "have a personal army", "know kung fu", "own a suit of armor", "fly a fighter jet", "be able to do a backflip", "get a blackbelt in karate"],

    baseRapperName: ["#adj{/theme0}.capitalize##noun{/theme1}.capitalize#", "#adj{/theme1}.capitalize##noun{/theme0}.capitalize#", "#adj{/theme0}.capitalize# #noun{/theme1}.capitalize#", "#adj{/theme1}.capitalize# #noun{/theme0}.capitalize#",
      "#adj{/theme0}.capitalize#-#noun{/theme1}.capitalize#", "#adj{/theme1}.capitalize#-#noun{/theme0}.capitalize#"
    ],
    rapperModified: ["#baseRapperName.capitalize.hiphopify#", "#baseRapperName.capitalize#"],
    prefix: ["Doctor", "DJ", "MC", "DJ", "MC", "Grandmaster", "The"],
    rapperName: ["#rapperModified.capitalize#", "#prefix# #rapperModified.capitalize#", "#prefix# #rapperModified.capitalize#", "#baseRapperName.hiphopify#"],

    adj: ["baby", "young", "big", "cool"],
    noun: ["boy", "sugar", "man", 'kid', "million", "note", "tone"],

    adjTough: ["sword", "stab", "dead", "bullet", "furious", "angry", "rage", "skull", "death", "murder", "brutal", "iron", "steel", "kill", "hard", "shiv", "blood", "fight", "riot", "scar", "knight"],
    nounTough: ["murder", "kill", "stab", "brute", "bone", "wrecker", "hand", "fist", "kick", "ninja", "zombie", "fighter"],

    adjNature: ["tiger", "free", "tofu", "bird", "nature", "fly", "clean", "mammoth", "outside", "fresh", "surf", "storm"],
    nounNature: ["mountain", "tree", "wind", "owl", "cat", "sun", "heart", "planet"],

    adjNerd: ["book", "sci", "space", "star", "science", "word", "math", "atomic", "data", "digital", "mega", "nano", "cyber"],
    nounNerd: ["laser", "nova", "book", "nerd", "future", "head", "brain", "neuron", "feed", "tech", "byte"],

    adjKawaii: ["adora", "cuddle", "kitten", "baby", "mini", "candy", "glow", "hamster", "bubble", "glitter", "sunny", "rainbow", "emoji"],
    nounKawaii: ["kitten", "puppy", "pants", "kitty", "muffin", "waffle", "heartz", "idol", "mint", "panda", "gloss", "shine"],

    adjMoney: ["sugar", "richie", "dolla", "royal", "$", "king", "queenie", "cash", "ice", "bling", "grand", "mega"],
    nounMoney: ["cash", "coinz", "billz", "million", "note", "money", "baron", "millionaire"]
  }
};