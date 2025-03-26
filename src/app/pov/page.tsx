import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import furtherImage from "@/assets/images/pov/further.png";
import FadeLoader from "@/components/fade-loader";

export const metadata: Metadata = {
  title: createMetaTitle("Point of view"),
  description:
    "Building tools that empower, systems that scale, and a future that feels more human.",
  openGraph: {
    images: [
      {
        url: furtherImage.src,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Point of view",
    description:
      "Building tools that empower, systems that scale, and a future that feels more human.",
    images: [furtherImage.src],
  },
};

export default async function Layout() {
  const { default: Post } = await import("./content.mdx");
  return (
    <FadeLoader>
      <div className="pb-24">
        <h1 className="text-xl font-medium md:text-2xl md:font-bold mb-1">
          To Help Others Go Further
        </h1>
        <p className="text-muted-foreground">
          Why I build for clarity, design for the future, and leave tools
          behind.
        </p>
      </div>
      <ProseLayout>
        <Post />
      </ProseLayout>
    </FadeLoader>
  );
}
