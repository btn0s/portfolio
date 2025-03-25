import FadeLoader from "@/components/fade-loader";

const ProseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <FadeLoader className="prose dark:prose-invert prose-img:my-0 prose-sm md:prose-base prose-muted-foreground max-w-none prose-h1:text-xl prose-h1:md:text-3xl prose-strong:font-medium prose-h1:font-medium prose-h2:font-medium prose-h3:font-medium prose-h4:font-medium prose-h5:font-medium prose-h6:font-medium prose-blockquote:not-italic">
      {children}
    </FadeLoader>
  );
};

export default ProseLayout;
