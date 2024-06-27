import { getUserChats } from "@/server/actions/chat";
import Header from "@/components/Header";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import PDFUploadDropzone from "./_components/PDFUploadDropzone";

export default async function ChatPage() {
  const session = await getServerAuthSession();

  // console.log("session from page ===> ", session);

  if (!session) return;

  const { data: userChats, error } = await getUserChats(session.user.id);

  if (error) console.error(error);

  return (
    <div className="w-full">
      <Header />
      <main className="container mx-auto max-w-6xl">
        <PDFUploadDropzone session={session} />
        <p className="text-center">Upload a PDF to start a new chat</p>
        <h4 className="mt-8 text-3xl font-bold">Your Chats</h4>

        {error && (
          <h2 className="py-4 text-center text-xl font-bold text-destructive">
            An error occurred while fetching your chats.
          </h2>
        )}

        {!error && userChats && userChats.length === 0 && (
          <h2 className="py-4 text-center text-xl font-bold text-white">
            You have no chats yet.
          </h2>
        )}

        <div className="my-6 flex flex-col gap-1">
          {userChats &&
            userChats.length > 0 &&
            userChats.map((chat) => (
              <Link
                href={`/chat/${chat.id}`}
                key={chat.id}
                className="truncate rounded-lg px-2 py-2 hover:bg-gray-600/50"
              >
                <p>{chat.title}</p>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
