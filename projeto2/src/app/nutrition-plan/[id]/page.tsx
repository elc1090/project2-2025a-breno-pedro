// app/nutrition-plan/[id]/page.tsx
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useNutritionPlanById } from "@/hooks/useNutritionPlan"
import { useMeals, useCreateMeal } from "@/hooks/useMeals"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, PlusCircle } from "lucide-react"

export default function NutritionPlanDetail() {
  const { id } = useParams()
  const planId = Number(id)

  const { data: plan, isLoading: planLoading } =
    useNutritionPlanById(planId)
  const { data: meals, isLoading: mealsLoading } =
    useMeals(planId)
  const createMeal = useCreateMeal()

  // estados do form de nova refeição
  const [newName, setNewName] = useState("")
  const [newTime, setNewTime] = useState("")

  if (planLoading || mealsLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!plan) return <p>Plano não encontrado.</p>

  const handleSubmit = () => {
    if (!newName.trim() || !newTime.trim()) return
    createMeal.mutate(
      {
        plan: planId,
        order: meals?.length ? meals.length + 1 : 1,
        name: newName.trim(),
        time: newTime.trim(),
      },
      {
        onSuccess: () => {
          // limpa campos e fecha dialog
          setNewName("")
          setNewTime("")
        },
      }
    )
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

      {/* Dialog para adicionar refeição */}
      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={createMeal.isLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {createMeal.isLoading ? "Salvando..." : "Adicionar Refeição"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Refeição</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="meal-name">Nome da Refeição</Label>
              <Input
                id="meal-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Café da Manhã"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meal-time">Horário (HH:mm)</Label>
              <Input
                id="meal-time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="Ex: 08:00"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={handleSubmit}
                disabled={
                  createMeal.isLoading ||
                  !newName.trim() ||
                  !newTime.trim()
                }
              >
                {createMeal.isLoading ? "Salvando..." : "Confirmar"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lista de refeições */}
      {meals && meals.length > 0 ? (
        <div className="grid gap-4">
          {meals.map((meal) => (
            <Card key={meal.id}>
              <CardHeader>
                <CardTitle>
                  {meal.name} — {meal.time}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Nenhuma refeição cadastrada.
        </p>
      )}
    </div>
  )
}
