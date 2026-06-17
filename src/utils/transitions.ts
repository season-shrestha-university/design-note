const fadeUpAnimation = {
  old: {
    name: "fadeUpOut",
    duration: "0.45s",
    easing: "ease-in",
    fillMode: "forwards",
  },
  new: {
    name: "fadeUpIn",
    duration: "0.45s",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fillMode: "backwards",
  },
} as const;

const fadeTitleAnimation = {
  old: {
    name: "titleFadeOut",
    duration: "0.2s",
    easing: "ease-in",
    fillMode: "forwards",
  },
  new: {
    name: "titleFadeIn",
    duration: "0.45s",
    delay: "0.15s",
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    fillMode: "backwards",
  },
} as const;

export const fadeUp = {
  forwards: fadeUpAnimation,
  backwards: fadeUpAnimation,
};

export const fadeTitle = {
  forwards: fadeTitleAnimation,
  backwards: fadeTitleAnimation,
};
