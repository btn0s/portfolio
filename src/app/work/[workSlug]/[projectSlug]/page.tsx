import { Metadata } from "next";
import { redirect } from "next/navigation";
import * as fs from "node:fs";

type Params = {
  workSlug: string;
  projectSlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { workSlug, projectSlug } = await params;

  const { frontmatter: projectFrontmatter } = await import(
    `@/content/work/${workSlug}/${projectSlug}.mdx`
  );

  const metadata: Metadata = {
    title: `${projectFrontmatter.title}`,
    description: projectFrontmatter.description,
  };

  return metadata;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { workSlug, projectSlug } = await params;
  const { default: Post } = await import(
    `@/content/work/${workSlug}/${projectSlug}.mdx`
  );

  return <Post />;
}
