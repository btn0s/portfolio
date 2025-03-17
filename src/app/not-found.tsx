import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <FlickeringGrid className={"w-full mb-12"} height={64} color={"#fff"} />
      <div className="flex flex-col text-center items-center">
        <h2 className={"text-2xl"}>404</h2>
        <p className={"mb-6 text-muted-foreground"}>Page not found</p>
        <Button variant="outline" size="sm" className="group">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
