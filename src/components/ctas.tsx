import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export const GetInTouchCTA = ({ topic }: { topic: string }) => {
  return (
    <div className="mt-8 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-medium">Interested in {topic}?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        I'd love to chat about how I can help with your project.
      </p>
      <Button className="mt-4" asChild>
        <Link href="mailto:hello@example.com">
          <Mail className="mr-2 h-4 w-4" />
          Get in touch
        </Link>
      </Button>
    </div>
  );
};

export const ViewMoreProjectsCTA = () => {
  return (
    <div className="mt-8 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-medium">Want to see more projects?</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Check out my other work to see more examples of my skills and
        experience.
      </p>
      <Button className="mt-4" variant="outline" asChild>
        <Link href="/work">
          View more projects
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};
