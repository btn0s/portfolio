"use client";

import { Button } from "@/components/ui/button";
import { TRANSITION_HEADER, VARIANTS_HEADER } from "@/lib/variants";
import Link from "next/link";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { motion } from "motion/react";
import RemoveBaseLayout from "@/components/remove-base-layout";
import { ArrowLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
import { cn } from "@/lib/utils";
export const ExperimentHeader = () => {
  const pathname = usePathname();
  return (
    <>
      <RemoveBaseLayout />
      <div className="fixed top-0 inset-x-0 p-4 flex justify-between items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/lab"
            className="text-xs font-mono flex items-center gap-2 text-muted-foreground"
          >
            <ArrowLeftIcon className="size-3" />
            lab
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="text-xs font-mono"
        >
          {pathname}
        </Button>
      </div>
    </>
  );
};

const HEADER_LINKS = ["/work", "/lab", "/pov"];

const Header = () => {
  const pathname = usePathname();
  return (
    <motion.header
      id="header"
      className="px-6 pt-6 flex justify-between max-w-content items-center mx-auto w-full"
      variants={VARIANTS_HEADER}
      transition={TRANSITION_HEADER}
      initial="hidden"
      animate="visible"
    >
      <Link href="/" className="font-medium leading-none">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="bt norris" width={18} />
          <div className="flex flex-col gap-0 justify-center text-sm">
            <TextEffect as="span" preset="blur" per="char">
              bt norris
            </TextEffect>
            <TextEffect
              as="p"
              preset="fade"
              per="char"
              className="text-muted-foreground leading-none font-normal"
              delay={0.5}
            >
              design engineer
            </TextEffect>
          </div>
        </div>
      </Link>
      <div className="flex gap-2 items-center">
        {HEADER_LINKS.map((link) => (
          <Button variant="ghost" size="sm" asChild key={link}>
            <Link
              href={link}
              className={cn("text-muted-foreground text-xs", {
                "text-primary bg-primary/10": pathname === link,
              })}
            >
              {link}
            </Link>
          </Button>
        ))}
      </div>
    </motion.header>
  );
};

export default Header;
