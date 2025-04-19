// src/hooks/useMeals.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/services/api"
import { IMeal } from "@/interfaces/IMeal"

/** Lista as refeições de determinado plano */
export const useMeals = (planId: number) =>
  useQuery<IMeal[], Error>({
    queryKey: ["meals", planId],
    queryFn: async () => {
      const { data } = await api.get<{
        results: IMeal[]
      }>("meal/", {
        params: { nutrition_plan: planId },
      })
      return data.results
    },
  })

/** Cria uma nova refeição */
export const useCreateMeal = () => {
  const qc = useQueryClient()

  return useMutation<
    IMeal,               // retorno da API
    Error,               // erro
    Omit<IMeal, "id">    // payload aceito
  >({
    mutationFn: async (payload) => {
      /** 
       * A API espera:
       * { name: string; time: string; nutrition_plan: number }
       */
      const postBody = {
        name: payload.name,
        time: payload.time,
        nutrition_plan: payload.plan,
      }
      const { data } = await api.post<IMeal>("meal/", postBody)
      return data
    },
    onSuccess: (newMeal) => {
      qc.invalidateQueries({ queryKey: ["meals", newMeal.plan] })
    },
  })
}
