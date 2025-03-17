const TRANSITION_DEFAULT = {
  duration: 0.3,
};

const TRANSITION_STAGGER = {
  staggerChildren: 0.1,
};

export const VARIANTS_HEADER = {
  hidden: { opacity: 0, y: 5, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const TRANSITION_HEADER = {
  ...TRANSITION_DEFAULT,
  delay: 0.2,
};

export const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export const TRANSITION_SECTION = {
  ...TRANSITION_DEFAULT,
};

export const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...TRANSITION_STAGGER,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ...TRANSITION_DEFAULT,
      duration: 0.2,
    },
  },
};
