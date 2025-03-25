import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createMetaTitle } from "@/lib/utils";
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
  const { default: imageImport } = frontmatter.imagePath
    ? await import(`@/assets/images/${frontmatter.imagePath}`)
    : await import(`@/assets/images/placeholder.png`);

  const metadata: Metadata = {
    title: createMetaTitle(frontmatter.title),
    description: frontmatter.description,
    openGraph: {
      images: imageImport.src,
    },
    twitter: {
      card: "summary_large_image",
      images: imageImport.src,
    },
  };

  return metadata;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  try {
    const { default: Post } = await import(`@/content/lab/${slug}.mdx`);
    return <Post />;
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
