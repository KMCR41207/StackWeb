import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160),
  email: z.string().trim().email().max(320),
  projectType: z.string().trim().min(1).max(120),
  budget: z.string().trim().min(1).max(120),
  timeline: z.string().trim().min(1).max(120),
  details: z.string().trim().min(1).max(10000),
});

type EnquiriesDatabase = {
  prepare: (query: string) => {
    bind: (...values: string[]) => {
      run: () => Promise<unknown>;
    };
  };
};

type WorkerEnv = {
  DB?: EnquiriesDatabase;
};

type NitroGlobal = typeof globalThis & {
  __env__?: WorkerEnv;
};

export const submitProjectEnquiry = createServerFn({ method: "POST" })
  .validator((input) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const database = (globalThis as NitroGlobal).__env__?.DB;

    if (!database) {
      throw new Error("The enquiries database is not configured.");
    }

    const enquiryId = crypto.randomUUID();
    await database
      .prepare(
        `INSERT INTO enquiries
          (id, name, company, email, project_type, budget, timeline, details, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      )
      .bind(
        enquiryId,
        data.name,
        data.company,
        data.email,
        data.projectType,
        data.budget,
        data.timeline,
        data.details,
      )
      .run();

    return { id: enquiryId };
  });
