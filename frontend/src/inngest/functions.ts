import { env } from "~/env";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "process-video" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.run("call-modal-endpoint", async () => {
      await fetch(env.PROCESS_VIDEO_ENDPOINT);
    });
  },
);
