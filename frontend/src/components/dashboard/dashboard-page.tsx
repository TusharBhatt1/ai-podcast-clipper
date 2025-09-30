import { redirect } from "next/navigation";
import React from "react";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-up");

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: session?.user.id,
    },
    select: {
      uploadedFiles: {
        where: {
          uploaded: true,
        },
        select: {
          id: true,
          s3Key: true,
          status: true,
          displayName: true,
          createdAt: true,
          _count: {
            select: {
              clips: true,
            },
          },
        },
      },
      clips: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const formattedUploadedFiles = user.uploadedFiles.map((f) => ({
    id: f.id,
    s3Key: f.s3Key,
    status: f.status,
    name: f.displayName ?? "UNNAMED",
    clipsCount: f._count.clips,
    createdAt: f.createdAt,
  }));

  return (
    <DashboardClient
      uploadedFiles={formattedUploadedFiles}
      clips={user.clips}
    />
  );
}
