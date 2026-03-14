import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { handleApiError } from "./use-api-error";

interface UpdateProfileData {
  imageUrl?: string;
  imageFile?: File;
  deleteCurrentImage?: boolean;
  email: string;
  name: string;
}

/**
 * Mutation hook to create/update user profile.
 * Supports both URL-based images and file uploads via FormData.
 */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const { imageFile, deleteCurrentImage, ...profileData } = data;
      return api.updateProfileWithImage(profileData, imageFile, deleteCurrentImage);
    },
    onError: (error) => {
      handleApiError(error, "Failed to update profile");
    },
  });
}
