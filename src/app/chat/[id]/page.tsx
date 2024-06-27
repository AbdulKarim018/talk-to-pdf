import Header from "@/components/Header";
import { getChat } from "@/server/actions/chat";
import { getServerAuthSession } from "@/server/auth";
import { notFound } from "next/navigation";
import BackButton from "./_components/BackButton";
import ChatComponent from "./_components/ChatComponent";
import { PDFProcessingComponent } from "./_components/PDFProcessingComponent";

type Props = {
  params: {
    id: string;
  };
};

export default async function ChatPage({ params: { id } }: Props) {
  const { data: chat, error } = await getChat(id);
  const session = await getServerAuthSession();

  if (!session) return;

  if (!error && !chat) return notFound();

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-3xl">Something Went Wrong :(</h1>
        <p className="mt-4 text-white/60">
          An error occurred while fetching the chat. Please try again later.
        </p>
        <BackButton />
      </div>
    );
  }

  if (chat && chat.PDF.status === "PROCESSING")
    return <PDFProcessingComponent pdfId={chat.PDF.id} />;

  if (chat && chat.PDF.status === "FAILED") {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-3xl">Something Went Wrong :(</h1>
        <p className="mt-4 text-white/60">
          Sorry, We couldn&apos;t process your PDF.
        </p>
        <BackButton />
      </div>
    );
  }

  if (!chat) return notFound();

  return (
    <>
      <Header />
      <main className="container mx-auto flex max-w-6xl flex-wrap items-center justify-center">
        <iframe src={chat.PDF.fileUrl} className="h-screen lg:w-1/2"></iframe>
        <ChatComponent className="h-screen lg:w-1/2" chat={chat} />
      </main>
    </>
  );
}
