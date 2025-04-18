import FlowHome from "@/components/flow-home";
import Home from "@/components/home";
import { getFrontmatter } from "@/lib/utils";

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

  return <FlowHome featuredWork={featuredWork} featuredLab={featuredLab} />;
}
