import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */

type D1BoundStatement = {
  all: <T = Record<string, unknown>>() => Promise<{ results: T[] }>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  run: () => Promise<unknown>;
};

type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => D1BoundStatement;
  } & D1BoundStatement;
};

type CloudflareEnv = { DB?: D1Database };

function getDB(): D1Database {
  const cfEnv = (
    (globalThis as any).__cloudflare?.env ??
    (globalThis as any).__env__ ??
    {}
  ) as CloudflareEnv;
  if (!cfEnv.DB) throw new Error("The enquiries database is not configured.");
  return cfEnv.DB;
}

type EnquiryRow = {
  id: string;
  name: string;
  company: string;
  email: string;
  project_type: string;
  budget: string;
  timeline: string;
  details: string;
  created_at: string;
  status: string;
};

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(160),
  company: z.string().trim().max(160),
  email: z.string().trim().email().max(320),
  projectType: z.string().trim().min(1).max(120),
  budget: z.string().trim().min(1).max(120),
  timeline: z.string().trim().min(1).max(120),
  details: z.string().trim().min(1).max(10000),
  idempotencyKey: z.string().uuid(),
});

export const submitProjectEnquiry = createServerFn({ method: "POST" })
  .validator((input) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const database = getDB();
    const enquiryId = crypto.randomUUID();

    const inserted = await database
      .prepare(
        `INSERT INTO enquiries
           (id, name, company, email, project_type, budget, timeline, details, status, idempotency_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)
         ON CONFLICT(idempotency_key) DO NOTHING
         RETURNING id`,
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
        data.idempotencyKey,
      )
      .all<{ id: string }>();

    if (inserted.results.length > 0) {
      const row = inserted.results[0];
      return { id: (row as { id: string })["id"] };
    }

    // Duplicate submit — return the original row's id instead of erroring.
    const existing = await database
      .prepare(`SELECT id FROM enquiries WHERE idempotency_key = ?`)
      .bind(data.idempotencyKey)
      .first<{ id: string }>();

    return { id: (existing as { id: string })["id"] };
  });

export const getEnquiries = createServerFn({ method: "GET" }).handler(async () => {
  const database = getDB();

  const result = await database
    .prepare(
      `SELECT id, name, company, email, project_type, budget, timeline, details, created_at, status
       FROM enquiries
       ORDER BY created_at DESC`,
    )
    .bind()
    .all<EnquiryRow>();

  return result.results;
});
