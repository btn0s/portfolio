import WorkCard from "./work-card";
import { getWorkFrontmatter } from "@/lib/utils";

// Mark as a server component
// This component must be a server component because it uses dynamic imports and async/await
// which aren't compatible with client components without special handling
interface WorkListProps {
  slugs: string[];
}

const WorkList = async ({ slugs }: WorkListProps) => {
  // Get metadata for all slugs
  const workItems = await Promise.all(slugs.map(getWorkFrontmatter));

  return (
    <div className="flex flex-col gap-4">
      {workItems.map((work, index) => (
        <WorkCard
          key={`${work.slug}-${index}`}
          imagePath={work.imagePath}
          title={work.title}
          description={work.description}
          slug={work.slug}
        />
      ))}
    </div>
  );
};

export default WorkList;
