"use server";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "~/server/db";
import { inngest } from "~/inngest/client";

export async function generateUploadUrl({
  fileName,
  contentType,
}: {
  fileName: string;
  contentType: string;
}): Promise<{
  success?: boolean;
  s3Key?: string;
  signedUrl?: string;
  uploadedFileId?: string;
}> {
  try {
    const session = await auth();

    if (!session) throw new Error("UNAUTHORIZED");

    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_KEY_ID,
      },
    });

    const fileExtension = fileName.split(".").pop();
    const uniqueId = Date.now();
    const key = `${uniqueId}/original.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    const uploadedFileDBRecord = await db.uploadedFile.create({
      data: {
        userId: session.user.id,
        s3Key: key,
        displayName: fileName,
        uploaded: false,
      },
      select: {
        id: true,
      },
    });

    return {
      success: true,
      s3Key: key,
      signedUrl,
      uploadedFileId: uploadedFileDBRecord.id,
    };
  } catch (e) {
    console.log("SOMETHING WENT WRONG: ", e);
    return { success: false };
  }
}

export async function uploadFileStatusAndProcess({
  uploadedFileId,
}: {
  uploadedFileId: string;
}) {
  try {
    const { userId, uploaded } = await db.uploadedFile.update({
      where: {
        id: uploadedFileId,
      },
      select: {
        userId: true,
        uploaded: true,
      },
      data: {
        status: "PROCESSING",
      },
    });

    if (uploaded) return;

    //INNGEST
    await inngest.send({
      name: "process-video-events",
      data: {
        uploadedFileId,
        userId,
      },
    });

    await db.uploadedFile.update({
      where: {
        id: uploadedFileId,
      },
      select: {
        userId: true,
      },
      data: {
        status: "PROCESSED",
        uploaded: true,
      },
    });
  } catch (e) {
    console.log("SOMETHING WENT WRONG: ", e);
  }
}

export async function getClipUrl({
  clipId,
}: {
  clipId: string;
}): Promise<{ success: boolean; url: string | null; message?: string }> {
  try {
    const session = await auth();

    if (!session?.user.id) {
      return { success: false, url: null };
    }

    const clip = await db.clip.findUniqueOrThrow({
      where: {
        id: clipId,
        userId: session.user.id,
      },
    });

    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_KEY_ID,
      },
    });

    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: clip.s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });

    return { success: true, url: signedUrl };
  } catch (e) {
    console.log("SOMETHING WENT WRONG WHILE GETTING CLIP URL: ", e);
    return {
      success: false,
      url: null,
      message: "SOMETHING WENT WRONG WHILE GETTING CLIP URL",
    };
  }
}
