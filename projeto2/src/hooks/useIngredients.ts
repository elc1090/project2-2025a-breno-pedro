import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const fetchIngredients = async () => {
  const res = await axios.get("https://wger.de/api/v2/ingredient")
  return res.data.results
}

export const useIngredients = () => {
  return useQuery({
    queryKey: ["ingredient"],
    queryFn: fetchIngredients,
  })
}

