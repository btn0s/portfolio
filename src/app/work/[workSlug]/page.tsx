import { Metadata } from "next";

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

  const { default: Post } = await import(
    `@/content/work/${workSlug}/_main.mdx`
  );

  return <Post />;
}
