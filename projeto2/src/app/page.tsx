"use client"

import { useNutritionPlan, useDeleteNutritionPlan } from "@/hooks/useNutritionPlan"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Plus, Trash } from "lucide-react"
import Link from "next/link"

export default function NutritionPlanList() {
  const { data: nutritionPlans, isLoading, error } = useNutritionPlan()
  const deletePlan = useDeleteNutritionPlan()

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
            <p className="text-red-500">
              Error loading nutrition plans: {error.message}
            </p>
          </CardContent>
        </Card>
      ) : nutritionPlans?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No nutrition plans found. Create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nutritionPlans.map((plan) => (
            <Link
              key={plan.id}
              href={`/nutrition-plan/${plan.id}`}
              className="block"
            >
              <Card className="cursor-pointer hover:shadow-lg">
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <CardTitle className="truncate">{plan.description}</CardTitle>
                    <CardDescription>
                      {plan.only_logging ? "Logging Only" : "With Goals"}
                    </CardDescription>
                  </div>
                  {/* botão de delete: interrompe a propagação para não navegar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      deletePlan.mutate(plan.id)
                    }}
                    disabled={deletePlan.isLoading}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {!plan.only_logging && (
                    <div className="space-y-2">
                      {plan.goal_energy != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Energy:</span>
                          <span>{plan.goal_energy} kcal</span>
                        </div>
                      )}
                      {/* repita para os outros objetivos... */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
