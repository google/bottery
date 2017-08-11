bot = {
  states: {
    origin: {
      onEnterSay: "#update#",
      chips: ["look at the Marauder's Map"],
      exits: ["'*' ->origin"]
    }
  },

  grammar: {
    student: ["Cedric Diggory", "Zacharias Smith", "Justin Finch-Fletchley", "Hannah Abbott", "Susan Bones", "Erni Macmillan", "Luna Lovegood", "Cho Chang", "Padma Patil", "Marietta Edgecobe", "Felicity Eastchurch", "Vincent Crabbe", "Draco Malfoy", "Millicent Bulstrode", "Pansy Parkinson", "Blaise Zabini", "Gregory Goyle", "Percy Weasley", "Oliver Wood", "Fred Weasley", "George Weasley", "Lee Jordan", "Dean Thomas", "Harry Potter", "Ron Weasley", "Hermione Granger", "Lavender Brown", "Neville Longottom", "Parvati Patil", "Colin Creevey", "Ginny Weasley"],
    professor: ["Professor Sprout", "Dolores Umbridge", "Professor Quirrell", "Gilderoy Lockhart", "Professor Slughorn", "Rubeus Hagrid", "Sybil Trelawney", "Severus Snape", "Remus Lupin", "Professor Flitwick", "Professor Dumbledore", "Professor McGonagall"],
    outsideLocation: ["the shore of the Great Lake", "the Forbidden Forest", "the Whomping Willow"],
    insideLocation: ["#academicLocation#", "#privateLocation#"],
    academicLocation: ["#professor#'s office", "the #subject# classroom"],
    privateLocation: ["the Hufflepuff basement", "the Ravenclaw Tower", "the Slytherin Dungeon", "the Gryffindor Tower", "#house# common room", "#house# #upper# dormitory"],
    house: ["Hufflepuff", "Ravenclaw", "Slytherin", "Gryffindor"],
    location: ["#insideLocation#", "#insideLocation#", "#outsideLocation#"],
    upper: ["upper", "lower"],
    stairs: ["trapdoor", "stairs", "ladder"],
    transitLocation: ["the hallway outside #insideLocation#", "the #stairs# to #insideLocation#"],
    subject: ["Astronomy", "Herbology", "Alchemy", "Apparition", "Arithmancy", "Study of Ancient Runes", "Potions", "Transfiguration", "Divination", "Charms", "History of Magic", "Muggle Studies", "Defense Against the Dark Arts"],

    creature: ["grindylow", "dragon", "hippogriff", "acromantula", "basilisk", "phoenix"],
    sentient: ["house elf", "merperson", "centaur", "ghoul", "giant", "dementor"],
    cause: ["House Elf Liberation", "Ghost Extermination", "#sentient# Rights", "#creature# Conservation", "anti-subject"],

    spellType: ["curse", "hex", "charm", "spell", "enchantment"],
    spellAdj: ["forbidden", "obsolete", "magical", "implausible", "lost"],
    bookType: ["#spellAdj# #spellType.s#", "#spellType.s#"],
    against: ["for", "for", "against"],
    army: ["Detractors", "Army", "Coven", "Force", "Society"],
    organization: ["the Society #against# #cause#", "the #cause# Army", "#professor#'s #army#"],
    ghost: ["the Fat Friar", "Nearly Headless Nick", "The Bloody Baron", "Peeves", "Professor Cuthbert Binns", "Moaning Myrtle", "The Grey Lady"],
    person: ["#professor#", "#professor#", "#student#", "#student#", "#student#", "#student#", "#sentient.a#"],
    urgently: ["politely", "angrily", "urgently", "quietly", "loudly"],
    communicatingWith: ["debating #subject# with #person#", "scolding #person#"],
    doingRegularThing: ["reading #book# in #location#", "napping in #location#", "talking #urgently# to #person#", "#communicatingWith# #person#"],
    doingMagic: ["practing duelling", "practicing forbidden curses"],
    update: ["#person# is chasing an escaped #creature# through #transitLocation#", "#person# is sneaking into #insideLocation# with #person#", "#person# is #doingRegularThing#", "#ghost# is drifting through #transitLocation#", "#ghost# is currently haunting #insideLocation#", "#student# is #doingMagic# in the Room of Requirement", "#student#, #student# and #student# are #doingMagic# in the Room of Requirement", "#student#, #student# and #student# are holding a secret meeting of \"#organization#\" in the Room of Requirement", "#student# is sneaking into #location# with #student#", "#professor# and #professor# are debating #spellStuff# in #academicLocation#", "#person# is researching #magicArtifact# in the library's #bookType# wing"]
  },


  initialBlackboard: {
    locations: {

    },
    students: {
      Hufflepuff: ["Cedric Diggory", "Zacharias Smith", "Justin Finch-Fletchley", "Hannah Abbott", "Susan Bones", "Ernie Macmillan"],
      Ravenclaw: ["Luna Lovegood", "Cho Chang", "Padma Patil", "Marietta Edgecobe", "Felicity Eastchurch"],
      Slytherin: ["Vincent Crabbe", "Draco Malfoy", "Millicent Bulstrode", "Pansy Parkinson", "Blaise Zabini", "Gregory Goyle"],
      Griffindor: ["Percy Weasley", "Oliver Wood", "Fred Weasley", "George Weasley", "Lee Jordan", "Dean Thomas", "Harry Potter", "Ron Weasley", "Hermione Granger", "Lavender Brown", "Neville Longottom", "Parvati Patil", "Colin Creevey", "Ginny Weasley"]


    },
    professors: ["Professor Sprout", "Dolores Umbridge", "Professor Quirrell", "Gilderoy Lockhart", "Professor Slughorn", "Rubeus Hagrid", "Sybil Trelawney", "Severus Snape", "Remus Lupin", "Professor Flitwick", "Professor Dumbledore", "Professor McGonagall"],

    ghosts: ["the Fat Friar", "Nearly Headless Nick", "The Bloody Baron", "Peeves", "Professor Cuthbert Binns", "Moaning Myrtle", "The Grey Lady"]
  }
};