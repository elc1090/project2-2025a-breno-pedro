"use client"

import { useState, useEffect } from "react"
import { getIngredientBasicInfo, getIngredientNutritionalValues } from "@/services/api"
import type { IngredientNutritionalValues } from "@/types/api"

export function useIngredientDetails(id?: number, amount = 100) {
  const [data, setData] = useState<IngredientNutritionalValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setData(null)
      return
    }

    const timeout = setTimeout(() => {
      const fetchData = async () => {
        setIsLoading(true)
        setError(null)

        try {
          const [nutritionalValues, basicInfo] = await Promise.all([
            getIngredientNutritionalValues(id, amount),
            getIngredientBasicInfo(id),
          ])

          const combinedData: IngredientNutritionalValues = {
            ...nutritionalValues,
            name: basicInfo.name,
            image: basicInfo.image,
          }

          setData(combinedData)
        } catch (err) {
          setError(err instanceof Error ? err : new Error("Erro desconhecido"))
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }, 500)

    return () => clearTimeout(timeout)
  }, [id, amount])

  return { data, isLoading, error }
}
