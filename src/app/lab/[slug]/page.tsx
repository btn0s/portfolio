import { Metadata } from "next";

type Params = {
  slug: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { frontmatter } = await import(`@/content/lab/${slug}.mdx`);

  const metadata: Metadata = {
    title: frontmatter.title,
    description: frontmatter.description,
  };

  return metadata;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  const { default: Post } = await import(`@/content/lab/${slug}.mdx`);

  return <Post />;
}
