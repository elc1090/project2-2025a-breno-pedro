import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/services/api"

export interface MealDTO {
  id: number
  name: string
  time: string       // "08:00"
  nutrition_plan: number
}

/* Lista as refeições de determinado plano */
export const useMeals = (planId: number) =>
  useQuery({
    queryKey: ["meals", planId],
    queryFn: async () => {
      const { data } = await api.get("meal/", {
        params: { nutrition_plan: planId },
      })
      return data.results as MealDTO[]
    },
  })

/* Cria refeição */
export const useCreateMeal = () => {
  const qc = useQueryClient()
  return useMutation<
    MealDTO,
    unknown,
    Omit<MealDTO, "id">,
    unknown
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post("meal/", payload)
      return data as MealDTO
    },
    onSuccess: (newMeal) => {
      qc.invalidateQueries({ queryKey: ["meals", newMeal.nutrition_plan] })
    },
  })
}
