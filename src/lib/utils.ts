import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type {
  OurFileRouter,
  OurFileRouterEndpoints,
} from "@/app/api/uploadthing/core";
import { type Session } from "next-auth";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export function getUserEligibleUploadEndpoint(
  user: Session["user"],
): OurFileRouterEndpoints {
  if (user.role === "USER") {
    switch (user.plan) {
      case "FREE":
        return "freePDFUploader";
      case "PRO":
        return "proPDFUploader";
    }
  }

  if (user.role === "ADMIN") {
    return "proPDFUploader";
  }

  throw new Error("Invalid user role");
}
