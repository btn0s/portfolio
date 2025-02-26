"use client";

import { TextEffect } from "@/components/ui/text-effect";
import Link from "next/link";

export default function Header() {
  return (
    <header className="px-6 pt-6 flex justify-between items-center max-w-4xl mx-auto">
      <Link href="/" className="font-medium leading-none">
        <div className="flex items-center gap-2">
          <TextEffect as="span" preset="blur" per="char">
            ✦
          </TextEffect>
          <div className="flex flex-col gap-0 justify-center text-sm">
            <TextEffect as="span" preset="blur" per="char">
              bt norris
            </TextEffect>
            <TextEffect
              as="p"
              preset="fade"
              per="char"
              className="text-muted-foreground leading-none"
              delay={0.5}
            >
              design engineer
            </TextEffect>
          </div>
        </div>
      </Link>
    </header>
  );
}
