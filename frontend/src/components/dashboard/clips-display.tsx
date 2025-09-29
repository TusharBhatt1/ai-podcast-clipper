import type { Clip } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { getClipUrl } from "~/app/actions.ts/generate";
import { Button } from "../ui/button";
import { Download, Loader2, Play } from "lucide-react";

export default function ClipsDisplay({ clips }: { clips: Clip[] }) {
  if (clips.length === 0)
    return (
      <p className="text-muted-foreground text-center">No clip generated yet</p>
    );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {clips.map((clip) => (
        <ClipCard clip={clip} key={clip.id} />
      ))}
    </div>
  );
}

export function ClipCard({ clip }: { clip: Clip }) {
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const handleDownload = () => {
    if (playUrl) {
      const link = document.createElement("a");
      link.href = playUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  useEffect(() => {
    async function getPlayUrl() {
      try {
        setIsLoadingUrl(true);
        const response = await getClipUrl({ clipId: clip.id });
        if (!response.success && !response.url) {
          toast.error(response.message);
          return;
        }

        setPlayUrl(response.url);
      } catch {
        toast.error("SOMETHING WENT WRONG");
      } finally {
        setIsLoadingUrl(false);
      }
    }
    void getPlayUrl();
  }, [clip.id]);

  return (
    <div className="flex max-w-52 flex-col gap-2">
      <div className="bg-muted">
        {isLoadingUrl ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : playUrl ? (
          <video
            src={playUrl}
            controls
            preload="metadata"
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play className="text-muted-foreground h-10 w-10 opacity-50" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="mr-1.5 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
