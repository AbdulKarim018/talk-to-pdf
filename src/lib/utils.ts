import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import type {
  OurFileRouter,
  OurFileRouterEndpoints,
} from "@/app/api/uploadthing/core";
import { type Session } from "next-auth";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import { env } from "@/env";

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

const isLemonSqueezyConnected = false;
export const connectLemonSqueezy = async () => {
  if (isLemonSqueezyConnected) return;

  lemonSqueezySetup({
    apiKey: env.LEMONSQUEEZY_API_KEY,
  });
};

export const verifyLemonSqueezyWebhookSignature = (
  rawBody: string,
  signature: string,
  secret: string,
): boolean => {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const receivedSignature = Buffer.from(signature, "utf8");

  // console.log("secret===> " + secret);
  // console.log("digest===> " + digest);
  // console.log("receivedSignature===> " + receivedSignature);

  return crypto.timingSafeEqual(digest, receivedSignature);
};
