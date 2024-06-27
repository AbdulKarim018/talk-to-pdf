"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { addMessageToChat } from "@/server/actions/chat";
import { type Prisma } from "@prisma/client";
import { useChat } from "ai/react";
import { SendHorizonalIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

type Props = {
  className?: string;
  chat: Prisma.ChatGetPayload<{
    include: {
      messages: true;
      PDF: true;
      author: true;
    };
  }>;
};

const ChatComponent = ({ className, chat }: Props) => {
  const { messages, isLoading, input, handleInputChange, handleSubmit, error } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        ...chat.messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        })),
      ],
      body: {
        chatId: chat.id,
      },
      onFinish: async (message) => {
        await addMessageToChat(chat.id, message);
      },
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cn("my-4 bg-slate-900 px-2", className)}>
      <div className="flex h-full w-full flex-col">
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          {messages.map((message) => {
            const isUserMessage = message.role === "user";
            const isSystemMessage = message.role === "system";
            if (isSystemMessage) return;
            return (
              <div
                key={message.id}
                className={`flex rounded-lg p-4 ${isUserMessage ? "bg-white/30" : ""}`}
              >
                {isUserMessage ? (
                  <p>{message.content}</p>
                ) : (
                  <Markdown
                    className="flex flex-col overflow-x-auto"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-(\w+)/.exec(className || "");

                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={dracula}
                            PreTag="div"
                            language={match[1]}
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </Markdown>
                )}
              </div>
            );
          })}
          {error && (
            <p className="my-6 text-center text-red-500">
              Something went wrong :(
            </p>
          )}
          {isLoading && <p className="my-6 text-center">AI is thinking...</p>}
          {messages.length === 0 && (
            <div className="grid h-full w-full place-items-center">
              <p>Start by typing a message in the input below</p>
            </div>
          )}
        </div>
        <form className="flex items-center" onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={handleInputChange}
            autoFocus
            placeholder="Type a message..."
          />
          <Button size="icon" type="submit" disabled={isLoading}>
            <SendHorizonalIcon />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;
