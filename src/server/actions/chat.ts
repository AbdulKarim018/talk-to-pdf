"use server";

import { db } from "@/server/db";
import { type Message } from "ai";
import { revalidatePath } from "next/cache";

export const getUserChats = async (userId: string) => {
  try {
    const chats = await db.chat.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      data: chats,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return {
      data: null,
      error: "Error fetching user chats",
    };
  }
};

export const getChat = async (chatId: string) => {
  try {
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        PDF: true,
        author: true,
        messages: true,
      },
    });
    return {
      data: chat,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    return {
      data: null,
      error: "Error fetching chat",
    };
  }
};

export const checkPDFStatus = async (pdfId: string) => {
  try {
    const pdf = await db.pDF.findUnique({
      where: {
        id: pdfId,
      },
    });

    if (!pdf)
      return {
        data: null,
        error: "PDF not found",
      };

    if (pdf.status === "PROCESSING") {
      return {
        data: pdf,
        error: null,
      };
    }

    if (pdf.status === "COMPLETE") {
      return revalidatePath("/chat/[id]");
    }

    revalidatePath("/chat/[id]");

    return {
      data: null,
      error: "PDF is not processing",
    };
  } catch (error) {
    console.error("Error checking PDF status:", error);
    return {
      data: null,
      error: "Error checking PDF status",
    };
  }
};

export const addMessageToChat = async (chatId: string, message: Message) => {
  try {
    const chat = await db.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat)
      return {
        data: null,
        error: "Chat not found",
      };

    const newMessage = await db.message.create({
      data: {
        chatId: chatId,
        content: message.content,
        role: "assistant",
      },
    });

    return {
      data: newMessage,
      error: null,
    };
  } catch (error) {
    console.error("Error adding message to chat:", error);
    return {
      data: null,
      error: "Error adding message to chat",
    };
  }
};
