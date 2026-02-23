import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { handleApiError } from "./use-api-error";

interface UpdateProfileData {
  image?: string;
  email: string;
  name: string;
}

/**
 * Mutation hook to create/update user profile.
 */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: UpdateProfileData) =>
      api.patch("/user/profile", data),
    onError: (error) => {
      handleApiError(error, "Failed to update profile");
    },
  });
}
