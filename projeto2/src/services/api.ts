// Serviço para fazer requisições à API wger.de

const API_BASE_URL = "https://wger.de/api/v2"

/**
 * Busca ingredientes com base no termo de pesquisa
 * @param term Termo de pesquisa
 * @param language Código do idioma (padrão: pt)
 * @returns Resultados da pesquisa
 */
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

/**
 * Obtém detalhes básicos de um ingrediente específico
 * @param id ID do ingrediente
 * @returns Detalhes básicos do ingrediente, incluindo imagem
 */
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

/**
 * Converte um valor nutricional para número, tratando casos especiais
 * @param value Valor a ser convertido
 * @returns Valor numérico ou 0 se inválido
 */
function parseNutritionalValue(value: any): number {
  // Se for undefined ou null, retorna 0
  if (value === undefined || value === null) return 0

  // Se já for um número, retorna ele mesmo
  if (typeof value === "number") return value

  // Se for uma string
  if (typeof value === "string") {
    // Se for apenas um traço ou vazio, retorna 0
    if (value === "-" || value.trim() === "") return 0

    // Remove caracteres não numéricos, exceto ponto decimal e sinal negativo
    const cleanedValue = value.replace(/[^\d.-]/g, "")

    // Converte para número
    const num = Number.parseFloat(cleanedValue)

    // Se for um número válido, retorna ele (valores negativos são convertidos para 0)
    if (!isNaN(num)) {
      return num < 0 ? 0 : num
    }
  }

  // Para qualquer outro caso, retorna 0
  return 0
}

/**
 * Obtém valores nutricionais de um ingrediente
 * @param id ID do ingrediente
 * @returns Valores nutricionais completos
 */
export async function getIngredientNutritionalValues(id: number, amount = 100) {
  try {
    // Endpoint correto conforme a documentação
    const response = await fetch(`${API_BASE_URL}/ingredient/${id}/get_values/?amount=${amount}`)

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const data = await response.json()

    // Log para debug
    console.log("Resposta original da API de valores nutricionais:", data)

    // Verificar se a resposta contém os dados esperados
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

    console.log("Dados nutricionais processados:", processedData)

    return processedData
  } catch (error) {
    console.error("Erro ao buscar valores nutricionais:", error)
    throw error
  }
}
