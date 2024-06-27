"use client";

import { Button } from "@/components/ui/button";
import { MoveLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function BackButton() {
  const router = useRouter();
  return (
    <Button className="my-6" onClick={() => router.back()}>
      <MoveLeftIcon className="mr-2 size-4" />
      Go Back
    </Button>
  );
}
