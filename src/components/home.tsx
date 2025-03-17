"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";
import WorkList from "@/components/work-list";
import Link from "next/link";
import { VARIANTS_SECTION, TRANSITION_SECTION } from "@/lib/variants";
import { motion } from "motion/react";
import WorkCard, { WorkCardProps } from "@/components/work-card";

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
          interested in games, tools, artifical intelligence, and driven by{" "}
          <span className="font-medium text-foreground">
            the joy of discovery
          </span>
        </p>
        {/*<p>*/}
        {/*  I'm currently{" "}*/}
        {/*  <span className="font-medium text-foreground">*/}
        {/*    senior design engineer*/}
        {/*  </span>{" "}*/}
        {/*  at{" "}*/}
        {/*  <Link*/}
        {/*    className="underline hover:text-foreground font-medium"*/}
        {/*    href="/work/backbone"*/}
        {/*  >*/}
        {/*    Backbone*/}
        {/*  </Link>*/}
        {/*</p>*/}
        <p>
          This site is my digital workspace, I actively use it in my creative
          process to bring my ideas to life outside my{" "}
          <Link
            className="underline hover:text-foreground font-medium"
            href="/lab/sketchbook"
          >
            sketchbook
          </Link>
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
