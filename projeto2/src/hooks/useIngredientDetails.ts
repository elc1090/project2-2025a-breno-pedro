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

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Buscar valores nutricionais e informações básicas em paralelo
        const [nutritionalValues, basicInfo] = await Promise.all([
          getIngredientNutritionalValues(id),
          getIngredientBasicInfo(id),
        ])

        // Verificar se temos os dados nutricionais
        if (!nutritionalValues) {
          throw new Error("Não foi possível obter os valores nutricionais")
        }

        // Combinar os dados, adicionando a imagem do ingrediente
        const combinedData: IngredientNutritionalValues = {
          ...nutritionalValues,
          image: basicInfo.image, // Adicionar a imagem das informações básicas
        }

        console.log("Dados nutricionais combinados:", combinedData)
        setData(combinedData)
      } catch (err) {
        console.error("Erro ao carregar detalhes do ingrediente:", err)
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  return { data, isLoading, error }
}
