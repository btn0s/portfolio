import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function createMetaTitle(title: string) {
  return `${title} ✦ bt norris`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
