import createMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import rehypePrettyCode from "rehype-pretty-code";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

/** @type {import('rehype-pretty-code').Options} */
const options = {
  keepBackground: false,
  theme: "github-dark",
};

/** @type {import('@next/mdx').default} */
const withMDX = createMDX({
  options: {
    jsx: true,
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    rehypePlugins: [[rehypePrettyCode, options]],
  },
});

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
