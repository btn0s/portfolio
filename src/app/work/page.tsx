import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import WorkList from "@/components/work-list";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: createMetaTitle("Work • bt norris, design engineer"),
  description: "Projects I've worked on professionally",
};

export const BACKBONE_WORK_LIST_SLUGS = [
  "/work/backbone",
  //   "/work/backbone/post-malone",
  "/work/backbone/games-db-figma-plugin",
];

export const AMEX_WORK_LIST_SLUGS = [
  //   "/work/amex",
  "/work/amex/time-machine",
];

export const OTHER_WORK_LIST_SLUGS = ["/work/consensys", "/work/hownd"];

const ALL_WORK_LIST_SLUGS = [
  BACKBONE_WORK_LIST_SLUGS,
  AMEX_WORK_LIST_SLUGS,
  // OTHER_WORK_LIST_SLUGS,
];

export default async function Layout() {
  return (
    <div>
      <div className="pb-24">
        <h1 className="text-2xl font-bold">Work</h1>
        <p className="text-muted-foreground mb-4">
          Projects I've worked on professionally
        </p>
        <Button
          variant={"outline"}
          size="sm"
          className="text-xs text-muted-foreground"
          asChild
        >
          <Link href="/resume">Download my resume</Link>
        </Button>
      </div>
      {ALL_WORK_LIST_SLUGS.map((slugs) => (
        <Fragment key={slugs.join("-")}>
          <WorkList slugs={slugs} />
          <Separator className={"my-6"} />
        </Fragment>
      ))}
    </div>
  );
}
