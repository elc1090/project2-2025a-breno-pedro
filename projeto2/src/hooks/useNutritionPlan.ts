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
  const queryClient = useQueryClient()
  return useMutation<INutritionPlan, Error, INutritionPlan>({
    mutationFn: (payload) =>
      api.post<INutritionPlan>("nutritionplan/", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionPlan"] })
    },
  })
}

export const useDeleteNutritionPlan = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: (id) => api.delete(`nutritionplan/${id}/`).then(() => {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionPlan"] })
    },
  })
}

/** ← NOVO HOOK: busca um plano pelo seu ID → */
export const useNutritionPlanById = (id: number) =>
  useQuery<INutritionPlan, Error>({
    queryKey: ["nutritionPlan", id],
    queryFn: async () => {
      const { data } = await api.get<INutritionPlan>(`nutritionplan/${id}/`)
      return data
    },
    enabled: !!id, // só roda se id for truthy
  })
