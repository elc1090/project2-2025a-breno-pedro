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
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react";

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
  const [meal, setMeal] = useState<MealItem[]>([]); 
  const [isMealLoading, setIsMealLoading] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMeal = localStorage.getItem("meal");
      const loadedMeal = storedMeal ? JSON.parse(storedMeal) : [];
      setMeal(loadedMeal);
  
      const newTotals = loadedMeal.reduce(
        (acc, cur) => ({
          calories: acc.calories + safeNumber(cur.calories),
          protein: acc.protein + safeNumber(cur.protein),
          carbs: acc.carbs + safeNumber(cur.carbohydrates),
          fat: acc.fat + safeNumber(cur.fat),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      );
      setTotals(newTotals);
    }
    setIsMealLoading(false);
  }, []);

  const [mealName, setMealName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mealName") || "";
    }
    return "";
  });

  const [isMealSaved, setIsMealSaved] = useState(false);

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
        calories: acc.calories + cur.calories,
        protein: acc.protein + cur.protein,
        carbs: acc.carbs + cur.carbohydrates,
        fat: acc.fat + cur.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
    return t
  })
  const [quantity, setQuantity] = useState(100)

  const { data: suggestions, isLoading: suggestionsLoading } = useIngredientSuggestion(query)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: selected, isLoading: detailsLoading, error: detailsError } = useIngredientDetails(selectedId ?? undefined, quantity)

  const [savedMealsList, setSavedMealsList] = useState<any[]>([]);

  useEffect(() => {
    const storedMeals = localStorage.getItem('savedMeals');
    if (storedMeals) {
      setSavedMealsList(JSON.parse(storedMeals));
    }
  }, []);

  const addToMeal = (item: Omit<MealItem, "id" | "quantity"> & { quantity?: number }) => {
    const id = Date.now().toString();
    const newItem: MealItem = {
      ...item,
      id,
      quantity: item.quantity !== undefined ? safeNumber(item.quantity) : quantity, // Usa a quantidade do favorito se existir, senão usa a quantidade padrão
    };
    const updated = [...meal, newItem];
    setMeal(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("meal", JSON.stringify(updated));
    }

    setTotals((prevTotals) => ({
      calories: prevTotals.calories + safeNumber(item.calories),
      protein: prevTotals.protein + safeNumber(item.protein),
      carbs: prevTotals.carbs + safeNumber(item.carbohydrates),
      fat: prevTotals.fat + safeNumber(item.fat),
    }));

    setSelectedId(null);
    setQuantity(100);
    console.log("nome", item.name);
  };

  const removeFromMeal = (id: string) => {
    const itemToRemove = meal.find((item) => item.id === id)
    if (!itemToRemove) return

    const updated = meal.filter((item) => item.id !== id)
    setMeal(updated)

    if (typeof window !== "undefined") {
      localStorage.setItem("meal", JSON.stringify(updated))
    }

    setTotals({
      calories: totals.calories - itemToRemove.calories,
      protein: totals.protein - itemToRemove.protein,
      carbs: totals.carbs - itemToRemove.carbohydrates,
      fat: totals.fat - itemToRemove.fat,
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
    const normalized = Object.is(num, -0) ? 0 : num
    return `${num.toFixed(1)} ${unit}`
  }

  const [favoriteIngredients, setFavoriteIngredients] = useState<Omit<MealItem, "id" | "quantity">[]>(() => {
    if (typeof window !== "undefined") {
      const storedFavorites = localStorage.getItem("favoriteIngredients");
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    }
    return [];
  });

  const addToFavorites = (ingredient: Omit<MealItem, "id" | "quantity">) => {
    const isAlreadyFavorite = favoriteIngredients.some(fav => fav.name === ingredient.name);
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favoriteIngredients, { ...ingredient, quantity: safeNumber(quantity) }]; // Inclui a quantidade atual
      setFavoriteIngredients(updatedFavorites);
      if (typeof window !== "undefined") {
        localStorage.setItem("favoriteIngredients", JSON.stringify(updatedFavorites));
      }
    } else {
      alert(`"${ingredient.name}" já está nos seus favoritos!`);
    }
  };

  const removeFromFavorites = (ingredientToRemove: Omit<MealItem, "id" | "quantity">) => {
    const updatedFavorites = favoriteIngredients.filter(fav => fav.name !== ingredientToRemove.name);
    setFavoriteIngredients(updatedFavorites);
    if (typeof window !== "undefined") {
      localStorage.setItem("favoriteIngredients", JSON.stringify(updatedFavorites));
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mealName", mealName);
    }
  }, [mealName]);

  const saveMeal = () => {
    if (meal.length > 0 && mealName.trim() !== "") {
      const totalGrams = meal.reduce((sum, item) => {
        return sum + safeNumber(item.quantity);
      }, 0);
      console.log("Total de gramas calculado:", totalGrams);      const savedMeals = JSON.parse(localStorage.getItem("savedMeals") || "[]");
      const newMeal = {
        name: mealName.trim(),
        items: meal.map(item => ({ ...item })),
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalGrams: totalGrams, 
        savedAt: new Date().toISOString(),
      };
      const updatedSavedMeals = [...savedMeals, newMeal];
      localStorage.setItem("savedMeals", JSON.stringify(updatedSavedMeals));
      setSavedMealsList(updatedSavedMeals);
      setIsMealSaved(true);
      setTimeout(() => setIsMealSaved(false), 3000);
      setMeal([]);
      setMealName("");
      setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      localStorage.setItem("meal", JSON.stringify([]));
    } else {
      alert("Por favor, adicione pelo menos um item à refeição e dê um nome a ela.");
    }
  };

  const handleDeleteSavedMeal = (indexToDelete) => {
    setSavedMealsList(prevMeals => {
      const updatedMeals = prevMeals.filter((_, index) => index !== indexToDelete);
      localStorage.setItem('savedMeals', JSON.stringify(updatedMeals)); // Atualiza o localStorage
      return updatedMeals;
    });
  };

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
                          <TableHead>Quantidade</TableHead>
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
                                <span className="w-8 text-center">{item.quantity} g</span>
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
            <TabsContent value="meal" className="mt-4">
            <div className="mb-4">
              <Label htmlFor="meal-name-input" className="mb-2">Nome da Refeição:</Label>
              <Input
                type="text"
                id="meal-name-input"
                placeholder="Ex: Almoço de Quarta"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>
          </TabsContent>
          <Button
            onClick={saveMeal}
            disabled={meal.length === 0 || mealName.trim() === ""}
            className="mb-4"
          >
            Salvar Refeição
          </Button>
          {isMealSaved && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Refeição Salva!</AlertTitle>
            </Alert>
          )}
          <TabsContent value="favorites" className="mt-4">
          {favoriteIngredients.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {favoriteIngredients.map((favorite) => (
                <Card key={favorite.name}>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold">{favorite.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromFavorites(favorite)}
                        className="hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Calorias: {safeNumber(favorite.calories)} kcal, Proteínas: {formatNutritionalValue(favorite.protein)}, Carboidratos: {formatNutritionalValue(favorite.carbohydrates)}, Gorduras: {formatNutritionalValue(favorite.fat)}
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => addToMeal(favorite)}>
                        Selecionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nenhum alimento adicionado aos favoritos ainda.</div>
          )}
        </TabsContent>
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Refeições Salvas</h2>
            {savedMealsList.length > 0 ? (
              <div className="space-y-4">
                {savedMealsList.map((savedMeal, index) => (
                  <div key={index} className="rounded-md border p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold">{savedMeal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Salvo em: {new Date(savedMeal.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedMeal(index)}
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 5a1.5 1.5 0 0 0-1.5-1.5H9A1.5 1.5 0 0 0 7.5 5v1.5h9V5Zm-9 3a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V9a1.5 1.5 0 0 0-1.5-1.5h-9Zm4.5 2.5a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1Zm3 0a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0v-3a1 1 0 0 1 1-1Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="py-2 font-medium text-left">Nome</th>
                            <th className="py-2 font-medium text-left">Calorias</th>
                            <th className="py-2 font-medium text-left">Quantidade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {savedMeal.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-1">{item.name}</td>
                              <td className="py-1">{item.calories.toFixed(2)} kcal</td>
                              <td className="py-1">{item.quantity.toFixed(2)} g</td>
                            </tr>
                          ))}
                          <tr className="font-bold">
                            <td className="py-2">Totais:</td>
                            <td className="py-2">{savedMeal.totalCalories.toFixed(2)} kcal</td>
                            <td className="py-2">{savedMeal.totalGrams.toFixed(2)} g</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">Não há refeições salvas ainda</div>
            )}
          </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
