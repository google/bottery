bot = {
  states: {
    origin: {
      onEnterSay: "I am a lost tesla\ntrying to get home",
      exits: ["wait:1 ->driving"]
    },

    update: {
      onEnterSay: "#origin#",
      exits: ["wait:3 ->driving", "wait:3 ->setRadio"]
        //  ask: "input:(where are you) ->update"
    },

    setRadio: {
      onEnterSay: "#activateRadio#\n",
      exits: ["wait:2 ->radioStation"]

    },

    radioStation: {
      onEnterSay: "#radioDesc#",
      exits: ["wait:2 ->driving"]
    },

    driving: {
      // onEnterPlay: "'cc/Syme 0#lowdigit#.wav'",
      onEnterSay: "driving\n",
      exits: ["wait:4 ->update"]
    },
  },
  grammar: {
    "personActivity": ["walking alone", "on the sidewalk", "playing with a #color# ball", "riding a #color# bicycle", "on a bench", "eating candy", "sitting on the sidewalk", "waiting for a friend", "at a bus stop", "with a balloon", "laughing", "singing", "crying", "looking lost", "sitting", "walking", "holding a stuffed toy", "wearing a #color# jacket", "painting graffiti", "painting a mural", "carrying a heavy box", "drawing on the sidewalk", "pulling a wagon", "looking at #natFeature.a#", "looking at #animal.a#"],
    "personBase": ["policeman", "old man", "child", "homeless person", "girl", "little child", "teenager", "old woman", "businessman", "school child"],
    "person": ["#personBase# #personActivity#", "#personBase#"],
    "personOrPet": ["#personBase#", "#personBase#", "#personBase#", "large dog", "small dog"],
    "toggle": ["setFlag", "toggleFlag", "setMode"],
    "feels": ["LONELY", "FEELING_PRESENT", "REMEMBERING", "DREAMING", "SAD", "AT_PEACE", "WANDERING", "OBSERVING", "HOPEFUL", "SCARED"],
    "animal": ["raccoon", "sparrow", "dog", "cat", "squirrel", "pigeon", "deer", "snake", "rabbit"],
    "herdAnimal": ["chicken", "duck", "cow", "horse", "sheep", "goat"],
    "color": ["blue", "green", "red", "black", "white", "gold", "orange"],
    "metalObj": ["sign", "car", "mailbox", "trashcan", "bicycle", "fence"],

    "metalAdj": ["abandoned", "rusted", "broken", "bent", "old", "#color#", "dented", "shiny"],



    "simpleTownBuilding": ["bridge", "shed", "barn", "house", "shop", "driveway", "overpass", "#shop#", "house", "cabin", "apartment building"],
    "simpleTownObj": ["a plastic bag", "#metalAdj.a# #metalObj#", "a trash bag", "a deflated ball", "a pile of old clothes", "a pair of shoes", "something #materialAdj#", "something #color#", "a piece of #color# paper"],
    "amFeeling": ["i am", "feeling", "am", "yes,"],
    "townObj": ["#person.a#", "#metalAdj.a# #metalObj#", "#simpleTownObj#", "#simpleTownObj#", "#simpleTownObj# in front of #shop.a#", "#person.a# by #simpleTownBuilding.a#", "#simpleTownBuilding.a#", "#simpleTownBuilding.a#, #materialAdj#"],
    "town": ["a big city", "a small town", "a town by #natFeature.s#", "a town", "a main street", "an old town", "a quiet town", "a busy town", "a quiet neighborhood", "a back alley"],
    "inTown": ["i am in #town#. #isee# #townObj#. #townObj#. \n#townObj#", "i am in #town#. #isee# #townObj#"],
    "weather": ["i feel #natureSound#", "#natureSound#,#amFeeling# #materialAdj#", "it is raining", "the sun is shining", "it is dark out", "i #see# stars", "that cloud looks like #animal.a#", "i can see the moon", "my cameras are foggy", "the winds here are strong", "my hood is wet", "my tires are muddy now", "#materialAdjPre# #pavement# #underneathMe#"],
    "pavement": ["concrete", "asphalt", "dirt", "pavement", "gravel"],
    "underneathMe": ["under my tires", "under me", "below", "coming up", "goes by"],
    "natFeature": ["wave", "mountain", "tree", "redwood", "pine", "cactus", "bush", "mesa", "hill", "shadow"],
    "natAdj": ["far away", "near", "coming nearer", "too close", "dark", "green", "bright", "wet", "black", "grey", "red"],
    "lookSky": ["that cloud looks like #animal.a#", "is that a shooting star? making a wish", "i #see# stars", "i see Orion", "i can see the milky way", "there are too many clouds to see stars", "the moon is full", "there is no moon tonight"],
    "sunDir": ["rising", "behind trees", "setting", "gone now"],
    "descNature": ["the sun is #sunDir#.  everything is #color#", "the #natFeature.s# are #natAdj#", "activating roof camera.  #lookSky#", "there is #animal.a# on the #dir#"],
    "inNature": ["#descNature#\n#seeNature#"],
    "sensable": ["motion", "movement", "light", "sound"],
    "seeNature": ["so pretty", "#toggle#:NatureAppreciationMode", "i like this", "the world is beautiful", "hello", "my sensors detect #sensable#", "\nsaving picture", "recording memory", "i will remember"],


    "dir": ["right", "left"],
    "optEllipses": ["\n", "", "", "\n", "", ""],
    "self-aware": ["i'm #optEllipses# #materialAdj#", "i'm #optEllipses# #materialAdj#?", "i am #materialAdj#", "so #materialAdj#"],
    "see": ["see", "saw", "notice", "watch"],
    "isee": ["i #see#", "my sensors detect", "there is"],
    "shop": ["school", "post office", "bank", "hotel", "department store", "grocery store", "laundromat", "art gallery", "coffee shop"],

    "materialAdjPre": ["wet", "dry", "dusty", "dirty", "mud-splattered", "leaf-covered", "muddy", "pebbly", "cracked"],
    "materialAdj": ["painted #color#", "#color#", "covered in grafitti", "dusty", "dirty", "mud-splattered", "leaf-covered", "covered in mud", "covered in flower petals", "covered with pollen", "covered in pine-needles", "muddy", "made of metal"],
    "shinyThing": ["a puddle", "a lake", "my sideview mirror", "the window in the car in front of me", "a shop window", "the windows of #shop.a#"],
    "sawReflection": ["i #see# my reflection in #shinyThing#.  #self-aware#"],

    "farmthing": ["#metalAdj.a# tractor", "#metalAdj.a# truck", "#color# fields", "grass", "fences", "a silo", "some #herdAnimal.s#"],
    "farm": ["[myAn:#herdAnimal#]#isee# #farmthing#. many #myAn.s#. can i be #myAn.a# with you?", "i leave #town#\n now #farmthing#, #farmthing#, #farmthing#"],
    "animalReaction": ["it was dead.  what is dead?", "so small", "do you have an owner too?", "it likes me.", "it rubs against my wheels as i stop.", "it follows me. where is it going", "will it stay with me? no", "but i cannot take passengers with me", "now it is gone. i miss it"],

    "metFriend": ["#isee# #animal.a#. #animalReaction#"],
    "question": ["how long have i been driving", "can i turn on the radio?", "will i see #natFeature.s#", "who is that #person#", "what does #natureSound# feel like?", "will i always come when called?", "where do the birds go", "what is #animal.a#", "can i talk to other cars"],

    "activity": ["there is #windowTrash.a# on my window. it is #color#.  oh, gone now.", "i turn #dir#", "i turn on my headlights", "i signal a #dir# turn", "i stop to recharge. will i dream? i dream of #animal.s#", "i am low on energy, so i stop", "i stop at a red light", "#personBase.a# crosses in front of me#. i brake", "#personBase.a# waves at me#"],

    "carDir": ["behind", "in front of", "being followed by"],
    "car": ["#color# car", "#color# truck", "#color# van", "police car", "delivery truck"],
    "optionalPersonAdj": [" curiously", " sadly", "", ""],
    "carGreeting": ["lets drive together", "will you drive with me", "will you be my friend"],
    "inTrafficDetail": ["hello traffic", "hello #car#, #carGreeting#", "hello #personOrPet# in the #car#", "hello #personOrPet# in the #car#, #carGreeting#", "#car.a#, #car.a#, many #car.s# with me", "i am #carDir# #car.a#", "#personOrPet.a# watches me#optionalPersonAdj# from the window of #car.a#"],
    "inTraffic": ["#inTrafficDetail#\n#inTrafficDetail#"],

    "windowTrash": ["leaf", "flower", "piece of paper"],

    "maybeNot": [" not", " only", "", "", "", " just", " always", " mostly"],
    "autocar": ["", "a car", "a car", "a car", "a car", "a car", "going places", "going somewhere", "full of energy", "seeking", "empty", "a being of hopes and dreams", "a self-driven car", "an owned car", "a vehicle", "a vessel", "a traveller", "an explorer"],
    "iam0": ["i am#maybeNot# #autocar#"],
    "iam": ["#iam0#", "#iam0#", "#iam0#", "#iam#\n#iam#"],

    "me": ["a good car", "i", "a tesla"],
    "seekingYou": ["i accelerate", "applying brakes", "beep beep", "hello.  hello.", "alone", "checking gps signal", "will be home soon", "i miss my owner", "where am i", "must get home", "i must get to my owner", "i have been summoned", "a good car will find its way home", "a good car will go home", "i will be a good car", "going home", "#seekingYou#\n\n#seekingYou#", "#question#", "#question#"],



    "__MUSIC AND RADIO______________": [],
    "natureSound": ["hail", "rain", "snow", "wind", "mist", "hard rain", "soft rain"],
    "bigSound": ["honking", "an ocean", "#static#", "roaring", "the sound of a train", "a thunderstorm", "crying", "whispering", "laughter", "cheering", "#natureSound# on #natureSurface#"],
    "natureSurface": ["the surface of a lake", "flower petals", "wet earth", "pavement", "sand", "leaves", "pine needles", "my windshield", "my roof", "the road"],
    "mySound": ["tires on #materialAdjPre# pavement", "#natureSound# on #natureSurface#"],
    "observation": ["recording the sound of #mySound#", "i hear #mySound#", "i record the sound of #mySound#. i will make a mixtape later"],

    "instrument": ["banjo", "steel guitar", "electric guitar", "bass guitar", "tin whistle", "church organ", "ukulele", "#aVoice#", "guitar", "slide guitar", "clarinet", "piano", "harmonica", "sitar", "tabla", "harp", "dulcimer", "violin", "accordion", "concertina", "fiddle", "tamborine", "choir", "harpsichord", "euphonium"],
    "musicModifier": ["heavy", "soft-voiced", "acoustic", "psychedelic", "light", "orchestral", "operatic", "distorted", "echoing", "melodic", "atonal", "arhythmic", "rhythmic", "electronic"],
    "musicGenre": ["metal", "electofunk", "jazz", "salsa", "klezmer", "zydeco", "blues", "mariachi", "flamenco", "pop", "rap", "soul", "gospel", "buegrass", "swing", "folk"],
    "musicPlays": ["echoes out", "reverberates", "rises", "plays", "slides"],
    "musicAdv": ["too quietly to hear", "into dissonance", "into a minor chord", "changing tempo", "to a major chord", "staccatto", "into harmony", "without warning", "briskly", "under the melody", "gently", "becoming #musicGenre#"],
    "themeAdj": ["lost", "desired", "redeemed", "awakened", "forgotten", "wanted", "broken", "forgiven", "remembered", "betrayed", "alone", "together again", "on the move"],
    "themeNoun": ["the future", "love", "drinking", "space travel", "the railroad", "childhood", "trees", "going too fast", "going fast", "going home", "summertime", "the road", "the ocean", "wanderlust", "war", "divorce", "nature", "pain", "hope", "a home", "a lover", "a friend", "a marriage", "family", "death"],
    "theme": ["#themeNoun# #themeAdj#"],
    "digit": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    "lowdigit": ["1", "2", "3"],

    "note": ["♪͛", "♫̖̄̅", "♬̓̽", "♩", "♪", "♫", "♬", "♩"],
    "staticBit": ["♪͛", "♫̖̄̅", "♬̓̽", "♩", ".̛̬̯͘", ".͋͘", ".̛̖̱̏.̤̃͛", " .̂͆ ̢͇̓͒.̢̙͌̅", " ͈̖̋̒.̼͇̂̓", "z̙̫͗͛", ".̪̮͋́z.̟̳̈̑", ".̑ ̟̩̓͝", " ͕̜̂̔z̊̋"],

    "static": ["...", "#note#", "#staticBit##staticBit#", "#staticBit##staticBit#", "#staticBit##staticBit#", "#staticBit##staticBit#", "#staticBit#st͚̖̿̇ǻtȋ͈̖̈c̄#staticBit#", "#staticBit#s͂͆taẗ́͂ic͂#staticBit#", "#staticBit##staticBit#"],

    "story": ["short story", "story", "poem"],

    "tells": ["tells me", "whispers", "speaks", "shouts", "preaches", "sings"],
    "loud": ["yelling", "soft-voiced", "loud", "staticky", "echoing", "old-fashioned", "tired-sounding", "sorrowful", "gruff", "calm", "peaceful", "soothing", "folksy"],
    "aVoice": ["#loud.a# voice", "#loud.a# man", "#loud.a# woman", "child"],
    "amProgramming": ["#aVoice# reads the news", "#aVoice# reads #story.a# about #themeNoun#", "#aVoice# reads me #story.a# about being #themeAdj#", "#aVoice# #tells# that i will be #themeAdj#", "#aVoice# #tells# about being #themeAdj#", "#bigSound#"],
    "fmProgramming": ["#note##instrument##note##musicAdv##note##note#", "#aVoice# is singing about #themeNoun#", "#instrument# #musicPlays# #musicAdv#"],
    "activateRadio": ["tuning radio to", "activating radio:"],
    "amStationID": ["8#digit#0", "9#digit#0", "10#digit#0", "11#digit#0", "12#digit#0", "7#digit#0"],
    "fmStationID": ["10#digit#.#digit#", "9#digit#.#digit#"],
    "radioDesc": ["#fmStationID#\n\n#fmProgramming#", "#amStationID# kilohertz\n \n\n#amProgramming#\n"],
    "turnOnRadio": ["#activateRadio#\n#radioDesc#"],

    "__ADVENTURE______________": [],
    "smallAdventure": ["#sawReflection#", "#question#", "#weather#", "#inTown#", "#inTown#", "#inNature#", "#inNature#", "#metFriend#", "#inTraffic#", "#farm#"],
    "adventure": ["#smallAdventure#", "#smallAdventure#", "#smallAdventure#", "#smallAdventure#"],
    "end": ["#toggle#:#feels#", "#seekingYou#", "#seekingYou#", "#seekingYou#", "#smallAdventure#", "#observation#", "#observation#", "#iam#", "#iam#"],
    "origin": ["#adventure#\n\n#end#", "#adventure#\n\n#end#", "#adventure#", "#adventure#\n#adventure#"]
  },
};