import { dispatchToastEvent } from "@/components/global-toast-manager";

export function handleApiError(error: unknown, defaultMessage?: string): string {
  if (!error) return defaultMessage || "An unknown error occurred";

  const err = error as { 
    response?: { status?: number; data?: { message?: string } }; 
    status?: number;
    message?: string 
  };
  
  const status = err.response?.status ?? err.status;

  if (status === 429) {
    dispatchToastEvent({
      titleKey: "errors.rateLimitTitle",
      descriptionKey: "errors.rateLimitDescription",
      variant: "destructive",
    });
    return "Too many requests. Please wait a moment and try again.";
  }

  const message = err.response?.data?.message || err.message || defaultMessage || "An error occurred";
  return message;
}
