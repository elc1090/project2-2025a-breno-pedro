"use client"

import { useState, useEffect } from "react"
import { useIngredientSuggestion } from "@/hooks/useIngredientSuggestion"
import { useIngredientDetails } from "@/hooks/useIngredientDetails"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, ArrowUpDown, Plus, Search, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/loading-spinner"

interface MealItem {
  id: string
  name: string
  calories: number
  protein: number
  fat: number
  carbohydrates: number
  quantity: number
}

const safeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0
  if (typeof value === "number") return value < 0 ? 0 : value
  if (typeof value === "string") {
    if (value === "-" || value.trim() === "") return 0
    const num = Number.parseFloat(value)
    if (!isNaN(num)) return num < 0 ? 0 : num
  }

  return 0
}

export default function IngredientSearch() {
  const [query, setQuery] = useState("")
  const [meal, setMeal] = useState<MealItem[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("meal") || "[]")
    }
    return []
  })

  const [dailyGoal, setDailyGoal] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(
        localStorage.getItem("dailyGoal") || JSON.stringify({ calories: 2000, protein: 100, carbs: 250, fat: 70 }),
      )
    }
    return { calories: 2000, protein: 100, carbs: 250, fat: 70 }
  })

  const [totals, setTotals] = useState(() => {
    const t = meal.reduce(
      (acc, cur) => ({
        calories: acc.calories + cur.calories * cur.quantity,
        protein: acc.protein + cur.protein * cur.quantity,
        carbs: acc.carbs + cur.carbohydrates * cur.quantity,
        fat: acc.fat + cur.fat * cur.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
    return t
  })
  const [quantity, setQuantity] = useState(100)

  const { data: suggestions, isLoading: suggestionsLoading } = useIngredientSuggestion(query)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: selected, isLoading: detailsLoading, error: detailsError } = useIngredientDetails(selectedId ?? undefined, quantity)


  const addToMeal = (item: Omit<MealItem, "id" | "quantity">) => {
    const id = Date.now().toString()
    const newItem: MealItem = {
      ...item,
      id,
      quantity,
    }
    const updated = [...meal, newItem]
    setMeal(updated)

    if (typeof window !== "undefined") {
      localStorage.setItem("meal", JSON.stringify(updated))
    }

    setTotals({
      calories: totals.calories + item.calories * quantity,
      protein: totals.protein + item.protein * quantity,
      carbs: totals.carbs * quantity,
      fat: totals.fat * quantity,
    })

    setSelectedId(null)
    setQuantity(100)
    console.log("nome", item.name)
  }


  const removeFromMeal = (id: string) => {
    const itemToRemove = meal.find((item) => item.id === id)
    if (!itemToRemove) return

    const updated = meal.filter((item) => item.id !== id)
    setMeal(updated)

    if (typeof window !== "undefined") {
      localStorage.setItem("meal", JSON.stringify(updated))
    }

    setTotals({
      calories: totals.calories - itemToRemove.calories * itemToRemove.quantity,
      protein: totals.protein - itemToRemove.protein * itemToRemove.quantity,
      carbs: totals.carbs - itemToRemove.carbohydrates * itemToRemove.quantity,
      fat: totals.fat - itemToRemove.fat * itemToRemove.quantity,
    })
  }

  const clearMeal = () => {
    setMeal([])
    if (typeof window !== "undefined") {
      localStorage.setItem("meal", JSON.stringify([]))
    }
    setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return

    const updated = meal.map((item) => {
      if (item.id === id) {
        const diff = newQuantity - item.quantity
        setTotals({
          calories: totals.calories + item.calories * diff,
          protein: totals.protein + item.protein * diff,
          carbs: totals.carbs + item.carbohydrates * diff,
          fat: totals.fat + item.fat * diff,
        })

        return { ...item, quantity: newQuantity }
      }
      return item
    })

    setMeal(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("meal", JSON.stringify(updated))
    }
  }

  const calculatePercentage = (value: number, goal: number) => {
    return Math.min(Math.round((value / goal) * 100), 100)
  }

  const formatNutritionalValue = (value: any, unit = "g"): string => {
    const num = safeNumber(value)
    return `${num.toFixed(1)} ${unit}`
  }

  const [favorites, setFavorites] = useState<MealItem[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("favorites") || "[]")
    }
    return []
  })

  const addToFavorites = (item: Omit<MealItem, "id" | "quantity">) => {
    const id = Date.now().toString()
    const newFavorite: MealItem = {
      ...item,
      id,
      quantity: 100,
    }
    const updatedFavorites = [...favorites, newFavorite]
    setFavorites(updatedFavorites)

    if (typeof window !== "undefined") {
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    }
  }


  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agenda de Nutrição</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Digite o nome do alimento"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Metas</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Definir Metas Diárias</SheetTitle>
                  <SheetDescription>Configure suas metas nutricionais diárias</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Calorias: {dailyGoal.calories} kcal</h3>
                    <Slider
                      value={[dailyGoal.calories]}
                      min={1000}
                      max={4000}
                      step={50}
                      onValueChange={(value) => setDailyGoal({ ...dailyGoal, calories: value[0] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Proteínas: {dailyGoal.protein} g</h3>
                    <Slider
                      value={[dailyGoal.protein]}
                      min={30}
                      max={200}
                      step={5}
                      onValueChange={(value) => setDailyGoal({ ...dailyGoal, protein: value[0] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Carboidratos: {dailyGoal.carbs} g</h3>
                    <Slider
                      value={[dailyGoal.carbs]}
                      min={50}
                      max={400}
                      step={10}
                      onValueChange={(value) => setDailyGoal({ ...dailyGoal, carbs: value[0] })}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Gorduras: {dailyGoal.fat} g</h3>
                    <Slider
                      value={[dailyGoal.fat]}
                      min={20}
                      max={150}
                      step={5}
                      onValueChange={(value) => setDailyGoal({ ...dailyGoal, fat: value[0] })}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>


          {/* Sugestões */}
          {query && (
            <>
              {suggestionsLoading ? (
                <LoadingSpinner className="my-6" />
              ) : suggestions && suggestions.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-3 gap-2 mb-6 max-h-68 overflow-y-auto">
                  {suggestions.map((sug) => (
                    <Button
                      key={sug.data.id}
                      variant="outline"
                      className="min-h-[80px] justify-start flex items-center gap-4"
                      onClick={() => setSelectedId(sug.data.id)}
                    >
                      {sug.data.image && (
                        <img
                          src={`https://wger.de${sug.data.image}`}
                          alt="Imagem do ingrediente"
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <span>{sug.value}</span>
                    </Button>
                  ))}
                </div>

              ) : (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhum resultado</AlertTitle>
                  <AlertDescription>
                    Nenhum alimento encontrado com os critérios de busca.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}


          {/* Detalhes do alimento */}
          {selectedId && (
            <>
              {detailsLoading ? (
                <Card className="mb-6">
                  <CardContent className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                  </CardContent>
                </Card>
              ) : selected ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{selected.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 md:flex-row gap-4 mb-4">
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-2xl font-bold">{safeNumber(selected.energy)}</div>
                        <div className="text-xs text-muted-foreground">Calorias (kcal)</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-2xl font-bold">{formatNutritionalValue(selected.protein)}</div>
                        <div className="text-xs text-muted-foreground">Proteínas (g)</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-2xl font-bold">{formatNutritionalValue(selected.carbohydrates)}</div>
                        <div className="text-xs text-muted-foreground">Carboidratos (g)</div>
                      </div>
                      <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                        <div className="text-2xl font-bold">{formatNutritionalValue(selected.fat)}</div>
                        <div className="text-xs text-muted-foreground">Gorduras (g)</div>
                      </div>
                      {selected.fiber !== undefined && (
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="text-2xl font-bold">{formatNutritionalValue(selected.fiber)}</div>
                          <div className="text-xs text-muted-foreground">Fibras (g)</div>
                        </div>
                      )}
                      {selected.sodium !== undefined && (
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="text-2xl font-bold">{formatNutritionalValue(selected.sodium, "mg")}</div>
                          <div className="text-xs text-muted-foreground">Sódio (mg)</div>
                        </div>
                      )}

                      {/* Adicionar novos campos nutricionais */}
                      {selected.carbohydrates_sugar !== undefined && (
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="text-2xl font-bold">
                            {formatNutritionalValue(selected.carbohydrates_sugar)}
                          </div>
                          <div className="text-xs text-muted-foreground">Açúcares (g)</div>
                        </div>
                      )}
                      {selected.fat_saturated !== undefined && (
                        <div className="text-center p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <div className="text-2xl font-bold">{formatNutritionalValue(selected.fat_saturated)}</div>
                          <div className="text-xs text-muted-foreground">Gorduras Saturadas (g)</div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm mb-1 block">Quantidade em gramas</label>
                        <Input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-24 text-center"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          className="flex gap-2"
                          onClick={() => {
                            addToMeal({
                              name: selected.name,
                              calories: safeNumber(selected.energy),
                              protein: safeNumber(selected.protein),
                              fat: safeNumber(selected.fat),
                              carbohydrates: safeNumber(selected.carbohydrates),
                            })
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar à Refeição
                        </Button>

                        <Button
                          variant="outline"
                          className="flex gap-2"
                          onClick={() => {
                            addToFavorites({
                              name: selected.name,
                              calories: safeNumber(selected.energy),
                              protein: safeNumber(selected.protein),
                              fat: safeNumber(selected.fat),
                              carbohydrates: safeNumber(selected.carbohydrates),
                            })
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar aos Favoritos
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Alert className="mb-6" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>
                    {detailsError ? detailsError.message : "Não foi possível carregar os detalhes deste alimento."}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <Tabs defaultValue="meal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="meal">Refeição</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
              <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            </TabsList>


            <TabsContent value="meal" className="mt-4">
              {meal.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Alimentos Adicionados</h3>
                    <Button variant="outline" onClick={clearMeal} className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar
                    </Button>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">
                            <div className="font-medium">
                              Nome
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="font-medium">
                              Calorias
                            </div>
                          </TableHead>
                          <TableHead>Qtd</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meal.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.calories} kcal</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="w-8 text-center">{item.quantity}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => removeFromMeal(item.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum alimento adicionado à refeição</div>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="mt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Calorias</span>
                    <span className="text-sm">
                      {totals.calories.toFixed(2)} / {dailyGoal.calories} kcal
                    </span>
                  </div>
                  <Progress value={calculatePercentage(totals.calories, dailyGoal.calories)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Proteínas</span>
                    <span className="text-sm">
                      {totals.protein.toFixed(2)} / {dailyGoal.protein} g
                    </span>
                  </div>
                  <Progress value={calculatePercentage(totals.protein, dailyGoal.protein)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Carboidratos</span>
                    <span className="text-sm">
                      {totals.carbs.toFixed(2)} / {dailyGoal.carbs} g
                    </span>
                  </div>
                  <Progress value={calculatePercentage(totals.carbs, dailyGoal.carbs)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Gorduras</span>
                    <span className="text-sm">
                      {totals.fat.toFixed(2)} / {dailyGoal.fat} g
                    </span>
                  </div>
                  <Progress value={calculatePercentage(totals.fat, dailyGoal.fat)} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{totals.calories.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Calorias (kcal)</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{totals.protein.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Proteínas (g)</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{totals.carbs.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Carboidratos (g)</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{totals.fat.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Gorduras (g)</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-4">
              {favorites.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Nome</TableHead>
                        <TableHead>Calorias (100g)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {favorites.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.calories} kcal</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum favorito ainda</div>
              )}
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
