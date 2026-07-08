import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: async (data: {
      name?: string;
      image?: string | null;
      phone?: string | null;
      gender?: string | null;
      dateOfBirth?: Date | null;
    }) => {
      const { data: responseData, error } = await authClient.updateUser({
        ...data,
        image: data.image !== undefined ? data.image : undefined
      });
      if (error) throw error;
      return responseData;
    }
  });
};

export const useUploadAvatarMutation = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Validate file size (< 2MB)
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error("File exceeds the 2MB size limit.");
      }

      // 2. Direct Upload to Backend (Bypasses CORS and process simultaneously)
      const formData = new FormData();
      formData.append("file", file);

      const processRes = await fetch("/api/users/profile/avatar/process", {
        method: "POST",
        body: formData,
      });
      
      if (!processRes.ok) {
        throw new Error("Failed to process avatar");
      }
      
      const processData = await processRes.json();
      if (!processData.success) {
        throw new Error(processData.message || "Failed to process avatar");
      }

      // 5. Refresh Better Auth session seamlessly
      await authClient.getSession({
        fetchOptions: { cache: "no-store" }
      });

      return processData.data;
    }
  });
};
