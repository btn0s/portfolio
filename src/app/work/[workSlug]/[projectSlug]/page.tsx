import { Metadata } from "next";
import { notFound } from "next/navigation";

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
    title: `${projectFrontmatter.title} | bt norris, design engineer`,
    description: projectFrontmatter.description,
    openGraph: {
      images: [JSON.parse(projectFrontmatter.imagePath)],
    },
    twitter: {
      card: "summary_large_image",
      images: [JSON.parse(projectFrontmatter.imagePath)],
    },
  };

  return metadata;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { workSlug, projectSlug } = await params;

  const { default: Post, frontmatter } = await import(
    `@/content/work/${workSlug}/${projectSlug}.mdx`
  );

  if (frontmatter.published === false) {
    return notFound();
  }

  return <Post />;
}
