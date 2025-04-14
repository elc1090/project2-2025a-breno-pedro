import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const fetchExercicios = async () => {
  const res = await axios.get("https://wger.de/api/v2/exerciseinfo/?language=2")
  return res.data.results
}

export const useExercicios = () => {
  return useQuery({
    queryKey: ["exercicios"],
    queryFn: fetchExercicios,
  })
}
