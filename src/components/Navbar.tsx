import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getServerAuthSession } from "@/server/auth";
import { DollarSignIcon, LogInIcon, LogOutIcon, User2Icon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  className?: string;
};

export default async function Navbar({ className }: Props) {
  const session = await getServerAuthSession();
  const name = session?.user.name ?? "~";
  return (
    <nav
      className={cn(
        "flex items-center justify-between border-b border-gray-200 px-2 py-4",
        className,
      )}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Talk2PDF</h1>
          {session && (
            <Link href={"/chat"} className="hover:underline">
              Chats
            </Link>
          )}
        </div>
        {session ? (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={session.user.image ?? ""} alt={name} />
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((word) => (word[0] ?? "").toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
                <DropdownMenuLabel>
                  {name} ({session.user.email})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <User2Icon className="mr-2 size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {/* <Link href="https://talk2pdf-dev.lemonsqueezy.com"> */}
                  <Link href="/plans">
                    <DollarSignIcon className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link href="/api/auth/signin">
            <Button asChild>
              <span>
                Sign in <LogInIcon className="ml-4 size-4" />
              </span>
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
