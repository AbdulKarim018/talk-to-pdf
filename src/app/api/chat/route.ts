import { getOpenAIClient } from "@/lib/openai";
import { getVectorStore } from "@/lib/vectorStore";
import { messageSchema } from "@/schemas";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const requestSchema = z.object({
    messages: z.array(messageSchema).min(1),
    chatId: z.string(),
  });

  const body = (await req.json()) as unknown;

  const parseResult = requestSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(parseResult.error.message, { status: 400 });
  }

  const { messages, chatId } = parseResult.data;

  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    return NextResponse.json("No messages to send", { status: 400 });
  }

  // console.log(messages);

  const chat = await db.chat.findUnique({
    where: {
      id: chatId,
    },
    include: {
      PDF: true,
      messages: true,
    },
  });

  if (!chat) {
    return NextResponse.json("Chat not found", { status: 404 });
  }

  await db.message.create({
    data: {
      chatId,
      role: "user",
      content: lastMessage.content,
    },
  });

  const openai = getOpenAIClient();
  const vectorStore = await getVectorStore();

  const vectorSearchResults = await vectorStore.similaritySearch(
    lastMessage.content,
    5,
    {
      pdfId: chat.PDF.id,
    },
  );

  const context = `

<Conext>


${vectorSearchResults
  .map(
    (result, index) => `

        Result #${index + 1}:
        Metadata: ${JSON.stringify(result.metadata)}
        PageContent: ${result.pageContent}

`,
  )
  .join("\n\n")}



        </Conext>


`;

  // console.log(context);

  const res = await openai.chat.completions.create({
    messages: [
      // {
      //   role: "system",
      //   content: `

      //     You are a helpful assistant.
      //     you only reply to the questions based on the given context and nothing else.
      //     Keep your answers short and to the point.
      //     If the user asks anything to answer or to do not related to the context,
      //     you should just decline the request.
      //     You will also be given a context everytime the user asks a question.

      //     To answer a you can refer to the context
      //     or you may read the previous messages to get more context.

      //     The context maybe a list of documents(metadata and pageContent)
      //     obtained from a vector similaritySearch based on the user's input.

      //         `,
      // },
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      ...messages,

      {
        role: "user",
        content: `

        ${lastMessage.content}
        
        Answer this based on the following context.

        
        ${context}


        `,
      },
    ],
    model: "llama3:8b-instruct",
    temperature: 0,
    stream: true,
    max_tokens: 1000,
  });

  const stream = OpenAIStream(res);

  return new StreamingTextResponse(stream);
}
