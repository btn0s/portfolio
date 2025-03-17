import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import { Mermaid } from "mdx-mermaid/lib/Mermaid";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Image: (props) => <Image {...props} />,
  };
}
