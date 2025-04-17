"use client"

import { useNutritionPlan } from "@/hooks/useNutritionPlan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"

export default function NutritionPlanList() {
  const { data: nutritionPlans, isLoading, error } = useNutritionPlan()

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nutrition Plans</h1>
        <Button asChild>
          <Link href="/nutrition-plan/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading nutrition plans: {error.message}</p>
          </CardContent>
        </Card>
      ) : nutritionPlans?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No nutrition plans found. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nutritionPlans?.map((plan) => (
            <Card key={plan.description}>
              <CardHeader>
                <CardTitle className="truncate">{plan.description}</CardTitle>
                <CardDescription>{plan.only_logging ? "Logging Only" : "With Nutritional Goals"}</CardDescription>
              </CardHeader>
              <CardContent>
                {!plan.only_logging && (
                  <div className="space-y-2">
                    {plan.goal_energy && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Energy:</span>
                        <span>{plan.goal_energy} kcal</span>
                      </div>
                    )}
                    {plan.goal_protein && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Protein:</span>
                        <span>{plan.goal_protein} g</span>
                      </div>
                    )}
                    {plan.goal_carbohydrates && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carbs:</span>
                        <span>{plan.goal_carbohydrates} g</span>
                      </div>
                    )}
                    {plan.goal_fat && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fat:</span>
                        <span>{plan.goal_fat} g</span>
                      </div>
                    )}
                    {plan.goal_fiber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fiber:</span>
                        <span>{plan.goal_fiber} g</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
