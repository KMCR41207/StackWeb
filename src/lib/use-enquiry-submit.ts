import { useState, useRef, useCallback } from "react";
import { submitProjectEnquiry } from "./enquiries.server";

export type EnquiryStatus = "idle" | "submitting" | "success" | "error";

export interface EnquiryFormData {
  name: string;
  company: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
}

function generateKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function sanitizeError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("querySrv") ||
    msg.includes("database") ||
    msg.includes("MongoDB") ||
    msg.includes("connect")
  ) {
    return "We couldn't send your enquiry right now. Please try again in a moment or email us directly.";
  }
  if (
    msg.includes("Invalid input") ||
    msg.includes("expected") ||
    msg.includes("Zod") ||
    msg.includes("validation")
  ) {
    return "Please check your form details and try again.";
  }
  if (msg.includes("Unauthorized")) {
    return "Something went wrong. Please refresh and try again.";
  }
  return "Something went wrong. Please try again.";
}

export function useEnquirySubmit() {
  const [status, setStatus] = useState<EnquiryStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // Lazy-initialised once per component mount — stable across re-renders
  const idempotencyKey = useRef<string | null>(null);
  if (idempotencyKey.current === null) {
    idempotencyKey.current = generateKey();
  }

  const submit = useCallback(
    async (formData: EnquiryFormData) => {
      if (status === "submitting") return;
      setStatus("submitting");
      setError(null);
      try {
        await submitProjectEnquiry({
          data: { ...formData, idempotencyKey: idempotencyKey.current! },
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(sanitizeError(err));
      }
    },
    [status],
  );

  return {
    submit,
    status,
    error,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    isError: status === "error",
  };
}
