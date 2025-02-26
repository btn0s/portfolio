import type { Metadata } from "next";
import { createMetaTitle } from "@/lib/utils";
import PageContent from "./page-content";

export const metadata: Metadata = {
  title: createMetaTitle("I built a real-time multiplayer reaction game"),
  description:
    "A real-time multiplayer reaction game with server-authoritative architecture that tests players' reflexes with millisecond precision",
};

export default function BangPage() {
  return <PageContent />;
}
