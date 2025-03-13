import bangCover from "@/assets/images/lab/321bang/cover.png";
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
      "I developed a Figma plugin integrating Backbone's game database directly into design workflows. This reduced asset management time by 80% while ensuring design-production consistency.",
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
      "I built a bridge system for American Express enabling incremental Angular-to-React modernization. The solution maintained 100% uptime during transition and supported launching a new market vertical.",
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
      "I redesigned Backbone's homepage focusing on conversion optimization and responsive design. The implementation increased visitor engagement by 40% and strengthened their premium gaming hardware brand.",
    ],
    imageSrc: playBackboneHome,
    imageAlt:
      "Screenshot of the redesigned Backbone.com homepage showing the modern interface and layout",
    link: {
      url: "/work/backbone-homepage",
      text: "View Project",
    },
  },
  {
    id: "withpod-ai",
    title: "Pod, for the Curious!",
    subtitle: "withPod.ai",
    description: [
      "I developed an AI learning platform delivering personalized educational experiences through conversation. The system adapts to individual learning styles, making knowledge discovery accessible for thousands of users.",
    ],
    imageSrc: playBackboneHome,
    imageAlt:
      "Screenshot of the withPod.ai interface showing the AI-powered learning platform",
    link: {
      url: "/lab/withpod-ai",
      text: "View Project",
    },
  },
  {
    id: "321bang",
    title: "321Bang",
    subtitle: "Personal Project",
    description: [
      "I created a real-time multiplayer reaction game as a hobby project using React and WebSockets with millisecond-precision timing. The platform has hosted over 50,000 competitive matches between players worldwide.",
    ],
    imageSrc: bangCover,
    imageAlt:
      "Screenshot of the 321Bang game interface showing the multiplayer reaction game in action",
    link: {
      url: "/lab/321bang",
      text: "View Project",
    },
  },
];
