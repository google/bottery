bot = {
  states: {
    origin: {
      exits: ["->initRhyme"],
    },

    initRhyme: {
      onEnter: "rhyme=select(rhymes) firstLine=select(lines[rhyme]) '#/firstLine#'",
      exits: ["->rhyme"]
    },

    rhyme: {
      onEnter: "firstLine=select(lines[rhyme]) '#/firstLine#' 'Is this a good next line?'",
      exits: ["wait:40 ->rhyme", "'yes' ->rhyme", "'no' ->rhyme", "'new rhyme' ->initRhyme"]
    }
  },
  grammar: {
    noun: ["cat", "moose", "cloud", "car", "friend", "rose", "mouse", "cake", "book", "snake"],
    adj: ["tall", "great", "cool", "smart", "nice", "giant"],
  },
  initialBlackboard: {
    rhymes: ["ee", "ad", "ays"],
    lines: {
      ays: ["How do I love #noun#s? Let me count the ways", "I'll love #noun#s for all my days"],
      ad: ["I remember a #noun# I had", "A #adj# #noun# would be rad", "#noun#s will never make me sad", "A #noun# can always make me glad"],
      ee: ["A #noun# is lovely as a tree", "I'm not as #adj# as #noun.a# would be"],
    },

  },
};