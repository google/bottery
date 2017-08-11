bot = {
  grammar: {
    furTextureBase: ["fluffy", "curling", "smooth", "silky", "shiny", "iridescent", "long"],
    fur: ["fur", "feathers", "scales"],
    furTexture: ["#furTextureBase#"],
    furAmt: ["a mane of ", "patches of ", ""],
    color: ["red", "blue", "grey", "pink", "silver", "gold", "purple", "indigo", "green"],
    mod: ["electro", "were", "cyber", "fire", "wind", "aero", "flame", "sun", "spiral", "war", "mist", "space", "necro", "cyber", "slime", "mud", "air", "anti", "grav", "magna", "phantasma"],
    species: ["bear", "penguin", "spider", "dolphin", "squid", "otter", "puppy", "kitten", "dragon", "tiger", "lizard", "iguana", "snake", "peacock", "hamster", "sloth", "koala", "pony", "chinchilla", "chicken", "bunny"],
    trait: ["antlers", "#color# stripes", "#color.a# belly", "#color.a# ears", "#color# toes", "#short.a# tail", "#short# #color# #fur#"],
    short: ["luxurious", "long", "short", "fluffy", "soft", "silky"],
    tailAdjBase: ["stumpy", "wide", "long", "feathery", "scaly", "glowing"],
    tailAdj: ["#tailAdjBase#", "#tailAdjBase# #color#"],
    horns: ["antlers", "horns", "ears"],
    attribute: ["#furAmt##furTexture# #fur#", "#tailAdj.a# tail", "#tailAdj# wings", "a single #tailAdj# horn", "#tailAdj# tentacles", "#tailAdj# #horns#"],
    size: ["large", "small", "medium", "tiny", "enormous"],
    describeEggIndex: ["#eggs/{#/eggIndex#}/size# #eggs/{#/eggIndex#}/color#"],

    describeCreatureIndex: ["#creatures/{#/cIndex#}/species0#-#creatures/{#/cIndex#}/species1#"],
    describeCreatureIndexFull: ["#creatures/{#/cIndex#}/color# #creatures/{#/cIndex#}/species0#-#creatures/{#/cIndex#}/species1#, with #creatures/{#/cIndex#}/attribute#"],
    describeEgg: ["#/eggs/0/size# #/eggs/0/color# egg worth #/eggs/0/cost#"],
  },
  states: {

    origin: {
      onEnter: "'Loading MonsterPets'",
      exits: "->gainEgg"
        //  exits: "->hatch_egg"

    },

    gainEgg: {
      // Push to an array
      onEnter: "create('egg',3,5)",
      exits: "->inventory"
    },

    idle: {

    },

    inventory: {

      // there are N eggs in the inventory
      onEnter: ["'you have #/eggs/length# eggs'", "'#describeEgg#' for egg in eggs"],

      exits: ["wait:100 ->gainEgg", "'sell' ->sell_whichEgg", "'hatch' eggs.length>0 ->hatch_whichEgg", "'hatch' eggs.length==0 ->@ 'You don\\'t have any eggs to hatch'"],
    },

    sell_whichEgg: {
      onEnter: ["'Ok, which egg do you want to sell?'"],
      exits: ["'one' ->sell_egg eggIndex=0",
        "'two' ->sell_egg eggIndex=1",
        "'three' ->sell_egg eggIndex=2f"
      ],
    },



    sell_egg: {
      onEnter: ["'You sell the #describeEggIndex# egg.'", "coins+=eggs[eggIndex].cost", "deleteAt(eggs, eggIndex)"],
      exits: ["->inventory"]
    },



    hatch_whichEgg: {
      onEnter: ["'Ok, which egg do you want to hatch?'"],
      exits: ["'one' ->hatch_egg eggIndex=0",
        "'two' ->hatch_egg eggIndex=1",
        "'three' ->hatch_egg eggIndex=2"
      ],
    },
    hatch_egg: {
      onEnter: ["create('creature',3,5)", "cIndex=creatures.length-1", "'The #describeEggIndex# egg hatches.\n It's a #describeCreatureIndexFull#'", "deleteAt(eggs, eggIndex)"],
      exits: ["->inventory"]
    },

    feed: {
      onEnter: ["'You want to feed your #describeCreatureIndex#.  It looks hungry. What do you gve it to eat?'"],
      exits: ["'*' hash(INPUT)>50 ->feed_bad food='#/INPUT#'", "'*' hash(INPUT)<50 ->feed_good food='#/INPUT#'"]
    },

    feed_bad: {
      onEnter: ["'It sniffs the #/food#, and turns away in disgust. I guess it doesn\\'t like that food!'"],
      exits: "->loseMood"
    },

    feed_good: {
      onEnter: ["'It eats #/food#, chewing happily. I guess it likes that food!'"],
      exits: "->gainMood"
    },

    gainMood: {
      onEnter: ["'#describeCreatureIndex# gets happier'", "(mood+=10)"],
      exits: ["->checkMood"]
    },


    loseMood: {
      onEnter: ["'#describeCreatureIndex# gets less happy'", "(mood-=10)"],
      exits: ["->checkMood"]
    },

    checkMood: {
      exits: ["(mood>60) ->idle 'The #describeCreatureIndex# is very happy!'",
        "(mood<30) ->idle 'The #describeCreatureIndex# is very sad, and doesn\\'t like you!'",
        "(mood>=30&&mood<=60) ->idle 'The #describeCreatureIndex# isn\\'t sure if it likes you yet'"
      ],
    },

    lookAt: {
      onEnter: ["'It\\'s a #describeCreatureIndex#. Its happiness is #/mood# out of 100. It is #/creatures/{cIndex}/age# days old'"],
      exits: "->idle"
    }

  },



  exits: [
    //"'name' ->reactToName play(media#name#) interactions++ ++affection bonding+=affection *",
    // /"wait:10 input:* ->idle (eggCount+=1) (foo--) (foo.bar--) foo(#/bar/baz#) foo(bar.baz) foo-=1 {#/bar/foo(10+foo)#}=-foo*-1 (if (eggCount>10) eggCount = 10) "
    //  "eggs[eggs.count - 1] ->idle eggs[0]=1 push(eggs, 5) myEgg=pop(eggs)",
    "wait:90 ->inventory",
    "'cheat' ->idle 'Time passes...' creatures[cIndex].age+=10",
    "'feed' ->feed",
    "'buy' ->gainEgg",
    "'inventory' ->inventory",
    "'look' ->lookAt"
  ],

  initialBlackboard: {
    eggs: [],
    creatures: [],
    coins: 0,
    eggIndex: 0,
    mood: 50

  },
  contentRecipes: {
    egg: "size:'#size#' color:'#color#' cost:(randomInt(5,20) * 10)",
    creature: "species0:'#species#' species1:'#species#'  age:1 attribute:'#attribute#' color:'#color#'"
  },
};