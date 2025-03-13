"use client";

import { ImageGrid } from "@/components/image-grid";
import { Lightbox } from "@/components/ui/lightbox";
import { Separator } from "@/components/ui/separator";
import { TextHighlight } from "@/components/ui/text-highlight";
import { TRANSITION_SECTION, VARIANTS_SECTION } from "@/config/variants";
import { motion } from "motion/react";

import appCloseup from "@/assets/images/work/games-db-figma-plugin/app-closeup.png";
// Import images
import coverImage from "@/assets/images/work/games-db-figma-plugin/cover.png";
import feedbackImage from "@/assets/images/work/games-db-figma-plugin/feedback.png";
import pluginCloseup from "@/assets/images/work/games-db-figma-plugin/plugin-closeup.png";

export default function GamesDBFigmaPluginPage() {
  return (
    <>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 max-w-xl py-10"
      >
        <h1 className="text-xl font-medium mb-4">
          I built a Figma plugin that reduced asset management time by 80%
        </h1>

        <div className="w-full rounded-lg mb-6 overflow-hidden">
          <Lightbox
            src={coverImage}
            alt="Screenshot of the Games DB Figma Plugin"
          />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <h2>Overview</h2>

          <p>
            At Backbone, a company creating
            <TextHighlight>premium gaming experiences</TextHighlight>, designers
            were spending hours manually searching for and importing game assets
            into their designs.
          </p>

          <p className="mb-8">
            I built a custom Figma plugin that
            <TextHighlight>directly integrated</TextHighlight> our Games
            Database with their design workflow, eliminating repetitive tasks
            and keeping assets
            <TextHighlight>consistent with production</TextHighlight>.
          </p>

          <div className="mb-3 gap-2 text-xs flex flex-col">
            <strong>My Role</strong>
            <span>Project Lead, Design Engineer</span>
          </div>

          <div className="mb-3 gap-2 text-xs flex flex-col">
            <strong>Impact</strong>
            <span>
              80% reduction in asset management time, 5+ hours saved weekly per
              designer
            </span>
          </div>

          <div className="mb-3 gap-2 text-xs flex flex-col">
            <strong>Technologies</strong>
            <span>React, TypeScript, Figma Plugin API, Algolia</span>
          </div>

          <Separator className="my-8" />

          <h2>The Challenge</h2>
          <p>
            Backbone's design team faced a significant workflow bottleneck: they
            needed to work with
            <TextHighlight>thousands of game assets</TextHighlight> and metadata
            to create gaming experiences, but had
            <TextHighlight>no efficient way</TextHighlight> to access these
            resources within Figma.
          </p>

          <p>Designers were forced to:</p>
          <ul>
            <li>Manually search for assets across multiple sources</li>
            <li>Download and import each asset individually</li>
            <li>Ensure they were using the most current versions</li>
            <li>Repeat this process multiple times daily</li>
          </ul>

          <p>
            This process consumed up to
            <TextHighlight>25% of their productive time</TextHighlight> and
            created inconsistencies between designs and the final product.
          </p>

          <h2>The Solution</h2>

          <p>
            After identifying this pain point during a company offsite, I
            proposed and built a custom Figma plugin that would connect directly
            to our Games Database.
          </p>

          <h3>Key Features</h3>
          <ul>
            <li>
              <strong>Direct Database Integration:</strong>
              <TextHighlight>Live connection</TextHighlight> to the same data
              source used in production
            </li>
            <li>
              <strong>Instant Search:</strong>
              <TextHighlight>Algolia-powered</TextHighlight> search for
              immediate asset discovery
            </li>
            <li>
              <strong>One-Click Import:</strong>
              <TextHighlight>Automatic insertion</TextHighlight> of assets and
              metadata into Figma designs
            </li>
            <li>
              <strong>Consistent Styling:</strong>
              <TextHighlight>Matching the Backbone app's</TextHighlight>
              design language for visual continuity
            </li>
          </ul>

          <h3>Design Approach</h3>
          <p>
            I designed the plugin to
            <TextHighlight>
              mirror Backbone's existing UI patterns
            </TextHighlight>
            , creating a seamless extension of our product ecosystem rather than
            a separate tool.
          </p>

          <ImageGrid
            images={[
              { src: appCloseup, alt: "Screenshot of the Backbone app" },
              { src: pluginCloseup, alt: "Screenshot of the Figma plugin" },
            ]}
            className="mb-4"
          />

          <p>
            This visual consistency served two purposes: it made the plugin
            <TextHighlight> immediately familiar</TextHighlight> to designers
            and allowed them to <TextHighlight>preview</TextHighlight> how
            assets would appear in the final product.
          </p>

          <h3>Technical Implementation</h3>
          <p>
            I built the plugin using React and TypeScript, leveraging Figma's
            Plugin API to manipulate the canvas. The architecture included:
          </p>

          <ul>
            <li>A React frontend for the plugin UI</li>
            <li>TypeScript for type safety and developer experience</li>
            <li>Figma Plugin API for canvas manipulation</li>
            <li>Algolia for fast, typo-tolerant search functionality</li>
            <li>Direct connection to our Games Database API</li>
          </ul>

          <h2>Results</h2>

          <p>The plugin transformed the design team's workflow:</p>

          <ul>
            <li>
              <strong>80% reduction</strong> in time spent on
              <TextHighlight>asset management</TextHighlight>
            </li>
            <li>
              <strong>5+ hours saved weekly</strong> per
              <TextHighlight>designer</TextHighlight>
            </li>
            <li>
              <strong>100% adoption rate</strong> across the
              <TextHighlight>design team</TextHighlight>
            </li>
            <li>
              <strong>Improved design consistency</strong> with the
              <TextHighlight>production app</TextHighlight>
            </li>
          </ul>

          <p>
            The plugin quickly became an essential part of the design team's
            toolkit, with enthusiastic feedback:
          </p>

          <div className="my-4 rounded-lg overflow-hidden">
            <Lightbox src={feedbackImage} alt="Feedback from the design team" />
          </div>

          <h2>Continuous Improvement</h2>
          <p>
            Since launch, I've maintained an active development cycle based on
            user feedback. Recent and planned improvements include:
          </p>

          <ul>
            <li>Batch import functionality for multiple assets</li>
            <li>Custom layout templates for different design contexts</li>
            <li>Asset version history and change tracking</li>
            <li>Team favorites and recently used assets</li>
          </ul>

          <h2>Key Takeaways</h2>
          <p>
            This project demonstrated how targeted developer tools can
            <TextHighlight>dramatically improve design workflows</TextHighlight>
            . By bridging the gap between our data and the design environment,
            we eliminated friction and enabled designers to focus on
            <TextHighlight>creative work</TextHighlight> rather than asset
            management.
          </p>

          <p>
            The success of this plugin highlights the value of
            <TextHighlight>cross-functional collaboration</TextHighlight> and
            the impact of solving specific, well-defined problems with
            purpose-built tools.
          </p>
        </div>
      </motion.section>
    </>
  );
}
