import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import WorkList from "@/components/work-list";
import FadeLoader from "@/components/fade-loader";

export const metadata: Metadata = {
  title: createMetaTitle("Lab • bt norris, design engineer"),
  description: "Where ideas take shape and possibilities unfold",
};

const LAB_WORK_LIST_SLUGS = [
  "/lab/strella",
  // "/lab/pod",
  // "/lab/sketchbook",
  "/lab/game-dev-prototypes",
  "/lab/echelon",
  // "/lab/head-2-head"
];

export default async function Layout() {
  return (
    <FadeLoader>
      <div className="pb-24">
        <h1 className="text-xl font-semibold md:text-2xl md:font-bold mb-1">
          The Lab
        </h1>
        <p className="text-muted-foreground">
          A collection of experiments, notes, dreams, and prototypes.
        </p>
      </div>
      <WorkList slugs={LAB_WORK_LIST_SLUGS} />
    </FadeLoader>
  );
}
