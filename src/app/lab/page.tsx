import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import WorkList from "@/components/work-list";

export const metadata: Metadata = {
  title: createMetaTitle("Lab • bt norris, design engineer"),
  description: "Where ideas take shape and possibilities unfold",
};

export const LAB_WORK_LIST_SLUGS = [
  "/lab/strella",
  // "/lab/pod",
  // "/lab/sketchbook",
  "/lab/game-dev-prototypes",
  "/lab/echelon",
  // "/lab/head-2-head"
];

export default async function Layout() {
  return (
    <div>
      <div className="pb-24">
        <h1 className="text-2xl font-bold">The Lab</h1>
        <p className="text-muted-foreground">
          A collection of experiments, notes, and prototypes.
        </p>
      </div>
      <WorkList slugs={LAB_WORK_LIST_SLUGS} />
    </div>
  );
}
