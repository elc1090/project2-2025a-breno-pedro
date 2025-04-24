// Interfaces para a API de ingredientes

export interface IngredientSearchData {
  id: number
  name: string
  category: string
  image: string
  image_thumbnail: string
}

export interface IngredientSearchResult {
  value: string
  data: IngredientSearchData
}

export interface IngredientSearchResponse {
  suggestions: IngredientSearchResult[]
}

// Interface completa para os valores nutricionais
export interface IngredientNutritionalValues {
  id: number
  uuid: string
  remote_id?: string
  source_name?: string
  source_url?: string
  code?: string
  name: string
  created: string
  last_update: string
  last_imported?: string
  energy: number
  protein: number
  fat: number
  carbohydrates: number
  carbohydrates_sugar?: number
  fat_saturated?: number
  fiber?: number
  sodium?: number
  license?: number
  license_title?: string
  license_object_url?: string
  license_author?: string
  license_author_url?: string
  license_derivative_source_url?: string
  language: number
  image?: string // Adicionado para armazenar a imagem do ingrediente
}
