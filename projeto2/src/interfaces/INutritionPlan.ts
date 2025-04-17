export interface INutritionPlan {
    description: string
    only_logging: boolean
    goal_energy: number | null
    goal_protein: number | null
    goal_carbohydrates: number | null
    goal_fat: number | null
    goal_fiber: number | null
  }