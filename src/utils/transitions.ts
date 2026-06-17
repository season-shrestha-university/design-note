export const fadeUp = {
  forwards: {
    old: {
      name: "fadeUpOut",
      duration: "0.45s",
      easing: "ease-in",
      fillMode: "forwards",
    },
    new: {
      name: "fadeUpIn",
      duration: "0.55s",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fillMode: "backwards",
    },
  },
  backwards: {
    old: {
      name: "fadeUpOut",
      duration: "0.45s",
      easing: "ease-in",
      fillMode: "forwards",
    },
    new: {
      name: "fadeUpIn",
      duration: "0.55s",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fillMode: "backwards",
    },
  },
};
