import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IEnquiry extends Document {
  name: string;
  company: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
  status: "New" | "In progress" | "Closed";
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name:           { type: String, required: true, maxlength: 160 },
    company:        { type: String, default: "", maxlength: 160 },
    email:          { type: String, required: true, maxlength: 320 },
    projectType:    { type: String, required: true, maxlength: 120 },
    budget:         { type: String, required: true, maxlength: 120 },
    timeline:       { type: String, required: true, maxlength: 120 },
    details:        { type: String, required: true, maxlength: 10000 },
    status:         { type: String, enum: ["New", "In progress", "Closed"], default: "New" },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

// Prevent model re-compilation during hot reload
export const Enquiry: Model<IEnquiry> =
  (mongoose.models["Enquiry"] as Model<IEnquiry>) ??
  mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
