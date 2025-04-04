import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import FadeLoader from "@/components/fade-loader";

const TITLE = "The Clarity Loop";
const DESCRIPTION =
  "A creative framework for building fast without losing direction";

export const metadata: Metadata = {
  title: createMetaTitle(TITLE),
  description: DESCRIPTION,
};

export default async function Layout() {
  const { default: Post } = await import("./content.mdx");
  return (
    <FadeLoader>
      <div className="pb-24">
        <h1 className="text-xl font-medium md:text-2xl md:font-bold mb-1">
          The Clarity Loop
        </h1>
        <p className="text-muted-foreground">
          A creative framework for building fast without losing direction
        </p>
      </div>
      <ProseLayout>
        <Post />
      </ProseLayout>
    </FadeLoader>
  );
}
