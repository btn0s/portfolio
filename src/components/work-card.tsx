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
    <Link href={slug} className="flex gap-4 flex-col not-prose w-full" prefetch>
      <Image
        src={imageSrc}
        alt={title}
        width={416}
        height={234}
        className="rounded-sm shrink-0 bg-muted flex text-muted-foreground border w-full"
      />
      <div className="flex flex-col items-start gap-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-[90%]">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default WorkCard;
