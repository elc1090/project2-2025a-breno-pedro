// app/nutrition-plan/[id]/page.tsx
"use client"

import { useParams } from "next/navigation"
import { useNutritionPlanById } from "@/hooks/useNutritionPlan"
import { useMeals, useCreateMeal } from "@/hooks/useMeals"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"

export default function NutritionPlanDetail() {
  const { id } = useParams()         // pega o id da URL
  const planId = Number(id)

  const { data: plan, isLoading: planLoading } = useNutritionPlanById(planId)
  const { data: meals, isLoading: mealsLoading } = useMeals(planId)
  const createMeal = useCreateMeal()

  if (planLoading || mealsLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!plan) return <p>Plano não encontrado.</p>

  const handleAddMeal = () => {
    const name = prompt("Nome da refeição:")
    if (!name) return
    const time = prompt("Horário (HH:mm):")
    if (!time) return
    createMeal.mutate({
      plan: planId,
      order: meals ? meals.length + 1 : 1,
      name,
      time,
    })
  }

  return (
    <div className="container py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan.description}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Only Logging:</strong>{" "}
            {plan.only_logging ? "Yes" : "No"}
          </p>
          {!plan.only_logging && (
            <ul className="mt-4 space-y-2">
              {plan.goal_energy != null && (
                <li>Energy goal: {plan.goal_energy} kcal</li>
              )}
              {plan.goal_protein != null && (
                <li>Protein goal: {plan.goal_protein} g</li>
              )}
              {plan.goal_carbohydrates != null && (
                <li>Carbs goal: {plan.goal_carbohydrates} g</li>
              )}
              {plan.goal_fat != null && (
                <li>Fat goal: {plan.goal_fat} g</li>
              )}
              {plan.goal_fiber != null && (
                <li>Fiber goal: {plan.goal_fiber} g</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Botão para criar nova refeição */}
      <Button onClick={handleAddMeal} disabled={createMeal.isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {createMeal.isLoading ? "Salvando..." : "Adicionar Refeição"}
      </Button>

      {/* Lista de refeições */}
      {meals && meals.length > 0 ? (
        <div className="grid gap-4">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <CardHeader>
                <CardTitle>{meal.name} — {meal.time}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Nenhuma refeição cadastrada.</p>
      )}
    </div>
  )
}
