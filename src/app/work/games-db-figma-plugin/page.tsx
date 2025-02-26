"use client";

import { ImageGrid } from "@/components/image-grid";
import { Separator } from "@/components/ui/separator";
import { Lightbox } from "@/components/ui/lightbox";
import { motion } from "motion/react";
import { TRANSITION_SECTION, VARIANTS_SECTION } from "@/config/variants";

// Import images
import coverImage from "@/assets/images/work/games-db-figma-plugin/cover.png";
import appCloseup from "@/assets/images/work/games-db-figma-plugin/app-closeup.png";
import pluginCloseup from "@/assets/images/work/games-db-figma-plugin/plugin-closeup.png";
import feedbackImage from "@/assets/images/work/games-db-figma-plugin/feedback.png";

export default function GamesDBFigmaPluginPage() {
  return (
    <>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 max-w-4xl py-10"
      >
        <h1 className="text-xl font-medium mb-4">
          I built a Figma plugin that reduced asset management time by 80%
        </h1>

        <div className="aspect-video w-full rounded-lg mb-6 overflow-hidden">
          <Lightbox
            src={coverImage}
            alt="Screenshot of the Games DB Figma Plugin"
          />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <h2>Overview</h2>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <strong>My Role:</strong>
            <span>Project Lead, Design Engineer</span>
          </div>

          <p>
            Backbone is all about creating mind-blowing gaming experiences. The
            gaming industry is a content-first industry, and the design team at
            Backbone has to work with a lot of game assets and metadata to bring
            these experiences to life.
          </p>

          <p>
            I worked with the designers and discovered that they were spending a
            lot of time and effort manually searching, downloading, and
            importing these assets. I developed a custom Figma plugin to
            integrate the assets we had in the Backbone Games DB directly into
            the design team's workflow.
          </p>

          <h3>Impact</h3>
          <p>
            This plugin has become a core part of the design team's workflow:
          </p>
          <ul>
            <li>
              <strong>Reduced time spent searching for assets by 80%</strong>{" "}
              since designers no longer have to search for assets online or
              import them manually.
            </li>
            <li>
              <strong>Saved designers over 5 hours per week</strong> on average,
              allowing them to focus on more creative work.
            </li>
            <li>
              <strong>Adopted by the entire design team</strong> and has become
              an essential tool for their daily work.
            </li>
          </ul>

          <Separator className="my-8" />

          <h2>Process</h2>

          <h3>Designers were wasting time finding game assets</h3>
          <p>
            At the first offsite I attended with the Backbone team, I met with
            some of the designers and learned about their workflow and the
            challenges they faced. One of the biggest pain points they mentioned
            was the time-consuming process of searching for game assets and
            metadata online and importing them into Figma.
          </p>

          <h3>The solution: a custom Figma plugin</h3>
          <p>
            After identifying the problem, I worked with the design team to
            establish a few goals for the project:
          </p>
          <ul>
            <li>
              Automate the process of importing game assets and metadata into
              Figma.
            </li>
            <li>
              Ensure designers are always working with the most up-to-date data
              (so that it matches what's in the app).
            </li>
            <li>
              Seamlessly integrate with the design team's existing workflow.
            </li>
          </ul>

          <p>
            With the goals established it was fairly obvious that the best
            solution was to build a custom Figma plugin that would connect the
            design team directly to the game assets they needed.
          </p>

          <h3>Keeping things delightful, contextual, and on-brand</h3>
          <p>
            It was important to me that the plugin be delightful to use, but
            also feel like a natural extension of the existing design language
            used in the Backbone app. I wanted the designers to be able to
            visualize how the assets would look in production, adding a layer of
            "function" to the "form" of the plugin and resulting in a more
            holistic design.
          </p>

          <ImageGrid
            images={[
              { src: appCloseup, alt: "Screenshot of the Backbone app" },
              { src: pluginCloseup, alt: "Screenshot of the Figma plugin" },
            ]}
            className="mb-4"
          />

          <h3>React, TypeScript, and Figma's plugin API</h3>
          <p>
            I chose this tech stack mainly because it allowed me to build the
            plugin quickly and efficiently. React and TypeScript are both tools
            I'm very comfortable with, and Figma's Plugin API made it easy to
            interact with the design tool to manage inserting images and text
            into the canvas.
          </p>

          <p>
            To ensure designers are always working with the most up-to-date
            data, I connected the plugin to the same data source used by the
            app: the Backbone Games DB. For the search functionality, I used
            Algolia's instant search to quickly find the game assets and
            metadata designers were looking for.
          </p>

          <h3>Future Improvements</h3>
          <p>
            Since launching the plugin, I've gotten a lot of great feedback from
            the design team.
          </p>

          <div className="my-4 rounded-lg overflow-hidden">
            <Lightbox src={feedbackImage} alt="Feedback from the design team" />
          </div>

          <p>
            Some of these items have been shipped since writing this post, and
            others are in the works. The backlog is always growing, and I'm
            excited to continue improving the plugin and making it an even more
            valuable tool for the design team.
          </p>

          <h2>Reflections</h2>
          <p>
            Building the Games DB Figma plugin was a great opportunity to work
            closely with the design team and help them solve a real problem they
            were facing. I'm proud of the impact it's had on their workflow and
            excited to continue improving it in the future.
          </p>
        </div>
      </motion.section>
    </>
  );
}
