import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { connectDB } from "./db";
import { Enquiry } from "./enquiry.model";

const enquirySchema = z.object({
  name:           z.string().trim().min(1).max(160),
  company:        z.string().trim().max(160),
  email:          z.string().trim().email().max(320),
  projectType:    z.string().trim().min(1).max(120),
  budget:         z.string().trim().min(1).max(120),
  timeline:       z.string().trim().min(1).max(120),
  details:        z.string().trim().min(1).max(10000),
  idempotencyKey: z.string().uuid(),
});

export const submitProjectEnquiry = createServerFn({ method: "POST" })
  .validator((input) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    await connectDB();

    // Idempotent insert — return existing if same key already submitted
    const existing = await Enquiry.findOne({ idempotencyKey: data.idempotencyKey }).lean();
    if (existing) {
      return { id: String(existing._id) };
    }

    const enquiry = await Enquiry.create({
      name:           data.name,
      company:        data.company,
      email:          data.email,
      projectType:    data.projectType,
      budget:         data.budget,
      timeline:       data.timeline,
      details:        data.details,
      idempotencyKey: data.idempotencyKey,
      status:         "New",
    });

    return { id: String(enquiry._id) };
  });

export const getEnquiries = createServerFn({ method: "GET" }).handler(async () => {
  await connectDB();

  const enquiries = await Enquiry.find()
    .sort({ createdAt: -1 })
    .lean();

  return enquiries.map((e) => ({
    id:          String(e._id),
    name:        e.name,
    company:     e.company,
    email:       e.email,
    project_type: e.projectType,
    budget:      e.budget,
    timeline:    e.timeline,
    details:     e.details,
    created_at:  e.createdAt.toISOString(),
    status:      e.status,
  }));
});
