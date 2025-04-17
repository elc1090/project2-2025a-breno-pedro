import { useQuery } from "@tanstack/react-query"
import api from "@/services/api"

export const useIngredientSearch = (term: string) =>
  useQuery({
    enabled: !!term,
    queryKey: ["ingredients", term],
    queryFn: async () => {
      const { data } = await api.get("ingredient/", {
        params: { search: term, language: 2 /* 2=pt‑BR */ },
      })
      return data.results               // [{ id, name, energy, ...}]
    },
    staleTime: 1000 * 60 * 60,          // 1 h
  })
