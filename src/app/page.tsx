import Home from "@/components/home";
import { getFrontmatter } from "@/lib/utils";

const FEATURED_WORK_SLUGS = [
  "/work/backbone/",
  "/work/backbone/games-db-figma-plugin",
  "/work/amex/time-machine",
  "/lab/echelon",
  "/lab/game-dev-prototypes",
  "/lab/strella",
];

export default async function Page() {
  const featuredWork = await Promise.all(
    FEATURED_WORK_SLUGS.map(async (slug) => {
      return await getFrontmatter(slug);
    })
  );

  return <Home featuredWork={featuredWork} />;
}
