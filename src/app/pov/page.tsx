import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import FadeLoader from "@/components/fade-loader";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export const metadata: Metadata = {
  title: createMetaTitle("My point of view"),
  description:
    "Building tools that empower, systems that scale, and a future that feels more human.",
};

export default async function Layout() {
  const { default: Post } = await import("./content.mdx");
  return (
    <ProseLayout>
      <Post />
    </ProseLayout>
  );
}
