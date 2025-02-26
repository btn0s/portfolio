"use client";

import FeaturedWorkCard from "@/components/featured-card";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import {
  TRANSITION_SECTION,
  VARIANTS_CONTAINER,
  VARIANTS_SECTION,
} from "@/config/variants";
import { FEATURED_WORK } from "@/content/featured-work";
import { DownloadCloud, Handshake, Speech } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 max-w-lg py-20 text-muted-foreground text-sm md:text-base"
      >
        <h3>
          I'm a self-taught{" "}
          <span className="font-medium text-foreground">designer</span> and{" "}
          <span className="font-medium text-foreground">programmer</span> with a
          passion for building products that are both useful and playful.
        </h3>
        <p className="text-balance">
          I'm currently{" "}
          <span className="font-medium text-foreground">
            Senior Design Engineer
          </span>{" "}
          at{" "}
          <Link
            href="/roles/backbone"
            className="underline font-medium text-foreground"
          >
            Backbone
          </Link>
          .
        </p>
        <p className="text-pretty mb-4">
          This site is my workspace, I actively use it in my creative process to
          bring ideas to life outside my{" "}
          <Link
            href="/sketchbook"
            className="underline font-medium text-foreground"
          >
            sketchbook
          </Link>
          .
        </p>
        <motion.div className="flex gap-2">
          <Button variant="secondary" asChild>
            <a href="https://cal.com/btnorris/30-min">Let's chat</a>
          </Button>
          <Button variant="link" asChild>
            <Link href="/resume" prefetch>
              /resume
            </Link>
          </Button>
        </motion.div>
      </motion.section>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 grou pb-24"
      >
        {FEATURED_WORK.map((work) => (
          <FeaturedWorkCard key={work.id} {...work} imageSrc={work.imageSrc} />
        ))}
      </motion.section>
    </>
  );
}
