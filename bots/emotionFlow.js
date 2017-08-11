bot = {
  states: {
    origin: {
      onEnterSay: "Heya, how's it going?",
      exits: [{
          chip: '🙂',
          target: "happy",
        }, {
          chip: "😒",
          target: "bored",
        }, {
          chip: "😐",
          target: "bored",
        }, {
          chip: "😠",
          target: "mad",
        }, {
          chip: "😔",
          target: "sad",
        }

      ],
    },
    sad:  {
      onEnterSay: "I'm sorry you're feeling sad 🌧 \n What's wrong?",
      exits: [{
        target: "serioussad",
        chip: "Something's really wrong",
      }, {
        target: "sadmusic",
        chip: "I'm feeling down",
      }],
    },

    sadmusic: {
      onEnterSay: 'It\'s okay to feel sad or angry sometimes\nHere\'s a song that might help you\n<iframe width="200" height="113" src="https://www.youtube.com/embed/4zLfCnGVeL4" frameborder="0" allowfullscreen></iframe>\n I also found tips about dealing with loss, would you like those? \n Or listen to more music?',
      exits: [{
        target: "sadmusic",
        chip: "More music",
      }, {
        target: "sadtips",
        chip: "Helpful tips",
      }, {
        target: "sad",
        chip: "No, I'd rather just talk",
      }]
    },
    sadtips:  {
      onEnterSay: 'Here are some tips on understanding why you are sad <a href="http://au.reachout.com/feeling-sad-without-knowing-why">Feeling sad without knowing why</a> \n Did this help?',
      exits: [{
        target: "serioussad",
        chip:"No, it's worse than that",
      }, {
        target: "loss",
        chip: "I want to hear more about dealing with sadness",
      }, {
        target: "origin",
        chip: "Yeah",
      }]
    },

    serioussad: {
      onEnterSay: 'Even in really bad times, you can reach out for help. The Crisis Text Line can help talk you through a crisis \n Or the National Suicide Prevention Lifeline can help you if you are dealing with suicidal thoughts.  \n There are many other kinds of resources available, too.',
      exits: [{
        target: "crisisline",
        chip: "text the Crisis Text Line",
      }, {
        target: "lifeline",
        chip: "call the National Suicide Prevention Lifeline",
      }, {
        target: "loss",
        chip: "I want to hear more about dealing with loss",
      }]
    }, 
    crisisline: {
      onEnterSay: "I've found information about the Crisis Text Line\n <div class='quote'>\"Q: HOW DOES CRISIS TEXT LINE WORK? <br>A: You text 741741 when in crisis. Available 24/7 in the USA. <br>A live, trained crisis counselor receives the text and responds quickly. <br>The crisis counselor helps you move from a hot moment to a cool calm to stay safe and healthy using effective active listening and suggested referrals – all through text message using Crisis Text Line’s secure platform.\"</div>",
      exits: [{
        target: "crisisline",
        chip: "Text <a href=''>741741</a>",
      }, {
        target: "origin",
        chip: "(restart emotion flow)",
      }]
    }, 

    lifeline: {
      onEnterSay: "I've found information about the Crisis Text Line\n<div class='quote'>\"The following signs may mean someone is at risk for suicide. The risk of suicide is greater if a behavior is new or has increased and if it seems related to a painful event, loss, or change. If you or someone you know exhibits any of these signs, seek help as soon as possible by calling the Lifeline at 1-800-273-TALK (8255).\"</div>",
      exits: [{
        target: "lifeline",
        chip: "Call <a>1-800-273-8255</a>",
      }, {
        target: "origin",
        chip: "(restart emotion flow)",
      }]
    },

    //===============================================================
    // Bored
    bored: {
      text: "Would you like to play a game? \n Or listen to some new music? \n Or learn something new?",
      exits: [{
        target: "game",
        chip: "game",
      }, {
        target: "music",
        chip: "music",
      }, {
        target: "learn",
        chip: "learn something new",
      }],
    },

    mad: {
      onEnterSay: "😡 I'm sorry you're feeling mad\nWhat's wrong",

      exits: [{
        target: "loss",

        chip: "I lost something important",
      }, {
        target: "unappreciated",
        chip: "I don't feel appreciated",
      }, {
        target: "hurt",
        chip: "Someone was cruel to me",
      }, {
        target: "unfair",
        chip: "The world is being unfair",
      }, {
        target: "unappreciated",
        chip: "I'm frustrated with myself",
      }]
    },

    loss: {
      onEnterSay: 'It\'s okay to feel sad or angry when you lose something important\nHere\'s a song that might help you\n<iframe width="200" height="113" src="https://www.youtube.com/embed/UbDF8pXeNNM" frameborder="0" allowfullscreen></iframe>\n I also found tips about dealing with loss, would you like those?',
      exits: [{
        target: "lossTips",

        chip: "sure",
      }]
    },
    unappreciated: {
      onEnterSay: 'It\'s no fun to feel like the world doesn\'t see you \n But you\'re alway a valuable and important person \n Here\'s a song that might help you\n<iframe width="200" height="113" src="https://www.youtube.com/embed/rfFXM6I8Sg4" frameborder="0" allowfullscreen></iframe>\n I also found tips about feeling better about yourself, would you like those?',
      exits: [{
        target: "selfEsteemTips",
        chip: "yeah",
      }]
    },

    hurt: {
      onEnterSay: 'It can really hurt when someone doesn\'t treat you right. \n But you\'re alway a valuable and important person \nHere\'s a song that might help you\n<iframe width="200" height="113" src="https://www.youtube.com/embed/s4vECp5dZs0" frameborder="0" allowfullscreen></iframe>\n I also found tips about dealing with anger, would you like those?',
      exits: [{
        target: "angerTips",
        chip: "yeah",
      }]
    },
    unfair: {
      onEnterSay: 'Sometimes the world just seems like everything is against you \n Sometimes it helps to take a step back, and look at the world with fresh eyes \nHere\'s a song that might help you\n<iframe width="200" height="113" src="https://www.youtube.com/embed/cl_t6efp8zA" frameborder="0" allowfullscreen></iframe>\n I also found tips about making a fresh start, would you like those?',
      exits: [{
        target: "restartTips",
        chip: "yeah",
      }]
    },
    lossTips: {
      onEnterSay: "<a href='http://www.nhs.uk/Livewell/emotionalhealth/Pages/Dealingwithloss.aspx'>Dealing with loss</a>",
      exits: [{
        target: "selfEsteemTips",
        chip: "More tips please",
      }, {
        target: "origin",
        chip: "(restart emotion flow)",
      }]
    },
    angerTips: {
      onEnterSay: "<a href='http://tinybuddha.com/blog/20-things-to-do-when-youre-feeling-angry-with-someone/'>20 Things to Do When You’re Feeling Angry with Someone</a>",
      exits: [{
        target: "lossTips",
        chip: "More tips please",
      }, {
        target: "origin",
        chip: "(restart emotion flow)",
      }]
    },
    selfEsteemTips: {
      id: "selfEsteemTips",
      onEnterSay: "<a href='http://liveboldandbloom.com/11/self-confidence/25-things-to-remember'>25 Things To Remember When Low Self-Esteem Kicks Your Butt</a>",
      exits: [{
        target: "angerTips",
        chip: "More tips please",
      }, {
        target: "origin",
        chip: "(restart emotion flow)",
      }]
    },
    restartTips: {
      id: "restartTips",
      onEnterSay: "<a href='http://www.fastcompany.com/3034436/hit-the-ground-running/the-10-best-pieces-of-advice-for-making-a-fresh-start'>The 10 Best Pieces Of Advice For Making A Fresh Start</a>"
    },


    happy: {
      onEnterSay: "💃 I'm so glad you're feeling good!\nWhat's up?",


      exits: [{
        chip: "I got something that I wanted",
        target: "celebrate",
      }, {
        chip: "Something turned out better than I'd expected",
        target: "celebrate",
      }, {
        chip: "I learned something cool today",
        target: "celebrate",
      }, {
        chip: "I got to spend time doing something I enjoy",
        target: "celebrate",
      }, {
        chip: "🌈 I'm just feeling lucky 🌈",
        target: "celebrate",
      }]

    },

    celebrate: {
      onEnter: "e0='#emoji#' e1='#emoji#' e2='#emoji#' e3='#emoji#'",
      onEnterSay: "Congrats!\nI want to make a painting to commemorate this\nWhat are three emoji that represent what happened?",
      chips: "#/e0##/e1##/e2#",
      exits: "'*' ->emojiPainting"
    },
    emojiPainting: {
      onEnterSay: "#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#<br>#myEmoji##myEmoji##myEmoji##myEmoji##myEmoji##myEmoji#\n I call it '(YOURNAME)#beingCool#'",
      exits: "wait:5 ->origin"
    },
  },
  grammar: {
      beingCool: ["'s Big Day", " Party Life", "'s Adventure", " Having Fun", " Rocking Out"],
myEmoji: ["#/e0#", "#/e1#", "#/e2#"],
    emoji: "🎫 🎟 🎭 🎨 🎪 🎤 🎧 🎼 🎹 🎷 🎺 🎸 🎻 🎬 🏹 🎣 🚣 🏊 🏄 🛀 ⛹ 🏋 🚴 🚵 🏇 🕴 🏆 🎽 🏅 🐱 😎 😸 👏 💀 👻 😊 😦 🤖 🎉 🐍 🐳 ⛈ 🔥 🌟 😐 😮 🐰 🐹 🦄 🌎 💨 🐏 🍺 🍰 👾 🚀 🔪 💕 💛 ⛄ 😔 😆 🙄 😛 🐱 😎 😸 👏 💀 👻 😊 😦 🤖 🎉 🐍 🐳 ⛈ 🔥 🌟 😐 😮 🐰 🐹 🦄 🌎 💨 🐏 🍺 🍰 👾 🚀 🔪 💕 💛 ⛄ 😔 😆 🙄 😛".split(" "),

  }
};