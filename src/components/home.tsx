"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { VARIANTS_SECTION, TRANSITION_SECTION } from "@/lib/variants";
import { motion } from "motion/react";
import WorkCard, { WorkCardProps } from "@/components/work-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export default function Home({
  featuredWork,
  featuredLab,
}: {
  featuredWork: WorkCardProps[];
  featuredLab: WorkCardProps[];
}) {
  return (
    <div className="flex flex-col gap-12">
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 max-w-xl text-muted-foreground mb-12"
      >
        <p>
          I'm a <span className="font-medium text-foreground">designer</span>{" "}
          and <span className="font-medium text-foreground">programmer</span>{" "}
          interested in games, tools, artificial intelligence, and{" "}
          <Link
            href="/pov"
            className="font-medium text-foreground hover:underline"
          >
            driven by the joy of discovery
          </Link>
          .
        </p>
        <p>
          I'm currently a{" "}
          <span className="font-medium text-foreground">
            senior design engineer
          </span>{" "}
          at{" "}
          <Link
            className="hover:underline hover:text-foreground"
            href="/work/backbone"
          >
            Backbone
          </Link>
          .
        </p>
        <p>
          This site is my digital workspace — I use it to explore ideas, test
          prototypes, and{" "}
          <Link
            href="/lab"
            className="font-medium text-foreground hover:underline"
          >
            share experiments
          </Link>{" "}
          outside of my sketchbook.
        </p>
      </motion.section>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <FlickeringGrid className={"w-full mb-6"} height={64} color={"#fff"} />
      </motion.section>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <div className="text-muted-foreground text-sm font-mono uppercase">
            Featured work
          </div>
          <Button
            variant={"link"}
            size={"sm"}
            className="text-muted-foreground text-sm relative group"
            asChild
          >
            <Link href="/work">
              View all
              <ArrowRight className="size-4 absolute left-full scale-95 group-hover:scale-100 -translate-x-5 group-hover:-translate-x-1 opacity-0 group-hover:opacity-500 transition-all" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-4 md:gap-y-12">
          {featuredWork.map((work) => (
            <WorkCard key={work.slug} {...work} />
          ))}
        </div>
      </motion.section>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4"
      >
        <div className="flex justify-between items-center">
          <div className="text-muted-foreground text-sm font-mono uppercase">
            Featured experiments
          </div>
          <Button
            variant={"link"}
            size={"sm"}
            className="text-muted-foreground text-sm relative group"
            asChild
          >
            <Link href="/lab">
              View all
              <ArrowRight className="size-4 absolute left-full scale-95 group-hover:scale-100 -translate-x-5 group-hover:-translate-x-1 opacity-0 group-hover:opacity-500 transition-all" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-4 md:gap-y-12">
          {featuredLab.map((lab) => (
            <WorkCard key={lab.slug} {...lab} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}
