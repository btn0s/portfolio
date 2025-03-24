import WorkList from "./work-list";
import { glob } from "glob";
import path from "path";

interface WorkListLoaderProps {
  contentPath: string; // e.g. "lab" or "work/backbone"
}

const WorkListLoader = async ({ contentPath }: WorkListLoaderProps) => {
  // Get all MDX files in the specified content path
  const files: string[] = await glob(`src/content/${contentPath}/**/*.mdx`);

  // Convert file paths to content slugs
  const slugs = files.map((file: string) => {
    // Remove src/content prefix and .mdx extension
    const relativePath = file.replace("src/content/", "").replace(".mdx", "");
    // Convert to slug format
    return `/${relativePath}`;
  });

  // Filter out _main.mdx files if they exist
  const filteredSlugs = slugs.filter(
    (slug: string) => !slug.endsWith("/_main")
  );

  return <WorkList slugs={filteredSlugs} />;
};

export default WorkListLoader;
