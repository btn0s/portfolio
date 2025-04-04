import ProseLayout from "@/components/prose-layout";
import { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import furtherImage from "@/assets/images/pov/further.png";
import FadeLoader from "@/components/fade-loader";

const TITLE = "To Help Others Go Further";
const DESCRIPTION =
  "The legacy I want to leave and the future I want to build.";

export const metadata: Metadata = {
  title: createMetaTitle(TITLE),
  description: DESCRIPTION,
  openGraph: {
    images: [
      {
        url: furtherImage.src,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
          The legacy I want to leave and the future I want to build.
        </p>
      </div>
      <ProseLayout>
        <Post />
      </ProseLayout>
    </FadeLoader>
  );
}
