"use client"

import { useState, useEffect } from "react"
import { searchIngredients } from "@/services/api"
import type { IngredientSearchResult } from "@/types/api"

export function useIngredientSuggestion(query: string) {
  const [data, setData] = useState<IngredientSearchResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await searchIngredients(query)
        setData(response.suggestions || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce para evitar muitas requisições enquanto o usuário digita
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  return { data, isLoading, error }
}
