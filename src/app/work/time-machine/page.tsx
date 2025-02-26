import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import PageContent from "./page-content";

// Import images
import coverImage from "@/assets/images/work/time-machine/cover.png";

export const metadata: Metadata = {
  title: createMetaTitle("TimeMachine"),
  description:
    "A bridge system that enabled seamless modernization at scale—delivering new features without breaking legacy infrastructure.",
  openGraph: {
    title: createMetaTitle("TimeMachine"),
    description:
      "A bridge system that enabled seamless modernization at scale—delivering new features without breaking legacy infrastructure.",
    images: [{ url: coverImage.src }],
  },
};

export default function TimeMachinePage() {
  return <PageContent />;
}
