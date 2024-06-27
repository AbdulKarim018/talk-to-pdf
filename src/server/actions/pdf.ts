"use server";

import { getVectorStore } from "@/lib/vectorStore";
import { db } from "@/server/db";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const startProcessingPDF = async (pdfId: string) => {
  console.log("startProcessingPDF", pdfId);
  try {
    const pdf = await db.pDF.findFirst({ where: { id: pdfId } });

    if (!pdf) {
      return {
        data: null,
        error: "PDF not found",
      };
    }

    const reponse = await fetch(pdf.fileUrl);

    const blob = await reponse.blob();

    const loader = new PDFLoader(blob);

    const pages = await loader.load();

    // console.log("no of pages", pages.length);

    // console.log("docs before splitting metadata ===> ", pages[0]?.metadata);
    // console.log(
    //   "docs before splitting pageContent ===> ",
    //   pages[0]?.pageContent.slice(0, 100),
    // );

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 512,
      chunkOverlap: 20,
    });

    const docs = await textSplitter.splitDocuments(pages);

    // console.log("docs after splitting metadata ===> ", docs[0]?.metadata);
    // console.log(
    //   "docs after splitting pageContent ===> ",
    //   docs[0]?.pageContent.slice(0, 100),
    // );

    console.log("pdf processed");

    console.log("Storing in vector DB");

    const vectorStore = await getVectorStore();

    await vectorStore.addDocuments([
      ...docs.map((doc) => ({
        metadata: {
          ...doc.metadata,
          pdfId,
          pdfTitle: doc.metadata.title,
        },
        pageContent: doc.pageContent,
      })),
    ]);

    await db.pDF.update({
      where: { id: pdfId },
      data: {
        status: "COMPLETE",
      },
    });

    console.log("vector DB updated");

    return {
      data: docs,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: "Something went wrong",
    };
  }
};
