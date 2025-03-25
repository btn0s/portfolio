import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";

export const metadata: Metadata = {
  title: createMetaTitle("Lab • bt norris, design engineer"),
  description: "Where ideas take shape and possibilities unfold",
};

export default async function Layout() {
  const { default: Post } = await import("./content.mdx");
  return (
    <ProseLayout>
      <Post />
    </ProseLayout>
  );
}
