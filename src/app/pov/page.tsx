import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import furtherImage from "@/assets/images/pov/further.png";

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
    <ProseLayout>
      <Post />
    </ProseLayout>
  );
}
