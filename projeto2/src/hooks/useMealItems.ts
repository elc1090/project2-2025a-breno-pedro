import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/services/api"

export interface MealItemDTO {
  id: number
  meal: number
  ingredient: number
  amount: number           // gramas
}

/* Adiciona alimento a uma refeição */
export const useAddMealItem = () => {
  const qc = useQueryClient()
  return useMutation<
    MealItemDTO,
    unknown,
    Omit<MealItemDTO, "id">,
    unknown
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post("mealitem/", payload)
      return data as MealItemDTO
    },
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ["meals", "__all"] })
      qc.invalidateQueries({ queryKey: ["mealItems", item.meal] })
    },
  })
}
