import { startProcessingPDF } from "@/server/actions/pdf";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { revalidatePath } from "next/cache";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = () => getServerAuthSession();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  // imageUploader: f({ image: { maxFileSize: "4MB" } })
  //   // Set permissions and file types for this FileRoute
  //   .middleware(async ({ req }) => {
  //     // This code runs on your server before upload
  //     const user = await auth(req);

  //     // If you throw, the user will not be able to upload
  //     if (!user) throw new UploadThingError("Unauthorized");

  //     // Whatever is returned here is accessible in onUploadComplete as `metadata`
  //     return { userId: user.id };
  //   })
  //   .onUploadComplete(async ({ metadata, file }) => {
  //     // This code RUNS ON YOUR SERVER after upload
  //     console.log("Upload complete for userId:", metadata.userId);

  //     console.log("file url", file.url);

  //     // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
  //     return { uploadedBy: metadata.userId };
  //   }),
  // pdfUploader: f({ pdf: { maxFileSize: "1MB", maxFileCount: 1 } })
  //   // Set permissions and file types for this FileRoute
  //   .middleware(async ({ req }) => {
  //     // This code runs on your server before upload
  //     const user = await auth(req);

  //     // If you throw, the user will not be able to upload
  //     if (!user) throw new UploadThingError("Unauthorized");

  //     // Whatever is returned here is accessible in onUploadComplete as `metadata`
  //     return { userId: user.id };
  //   })
  //   .onUploadComplete(async ({ metadata, file }) => {
  //     // This code RUNS ON YOUR SERVER after upload
  //     console.log("Upload complete for userId:", metadata.userId);

  //     console.log("file url", file.url);

  //     // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
  //     return { uploadedBy: metadata.userId };
  //   }),
  freePDFUploader: f({ pdf: { maxFileSize: "1MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    // .middleware(async ({ req }) => {
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const pdf = await db.pDF.create({
        data: {
          name: file.name,
          fileUrl: file.url,
          key: file.key,
          size: file.size,
          status: "PROCESSING",
        },
      });

      const chat = await db.chat.create({
        data: {
          authorId: metadata.userId,
          title: file.name,
          pdfId: pdf.id,
        },
      });

      revalidatePath("/chat");

      startProcessingPDF(pdf.id);

      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { chatId: chat.id, uploadedBy: metadata.userId };
    }),
  proPDFUploader: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    // .middleware(async ({ req }) => {
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new UploadThingError("Unauthorized");

      if (session.user.plan !== "PRO") {
        throw new UploadThingError(
          "You must be a PRO user to upload PDFs larger than 1MB",
        );
      }

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const pdf = await db.pDF.create({
        data: {
          name: file.name,
          fileUrl: file.url,
          key: file.key,
          size: file.size,
          status: "PROCESSING",
        },
      });

      const chat = await db.chat.create({
        data: {
          authorId: metadata.userId,
          title: file.name,
          pdfId: pdf.id,
        },
      });

      // revalidatePath("/chat");

      // This code RUNS ON YOUR SERVER after upload
      // console.log("Upload complete for userId:", metadata.userId);

      // console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      // return { chatId: chat.id, uploadedBy: metadata.userId };

      return { chatId: chat.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
export type OurFileRouterEndpoints = keyof OurFileRouter;
