"use client";

import { useEffect } from "react";

const IDS_TO_HIDE = ["#header"];
const LAYOUT_CLASSNAMES = [
  "max-w-content",
  "mx-auto",
  "px-6",
  "py-24",
  "flex-1",
  "w-full",
];

const RemoveBaseLayout = () => {
  useEffect(() => {
    for (const id of IDS_TO_HIDE) {
      const element = document.querySelector(id);
      if (element) {
        element.classList.add("hidden");
      }
    }

    const main = document.querySelector("#main");
    if (main) {
      for (const classname of LAYOUT_CLASSNAMES) {
        main.classList.remove(classname);
      }
    }
  }, []);

  return null;
};

export default RemoveBaseLayout;
