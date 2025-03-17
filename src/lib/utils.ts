import { clsx, type ClassValue } from "clsx";
import * as fs from "node:fs";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parse a work or project slug to get its frontmatter data
 */
export async function getWorkFrontmatter(slug: string) {
  try {
    // Remove leading "/work/" if present and trailing slash
    const cleanPath = slug.replace(/^\/work\//, "").replace(/\/$/, "");

    // Split into work and project segments
    const segments = cleanPath.split("/");
    const workSlug = segments[0];
    const projectSlug = segments[1]; // Will be undefined for "/work/<workSlug>" format

    if (!workSlug) {
      throw new Error("Invalid slug format");
    }

    // Import the MDX file and get its frontmatter
    let frontmatter;
    if (projectSlug) {
      // Format: /work/<workSlug>/<projectSlug>
      const { frontmatter: projectFrontmatter } = await import(
        `@/content/work/${workSlug}/${projectSlug}.mdx`
      );
      frontmatter = projectFrontmatter;
    } else {
      // Format: /work/<workSlug>
      const { frontmatter: workFrontmatter } = await import(
        `@/content/work/${workSlug}/_main.mdx`
      );
      frontmatter = workFrontmatter;
    }

    // Handle image path
    const imageImport = frontmatter.imagePath
      ? await import(`@/assets/images/${frontmatter.imagePath}`)
      : await import(`@/assets/images/placeholder.png`);

    console.log(imageImport);

    return {
      ...frontmatter,
      imagePath: JSON.stringify(imageImport),
      slug,
    };
  } catch (error) {
    console.error(`Error reading work data for ${slug}:`, error);
    return {
      imagePath: JSON.stringify("/placeholder.jpg"),
      title: slug.replace(/^\/work\//, "").replace(/\/.*$/, ""),
      description: "Content unavailable",
      slug,
    };
  }
}
