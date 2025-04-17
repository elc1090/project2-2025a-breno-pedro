// src/hooks/useNutritionPlan.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/services/api"
import { INutritionPlan } from "@/interfaces/INutritionPlan"

interface ListResponse {
  count: number
  next: string | null
  previous: string | null
  results: INutritionPlan[]
}

export const useNutritionPlan = () =>
  useQuery<INutritionPlan[], Error>({
    queryKey: ["nutritionPlan"],
    queryFn: async () => {
      const { data } = await api.get<ListResponse>("nutritionplan/")
      return data.results
    },
  })

export const useCreateNutritionPlan = () => {
  // 1) pega o queryClient aqui dentro
  const queryClient = useQueryClient()

  return useMutation<
    INutritionPlan,       // tipo retornado pelo POST
    Error,                    // tipo de erro
    INutritionPlan        // tipo do payload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<INutritionPlan>(
        "nutritionplan/",
        payload
      )
      return data
    },
    onSuccess: () => {
      // 2) invalida a query existente para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ["nutritionPlan"] })
    },
  })
}
