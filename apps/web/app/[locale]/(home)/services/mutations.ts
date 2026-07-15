import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/api/client"


export function useNewsletterSignupMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post('/newsletter/subscribe', { email })
      return data
    }
  })
}
