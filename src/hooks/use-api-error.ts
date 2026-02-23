import { toast } from "@/hooks/use-toast";

export function handleApiError(error: unknown, defaultMessage?: string): string {
  if (!error) return defaultMessage || "An unknown error occurred";

  const err = error as { 
    response?: { status?: number; data?: { message?: string } }; 
    status?: number;
    message?: string 
  };
  
  const status = err.response?.status ?? err.status;

  if (status === 429) {
    const message = "Too many requests. Please wait a moment and try again.";
    toast({
      title: "Rate limit exceeded",
      description: message,
      variant: "destructive",
    });
    return message;
  }

  const message = err.response?.data?.message || err.message || defaultMessage || "An error occurred";
  return message;
}
