import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import WorkList from "@/components/work-list";
import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FadeLoader from "@/components/fade-loader";

export const metadata: Metadata = {
  title: createMetaTitle("Work • bt norris, design engineer"),
  description: "Projects I've worked on professionally",
};

const BACKBONE_WORK_LIST_SLUGS = [
  "/work/backbone",
  "/work/backbone/games-db-figma-plugin",
  "/work/backbone/post-malone",
  "/work/backbone/ecommerce",
];

const AMEX_WORK_LIST_SLUGS = [
  //   "/work/amex",
  "/work/amex/time-machine",
];

const OTHER_WORK_LIST_SLUGS = [
  "/work/sobol",
  //  "/work/hownd"
];

const ALL_WORK_LIST_SLUGS = [
  BACKBONE_WORK_LIST_SLUGS,
  AMEX_WORK_LIST_SLUGS,
  OTHER_WORK_LIST_SLUGS,
];

export default async function Layout() {
  return (
    <FadeLoader>
      <div className="pb-24">
        <h1 className="text-xl font-semibold md:text-2xl md:font-bold mb-1">
          Work
        </h1>
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
    </FadeLoader>
  );
}
