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

export function useEnquirySubmit() {
  const [status, setStatus] = useState<EnquiryStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  // One idempotency key per form mount — survives re-renders, resets on page reload.
  const idempotencyKey = useRef(crypto.randomUUID());

  const submit = useCallback(
    async (formData: EnquiryFormData) => {
      if (status === "submitting") return;
      setStatus("submitting");
      setError(null);
      try {
        await submitProjectEnquiry({
          data: { ...formData, idempotencyKey: idempotencyKey.current },
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again.",
        );
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
