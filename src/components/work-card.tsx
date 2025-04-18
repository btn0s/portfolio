import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export interface WorkCardProps {
  imagePath: string;
  title: string;
  description: string;
  slug: string;
}

const WorkCard = ({ imagePath, title, description, slug }: WorkCardProps) => {
  const imageSrc = JSON.parse(imagePath);
  return (
    <Link
      href={slug}
      className={cn(
        "flex gap-4 not-prose w-full max-w-content flex-col group active:scale-99"
      )}
      prefetch
    >
      <div className="rounded-sm shrink-0 bg-muted flex text-muted-foreground border w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          width={416}
          height={234}
          className={cn(
            "object-cover group-hover:scale-105 transition-all duration-300"
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div
          className={cn("flex flex-col items-start justify-start gap-1", {})}
        >
          <h3 className={cn("font-medium text-foreground text-sm")}>{title}</h3>
          <p className={cn("text-muted-foreground text-sm max-w-[90%]", {})}>
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default WorkCard;
