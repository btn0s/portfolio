import FlowHome from "@/components/flow-home";
import Home from "@/components/home";
import { getFrontmatter } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";

const ENABLE_FLOW = process.env.NODE_ENV === "development";

const FEATURED_WORK_SLUGS = [
  "/work/backbone/",
  "/work/backbone/games-db-figma-plugin",
  "/work/amex",
  "/work/amex/time-machine",
];

const FEATURED_LAB_SLUGS = [
  "/lab/strella",
  "/lab/echelon",
  "/lab/game-dev-prototypes",
];

function createInitialFlowState(featuredWork: any[], featuredLab: any[]) {
  const introNode = {
    id: "intro-text",
    type: "simpleContentNode",
    position: { x: 50, y: 50 },
    data: {
      textContent:
        "I'm a designer and programmer interested in games, tools, artificial intelligence, and driven by the joy of discovery.",
    },
  };

  const workNodes = featuredWork.map((item, index) => ({
    id: `work-${item.slug}`,
    type: "workCardNode",
    position: { x: 400 + index * 200, y: 100 },
    data: { ...item },
  }));

  const labNodes = featuredLab.map((item, index) => ({
    id: `lab-${item.slug}`,
    type: "workCardNode",
    position: { x: 400 + index * 200, y: 400 },
    data: { ...item },
  }));

  return {
    nodes: [introNode, ...workNodes, ...labNodes],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}

export default async function Page() {
  const featuredWork = await Promise.all(
    FEATURED_WORK_SLUGS.map(async (slug) => {
      return await getFrontmatter(slug);
    })
  );

  const featuredLab = await Promise.all(
    FEATURED_LAB_SLUGS.map(async (slug) => {
      return await getFrontmatter(slug);
    })
  );

  let flowState;

  if (ENABLE_FLOW) {
    try {
      // Try to read the saved flow state
      const rawState = await fs.readFile(
        path.join(process.cwd(), "flow-state.json"),
        "utf8"
      );
      flowState = JSON.parse(rawState);

      // Create a map of all frontmatter by slug for quick lookup
      const frontmatterMap = [...featuredWork, ...featuredLab].reduce(
        (acc, item) => {
          acc[item.slug] = item;
          return acc;
        },
        {} as Record<string, any>
      );

      // Update each node with latest frontmatter data
      flowState.nodes = flowState.nodes.map((node: any) => {
        // Extract slug from node ID (e.g., "work-/work/backbone/" -> "/work/backbone/")
        const slug = node.id.split("-").slice(1).join("-");
        const latestData = frontmatterMap[slug];

        if (latestData) {
          return {
            ...node,
            data: {
              ...node.data,
              ...latestData,
            },
          };
        }
        return node;
      });
    } catch (error) {
      console.log("No flow state found, creating initial state");
      flowState = createInitialFlowState(featuredWork, featuredLab);
    }
  }

  return ENABLE_FLOW ? (
    <FlowHome state={flowState} />
  ) : (
    <Home featuredWork={featuredWork} featuredLab={featuredLab} />
  );
}
