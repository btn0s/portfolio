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
  const { default: imageImport } = projectFrontmatter.imagePath
    ? await import(`@/assets/images/${projectFrontmatter.imagePath}`)
    : await import(`@/assets/images/placeholder.png`);

  const metadata: Metadata = {
    title: `${projectFrontmatter.title} ✦ bt norris`,
    description: projectFrontmatter.description,
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
  const { workSlug, projectSlug } = await params;

  const { default: Post, frontmatter } = await import(
    `@/content/work/${workSlug}/${projectSlug}.mdx`
  );

  if (frontmatter.published === false) {
    return notFound();
  }

  return <Post />;
}
