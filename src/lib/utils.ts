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
    // Ensure slug starts with a slash for consistent processing
    const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;

    // Extract the first segment from the path
    const pathSegments = normalizedSlug.split("/").filter(Boolean);
    const contentType = pathSegments[0];

    // Remove leading path prefix and trailing slash
    const cleanPath = normalizedSlug
      .replace(new RegExp(`^\\/${contentType}\\/`), "")
      .replace(/\/$/, "");

    // Split into main and sub segments
    const segments = cleanPath.split("/");
    const mainSlug = segments[0];
    const subSlug = segments[1]; // Will be undefined for "/<contentType>/<mainSlug>" format

    if (!mainSlug) {
      throw new Error("Invalid slug format");
    }

    // Import the MDX file and get its frontmatter
    let frontmatter;

    if (contentType === "lab") {
      // Lab content structure: /lab/<filename>.mdx
      const { frontmatter: labFrontmatter } = await import(
        `@/content/lab/${mainSlug}.mdx`
      );
      frontmatter = labFrontmatter;
    } else if (subSlug) {
      // Work content structure: /work/<workSlug>/<projectSlug>.mdx
      const { frontmatter: subFrontmatter } = await import(
        `@/content/${contentType}/${mainSlug}/${subSlug}.mdx`
      );
      frontmatter = subFrontmatter;
    } else {
      // Work content structure: /work/<workSlug>/_main.mdx
      const { frontmatter: mainFrontmatter } = await import(
        `@/content/${contentType}/${mainSlug}/_main.mdx`
      );
      frontmatter = mainFrontmatter;
    }

    // Handle image path
    const imageImport = frontmatter.imagePath
      ? await import(`@/assets/images/${frontmatter.imagePath}`)
      : await import(`@/assets/images/placeholder.png`);

    console.log(imageImport);

    return {
      ...frontmatter,
      imagePath: JSON.stringify(imageImport),
      slug: normalizedSlug,
    };
  } catch (error) {
    console.error(`Error reading content data for ${slug}:`, error);

    // Ensure slug starts with a slash for consistent processing
    const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;

    // Extract content type from the path for the error message
    const pathSegments = normalizedSlug.split("/").filter(Boolean);
    const contentType = pathSegments[0];

    return {
      imagePath: JSON.stringify("/placeholder.jpg"),
      title: normalizedSlug
        .replace(new RegExp(`^\\/${contentType}\\/`), "")
        .replace(/\/.*$/, ""),
      description: "Content unavailable",
      slug: normalizedSlug,
    };
  }
}
