import { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = {
  workSlug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { workSlug } = await params;
  const { frontmatter } = await import(`@/content/work/${workSlug}/_main.mdx`);

  const metadata: Metadata = {
    title: `${frontmatter.title} | bt norris, design engineer`,
    description: frontmatter.description,
  };

  return metadata;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { workSlug } = await params;

  const { default: Post, frontmatter } = await import(
    `@/content/work/${workSlug}/_main.mdx`
  );

  if (frontmatter.published === false) {
    return notFound();
  }

  return <Post />;
}
