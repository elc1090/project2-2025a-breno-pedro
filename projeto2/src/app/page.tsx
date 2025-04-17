"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface Food {
  id: string
  name: string
  calories?: number
}

interface Meal {
  id: string
  name: string
  time: string
  foods: Food[]
}

export default function DietTracker() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [newMealName, setNewMealName] = useState("")
  const [newMealTime, setNewMealTime] = useState("")
  const [newFoodName, setNewFoodName] = useState("")
  const [newFoodCalories, setNewFoodCalories] = useState<string>("")
  const [activeMealId, setActiveMealId] = useState<string | null>(null)

  const handleAddMeal = () => {
    if (newMealName.trim() === "" || newMealTime.trim() === "") return

    const newMeal: Meal = {
      id: Date.now().toString(),
      name: newMealName,
      time: newMealTime,
      foods: [],
    }

    setMeals([...meals, newMeal])
    setNewMealName("")
    setNewMealTime("")
  }

  const handleAddFood = () => {
    if (newFoodName.trim() === "" || activeMealId === null) return

    const newFood: Food = {
      id: Date.now().toString(),
      name: newFoodName,
      calories: newFoodCalories ? Number.parseInt(newFoodCalories) : undefined,
    }

    setMeals(meals.map((meal) => (meal.id === activeMealId ? { ...meal, foods: [...meal.foods, newFood] } : meal)))

    setNewFoodName("")
    setNewFoodCalories("")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Meu Plano de Dieta</h1>

      {/* Add Meal Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-6 w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Refeição
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Refeição</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="meal-name">Nome da Refeição</Label>
              <Input
                id="meal-name"
                value={newMealName}
                onChange={(e) => setNewMealName(e.target.value)}
                placeholder="Ex: Café da Manhã"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meal-time">Horário</Label>
              <Input
                id="meal-time"
                value={newMealTime}
                onChange={(e) => setNewMealTime(e.target.value)}
                placeholder="Ex: 08:00"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={handleAddMeal}>Adicionar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meals List */}
      <div className="grid gap-6">
        {meals.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhuma refeição adicionada ainda. Clique no botão acima para começar.
          </div>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>{meal.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">{meal.time}</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Foods List */}
                <div className="mb-4">
                  {meal.foods.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum alimento adicionado</p>
                  ) : (
                    <ul className="space-y-1">
                      {meal.foods.map((food) => (
                        <li key={food.id} className="flex justify-between text-sm">
                          <span>{food.name}</span>
                          {food.calories && <span>{food.calories} kcal</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Add Food Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setActiveMealId(meal.id)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar Alimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Alimento à {meal.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="food-name">Nome do Alimento</Label>
                        <Input
                          id="food-name"
                          value={newFoodName}
                          onChange={(e) => setNewFoodName(e.target.value)}
                          placeholder="Ex: Pão Integral"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="food-calories">Calorias (opcional)</Label>
                        <Input
                          id="food-calories"
                          type="number"
                          value={newFoodCalories}
                          onChange={(e) => setNewFoodCalories(e.target.value)}
                          placeholder="Ex: 120"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button onClick={handleAddFood}>Adicionar</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
