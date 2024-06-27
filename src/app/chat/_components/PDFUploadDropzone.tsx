"use client";

import { getUserEligibleUploadEndpoint, UploadDropzone } from "@/lib/utils";
import { type Session } from "next-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  session: Session;
};

export default function PDFUploadDropzone({ session }: Props) {
  const router = useRouter();

  return (
    <UploadDropzone
      className="mx-auto my-4 w-[80vw] border border-white/60 lg:w-[60vw]"
      endpoint={getUserEligibleUploadEndpoint(session.user)}
      onClientUploadComplete={(res) => {
        // Do something with the response
        router.push(`/chat/${res[0]?.serverData.chatId}`);
        console.log("Files: ", res);
        toast.success("Upload complete!");
      }}
      onUploadError={(err) => {
        // console.log(err.toJSON());
        if (err.code === "BAD_REQUEST") {
          if (err.message.includes("FileSizeMismatch")) {
            toast.error(
              "Please upload a file within the given size limit or upgrade your plan to increase the limit.",
            );
          }
        }
      }}
    />
  );
}
