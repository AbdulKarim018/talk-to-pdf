"use client";

import { useEffect } from "react";
import BackButton from "./BackButton";
import { checkPDFStatus } from "@/server/actions/chat";

type Props = {
  pdfId: string;
};

export function PDFProcessingComponent({ pdfId }: Props) {
  useEffect(() => {
    const tm = setInterval(async () => {
      await checkPDFStatus(pdfId);
    }, 2500);

    return () => clearInterval(tm);
  });

  return (
    <main className="container mx-auto max-w-6xl">
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-center text-3xl">Processing PDF...</h1>
        <p className="mt-4 text-center text-white/60">
          Your PDF is uploaded. It is now being processed. You will be able to
          chat with the PDF once it is ready.
        </p>

        <BackButton />
      </div>
    </main>
  );
}
