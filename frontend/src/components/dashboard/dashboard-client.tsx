"use client";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Dropzone from "shadcn-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Loader2, Loader2Icon, UploadCloud } from "lucide-react";
import {
  generateUploadUrl,
  uploadFileStatusAndProcess,
} from "~/app/actions.ts/generate";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import ClipsDisplay from "./clips-display";

interface FormattedUploadedFile {
  id: string;
  s3Key: string;
  status: string;
  name: string;
  clipsCount: number;
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

  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentStatus = searchParams.get("paymentStatus");
    if (paymentStatus) {
      if (paymentStatus === "true")
        toast.success("PAYMENT SUCCESSFUL, CREDITS ADDED.");
      else
        toast.error(
          "PAYMENT FAILED WITH NO BALANCE DEDUCTED, CAN YOU TRY AGAIN.",
        );
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("paymentStatus");
      router.replace(`?${newParams.toString()}`, { scroll: false });
    }
  }, [router, searchParams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

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
          uploadedFileId,
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
          <TabsTrigger value="my-clips">My Clips</TabsTrigger>
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
                {() => (
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

          {uploadedFiles.length > 0 && (
            <div className="pt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-md mb-2 font-medium">Queue status</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  Rede
                  {refreshing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Refresh
                </Button>
              </div>
              <div className="max-h-[300px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clips created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedFiles.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-xs truncate font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {item.status === "queued" && (
                            <Badge variant="outline">Queued</Badge>
                          )}
                          {item.status === "processing" && (
                            <Badge variant="outline">Processing</Badge>
                          )}
                          {item.status === "processed" && (
                            <Badge variant="outline">Processed</Badge>
                          )}
                          {item.status === "no credits" && (
                            <Badge variant="destructive">No credits</Badge>
                          )}
                          {item.status === "failed" && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.clipsCount > 0 ? (
                            <span>
                              {item.clipsCount} clip
                              {item.clipsCount !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              No clips yet
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="my-clips">
          <Card>
            <CardHeader>
              <CardTitle>My Clips</CardTitle>
              <CardDescription>
                View and manage your clips. Processing may take some time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClipsDisplay clips={clips} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
