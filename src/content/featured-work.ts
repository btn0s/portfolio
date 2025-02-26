import playBackboneHome from "@/assets/images/playbackbone-home.jpg";
import figmaPluginCover from "@/assets/images/work/games-db-figma-plugin/cover.png";
import timeMachineCover from "@/assets/images/work/time-machine/cover.png";
import type { StaticImageData } from "next/image";

export interface FeaturedWorkItem {
  id: string;
  title: string;
  subtitle: string;
  description: string[];
  context?: string;
  imageSrc: StaticImageData;
  imageAlt: string;
  link?: {
    url: string;
    text: string;
  };
}

export const FEATURED_WORK: FeaturedWorkItem[] = [
  {
    id: "gamesdb-figma-plugin",
    title: "GamesDB Figma Plugin",
    subtitle: "for Backbone",
    description: [
      "A Figma plugin developed for Backbone that allows designers to access and integrate game data directly into their designs.",
      "The plugin streamlines the design workflow by providing easy access to game assets, metadata, and information from the GamesDB database.",
    ],
    imageSrc: figmaPluginCover,
    imageAlt:
      "Screenshot of the GamesDB Figma Plugin interface showing game data integration",
    link: {
      url: "/work/games-db-figma-plugin",
      text: "View Project",
    },
  },
  {
    id: "timemachine",
    title: "TimeMachine",
    subtitle: "for American Express",
    description: [
      "A bridge system that enabled seamless modernization at scale—delivering new features without breaking legacy infrastructure.",
      "TimeMachine allowed React and Angular to coexist, creating a path for incremental adoption without disrupting business operations.",
    ],
    imageSrc: timeMachineCover,
    imageAlt:
      "Screenshot of the TimeMachine bridge system architecture showing React and Angular integration",
    link: {
      url: "/work/time-machine",
      text: "View Project",
    },
  },
  {
    id: "backbone-homepage",
    title: "Backbone.com Homepage",
    subtitle: "Website Redesign",
    description: [
      "A complete redesign of the Backbone.com homepage, focusing on improved user experience, modern aesthetics, and clearer communication of the product value.",
      "The redesign resulted in increased engagement metrics and a more effective conversion funnel for new users.",
    ],
    imageSrc: playBackboneHome,
    imageAlt:
      "Screenshot of the redesigned Backbone.com homepage showing the modern interface and layout",
  },
  {
    id: "withpod-ai",
    title: "Pod, for the Curious!",
    subtitle: "withPod.ai",
    description: [
      "An AI-powered platform designed for curious minds to explore and learn through interactive conversations.",
      "Pod creates personalized learning experiences by adapting to users' interests and learning styles, making knowledge discovery more engaging and effective.",
    ],
    imageSrc: playBackboneHome,
    imageAlt:
      "Screenshot of the withPod.ai interface showing the AI-powered learning platform",
  },
  {
    id: "321bang",
    title: "321Bang",
    subtitle: "1v1 Multiplayer Reaction Game",
    description: [
      "A fast-paced multiplayer reaction game built with React where players compete in 1v1 matches to test their reflexes.",
      "The game features real-time competition, leaderboards, and various game modes to challenge players' reaction times in different scenarios.",
    ],
    imageSrc: playBackboneHome,
    imageAlt:
      "Screenshot of the 321Bang game interface showing the multiplayer reaction game in action",
  },
];
