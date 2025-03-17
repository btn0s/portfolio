import Home from "@/components/home";
import { getWorkFrontmatter } from "@/lib/utils";

const FEATURED_WORK_SLUGS = [
  "/work/backbone/games-db-figma-plugin",
  "/work/amex/time-machine",
  "/lab/echelon",
];

export default async function Page() {
  const featuredWork = await Promise.all(
    FEATURED_WORK_SLUGS.map(async (slug) => {
      return await getWorkFrontmatter(slug);
    })
  );

  return <Home featuredWork={featuredWork} />;
}
