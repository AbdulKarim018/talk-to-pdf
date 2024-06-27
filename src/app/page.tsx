import ShimmerButton from "@/components/magicui/shimmer-button";
import { getServerAuthSession } from "@/server/auth";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function HomePage() {
  const session = await getServerAuthSession();

  if (session) return redirect("/chat");

  return (
    <div className="relative w-full">
      <div className="relative isolate z-0 h-screen bg-gradient-to-r from-emerald-100 to-cyan-100 px-6 pt-14 lg:px-8">
        <div className="relative mx-auto max-w-2xl py-24">
          <div className="absolute inset-x-0 -top-[4rem] -z-10 transform-gpu overflow-hidden blur-3xl md:-top-[10rem]"></div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Chat with any PDF
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Join millions of students, researchers and professionals to
              instantly answer questions and understand research with AI
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-2">
              <Link href={encodeURI("/api/auth/signin?callbackUrl=/chat")}>
                <ShimmerButton
                  shimmerSize="0.15em"
                  className="px-8 py-4 shadow-2xl"
                >
                  <span className="flex items-center gap-2 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white  dark:from-white dark:to-slate-900/10 lg:text-lg">
                    Signin and Get Started <LogInIcon className="size-4" />
                  </span>
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
