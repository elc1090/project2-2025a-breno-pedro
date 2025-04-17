import { useQuery } from "@tanstack/react-query"
import api from "@/services/api"

export const useNutritionPlanInfo = () =>
  useQuery({
    queryKey: ["nutritionPlanInfo"],
    queryFn: async () => {
      const { data } = await api.get("nutritionplaninfo/")
      /* o endpoint devolve { count, next, previous, results } */
      return data.results                        // só o array
    },
  })
