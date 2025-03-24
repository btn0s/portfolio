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
  horizontal?: boolean;
  showButton?: boolean;
  showBorder?: boolean;
}

const WorkCard = ({
  imagePath,
  title,
  description,
  slug,
  horizontal,
  showButton,
  showBorder,
}: WorkCardProps) => {
  const imageSrc = JSON.parse(imagePath);
  return (
    <Link
      href={slug}
      className={cn("flex gap-4 not-prose w-full max-w-content", {
        "flex-row": horizontal,
        "flex-col": !horizontal,
        "border p-4 shadow-sm rounded-lg": showBorder,
      })}
      prefetch
    >
      <Image
        src={imageSrc}
        alt={title}
        width={416}
        height={234}
        className={cn(
          "rounded-sm shrink-0 bg-muted flex text-muted-foreground border",
          {
            "w-full": !horizontal,
          }
        )}
      />
      <div className={cn("flex flex-col items-start justify-start gap-1", {})}>
        <h3 className={cn("font-medium")}>{title}</h3>
        <p
          className={cn("text-muted-foreground text-sm max-w-[90%]", {
            "mb-4": showButton,
            "hidden md:block": horizontal,
          })}
        >
          {description}
        </p>
        {showButton && (
          <Button variant="outline" size="sm" className="group">
            Learn more
            <ArrowRightIcon className="size-4  group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        )}
      </div>
    </Link>
  );
};

export default WorkCard;
