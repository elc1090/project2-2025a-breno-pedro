"use client"
import { useRouter } from "next/navigation"
import { useCreateNutritionPlan } from "@/hooks/useNutritionPlan"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  only_logging: z.boolean().default(false),
  goal_energy: z.number().nullable(),
  goal_protein: z.number().nullable(),
  goal_carbohydrates: z.number().nullable(),
  goal_fat: z.number().nullable(),
  goal_fiber: z.number().nullable(),
})

export default function CreateNutritionPlan() {
  const router = useRouter()
  const createNutritionPlan = useCreateNutritionPlan()

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      only_logging: false,
      goal_energy: null,
      goal_protein: null,
      goal_carbohydrates: null,
      goal_fat: null,
      goal_fiber: null,
    },
  })

  // Handle form submission
  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    createNutritionPlan.mutate(data, {
      onSuccess: () => {
        alert("Plano de nutrição criado com sucesso!")
      }
    })
  }

  return (
    <div className="container max-w-3xl py-10">
      <Link href={"/"}>
        <Button>
          <ArrowLeft />
          Voltar
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create Nutrition Plan</CardTitle>
          <CardDescription>Create a new nutrition plan with specific goals and requirements.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter a description for your nutrition plan" {...field} />
                    </FormControl>
                    <FormDescription>Describe the purpose and goals of this nutrition plan.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="only_logging"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Logging Only</FormLabel>
                      <FormDescription>Enable if this plan is only for logging without specific goals.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="goal_energy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energy Goal (kcal)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter energy goal"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal_protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein Goal (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter protein goal"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal_carbohydrates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates Goal (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter carbohydrates goal"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal_fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat Goal (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fat goal"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goal_fiber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiber Goal (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter fiber goal"
                          {...field}
                          value={field.value === null ? "" : field.value}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : Number(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={createNutritionPlan.isPending}>
                  {createNutritionPlan.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Nutrition Plan"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
