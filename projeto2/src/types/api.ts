const API_BASE_URL = "https://wger.de/api/v2"

export interface IngredientNutritionalValues {
  energy: number
  protein: number
  carbohydrates: number
  fat: number
  carbohydrates_sugar?: number
  fat_saturated?: number
  fiber?: number
  sodium?: number
  name?: string
  image?: string
}

export interface IngredientSearchResult {
  id: number
  value: string
  data: {
    id: number
    name: string
    image: string | null
  }
}

export async function searchIngredients(term: string, language = "pt") {
  try {
    const response = await fetch(
      `${API_BASE_URL}/ingredient/search/?language=${language}&term=${encodeURIComponent(term)}`,
    )

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar ingredientes:", error)
    throw error
  }
}

export async function getIngredientBasicInfo(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredient/${id}/`)

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Erro ao buscar informações básicas do ingrediente:", error)
    throw error
  }
}

function parseNutritionalValue(value: any): number {
  if (value === undefined || value === null) return 0
  if (typeof value === "number") return value
  if (typeof value === "string") {
    if (value === "-" || value.trim() === "") return 0
    const cleanedValue = value.replace(/[^\d.-]/g, "")
    const num = Number.parseFloat(cleanedValue)
    if (!isNaN(num)) {
      return num < 0 ? 0 : num
    }
  }
  return 0
}

export async function getIngredientNutritionalValues(id: number, amount = 100) {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredient/${id}/get_values/?amount=${amount}`)
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }
    const data = await response.json()
    if (!data) {
      throw new Error("Resposta da API vazia")
    }

    // Converter todos os valores nutricionais para números
    const processedData = {
      ...data,
      energy: parseNutritionalValue(data.energy),
      protein: parseNutritionalValue(data.protein),
      carbohydrates: parseNutritionalValue(data.carbohydrates),
      fat: parseNutritionalValue(data.fat),
      carbohydrates_sugar:
        data.carbohydrates_sugar !== undefined ? parseNutritionalValue(data.carbohydrates_sugar) : undefined,
      fat_saturated: data.fat_saturated !== undefined ? parseNutritionalValue(data.fat_saturated) : undefined,
      fiber: data.fiber !== undefined ? parseNutritionalValue(data.fiber) : undefined,
      sodium: data.sodium !== undefined ? parseNutritionalValue(data.sodium) : undefined,
    }

    return processedData
  } catch (error) {
    console.error("Erro ao buscar valores nutricionais:", error)
    throw error
  }
}
