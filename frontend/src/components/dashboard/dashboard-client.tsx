"use client";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Loader2Icon, UploadCloud } from "lucide-react";
import {
  generateUploadUrl,
  uploadFileStatusAndProcess,
  uploadFileToDBAndProcess,
} from "~/app/actions.ts/s3";
import { toast } from "sonner";

interface FormattedUploadedFile {
  id: string;
  s3Key: string;
  status: string;
  name: string;
  clipCount: number;
  createdAt: Date;
}

export default function DashboardClient({
  uploadedFiles,
  clips,
}: {
  uploadedFiles: FormattedUploadedFile[];
  clips: Clip[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    try {
      const file = files[0];
      if (!file) return;

      setUploading(true);

      const { success, s3Key, signedUrl, uploadedFileId } =
        await generateUploadUrl({
          fileName: file?.name ?? "unknown.mp4",
          contentType: file?.type ?? "video/mp4",
        });

      if (success && s3Key && signedUrl && uploadedFileId) {
        await fetch(signedUrl, {
          method: "POST",
          body: file,
        });

        await uploadFileStatusAndProcess({
          s3Key,
          uploadedFileId,
          displayName: file?.name ?? "unknown.mp4",
        });
        toast.success("Video uploaded successfully, under processing...");
      }
    } catch {
      toast.error("SOMETHING WENT WRONG WHILE UPLOADING, PLEASE TRY AGAIN");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Podcast Clipper
          </h1>
          <p className="text-muted-foreground">
            Upload your podcast and get AI-generated clips instantly
          </p>
        </div>
        <Link href="/dashboard/billing">
          <Button>Buy Credits</Button>
        </Link>
      </div>
      <Tabs defaultValue="upload">
        <TabsList className="w-full">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="my-uploads">My Uploads</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload your file here</CardTitle>
              <CardDescription>Browse or drag</CardDescription>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{ "video/mp4": [".mp4"] }}
                maxSize={500 * 1024 * 1024}
                disabled={uploading}
                maxFiles={1}
              >
                {(dropzone: DropzoneState) => (
                  <>
                    <div className="flex flex-col items-center justify-center space-y-4 rounded-lg p-10 text-center">
                      <UploadCloud className="text-muted-foreground h-12 w-12" />
                      <p className="font-medium">Drag and drop your file</p>
                      <p className="text-muted-foreground text-sm">
                        or click to browse (MP4 up to 500MB)
                      </p>
                      <Button
                        className="cursor-pointer"
                        variant="default"
                        size="sm"
                        disabled={uploading}
                      >
                        Select File
                      </Button>
                    </div>
                  </>
                )}
              </Dropzone>{" "}
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center justify-between">
                <div className="mt-2 flex items-start justify-between">
                  <div>
                    {files?.length > 0 && (
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">Selected file:</p>
                        {files?.map((file) => (
                          <p key={file.name} className="text-muted-foreground">
                            {file.name}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={files.length === 0 || uploading}
                >
                  {uploading && <Loader2Icon className="animate-spin" />} Upload
                  and Generate clips
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="my-uploads">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
}
