import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { auth } from "~/server/auth";

export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    retries: 1,
    concurrency: {
      limit: 1,
      key: "event.data.userId",
    },
  },
  { event: "process-video-events" },
  async ({ event, step }) => {
    const { uploadedFileId } = event.data as { uploadedFileId: string };
    try {
      const session = await auth();

      if (!session?.user.id) {
        throw new Error("UNAUTHORIZED");
      }

      const { userId, credits, s3Key } = await step.run(
        "check-credits",
        async () => {
          const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
            where: {
              id: uploadedFileId,
            },
            select: {
              user: {
                select: {
                  id: true,
                  credits: true,
                },
              },
              s3Key: true,
            },
          });

          return {
            userId: uploadedFile.user.id,
            credits: uploadedFile.user.credits,
            s3Key: uploadedFile.s3Key,
          };
        },
      );

      if (credits <= 0) {
        await db.uploadedFile.update({
          where: {
            id: uploadedFileId,
          },
          data: {
            status: "NO_CREDITS",
          },
        });
        throw Error("NO CREDITS,TO USE THIS SERVICE PLEASE ADD SOME CREDITS");
      }

      await step.run("set-status", async () => {
        await db.uploadedFile.update({
          where: {
            id: uploadedFileId,
          },
          data: {
            status: "PROCESSING",
          },
        });
      });

      await step.run("call-modal-endpoint", async () => {
        await fetch(env.PROCESS_VIDEO_ENDPOINT, {
          method: "POST",
          // body: JSON.stringify({ s3_key: "test1/min6-5mins.mp4" }),
          body: JSON.stringify({ s3_key: s3Key }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
          },
        });
      });

      const { clipsFound } = await step.run("create-clips-in-db", async () => {
        const folderPrefix = s3Key.split("/")[0]!;

        const allKeys = listS3ObjectsByPrefix(folderPrefix);
        const clipKeys = (await allKeys).filter(
          (key): key is string =>
            key != undefined && !key.endsWith("original.mp4"),
        );

        if (clipKeys.length > 0) {
          await db.clip.createMany({
            data: clipKeys.map((key) => ({
              s3Key: key,
              uploadedFileId,
              userId,
            })),
          });
        }

        return { clipsFound: clipKeys.length };
      });

      await step.run("deduct-credits", async () => {
        await db.user.update({
          where: {
            id: userId,
          },
          data: {
            credits: {
              decrement: Math.min(credits, clipsFound),
            },
          },
        });
      });

      await step.run("mark-video-as-processed", async () => {
        await db.uploadedFile.update({
          where: {
            id: uploadedFileId,
          },
          data: {
            status: "PROCESSED",
          },
        });
      });
    } catch {
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "FAILED",
        },
      });
    }
  },
);

async function listS3ObjectsByPrefix(prefix: string) {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_KEY,
    },
  });

  const command = new ListObjectsCommand({
    Bucket: env.S3_BUCKET_NAME,
    Prefix: prefix,
  });

  const result = await s3Client.send(command);

  return (
    result.Contents?.map((item) => item.Key).filter((k) => Boolean(k)) ?? []
  );
}
