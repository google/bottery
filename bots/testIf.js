bot = {
  states: {
    origin: {
      //onEnter: "val=random() if(val<.5,'low #/val#', 'high #/val#')"
      onEnter: "_count=0 'foo'",
    },

    happy: {

    }
  },

  initialBlackboard: {
    numbers: [1, 12, 43, 124],
    foo: {
      bar: 4
    }
  }
};