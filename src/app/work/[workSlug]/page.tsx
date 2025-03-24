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
  const { default: imageImport } = frontmatter.imagePath
    ? await import(`@/assets/images/${frontmatter.imagePath}`)
    : await import(`@/assets/images/placeholder.png`);

  const metadata: Metadata = {
    title: `${frontmatter.title} ✦ bt norris`,
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
  const { workSlug } = await params;

  try {
    const { default: Post, frontmatter } = await import(
      `@/content/work/${workSlug}/_main.mdx`
    );

    if (frontmatter.published === false) {
      return notFound();
    }

    return <Post />;
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
