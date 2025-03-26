"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { VARIANTS_SECTION, TRANSITION_SECTION } from "@/lib/variants";
import { motion } from "motion/react";
import WorkCard, { WorkCardProps } from "@/components/work-card";
import Link from "next/link";

export default function Home({
  featuredWork,
}: {
  featuredWork: WorkCardProps[];
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
          exploring games, tools, artificial intelligence, and{" "}
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
          prototypes, and share{" "}
          <Link
            href="/lab"
            className="font-medium text-foreground hover:underline"
          >
            experiments in progress
          </Link>
          outside of my sketchbook.
        </p>
      </motion.section>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <FlickeringGrid className={"w-full mb-12"} height={64} color={"#fff"} />
      </motion.section>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="grid md:grid-cols-2 gap-8 md:gap-4 md:gap-y-12"
      >
        {featuredWork.map((work) => (
          <WorkCard key={work.slug} {...work} />
        ))}
      </motion.section>
    </div>
  );
}
