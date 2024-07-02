import { Loader2Icon } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2Icon className="size-12 animate-spin text-primary" />
    </div>
  );
}
