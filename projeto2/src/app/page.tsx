"use client"

import { useExercicios } from "@/hooks/useExercicios"
import { useIngredients } from "@/hooks/useIngredients"

export default function PaginaExercicios() {
  const { data, isLoading, error } = useExercicios()

  if (isLoading) return <p>Carregando exercícios...</p>
  if (error) return <p>Erro ao carregar exercícios.</p>

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Exercícios</h1>
      <ul className="space-y-4">
        {data.map((item: any) => (
          <div key={item.id} className="border rounded p-4">
            <h2 className="font-semibold text-lg">id: {item.id}</h2>
            <p className="text-sm text-gray-500">
              Musculo: {item.muscles || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Autor: <span> {item.license_author} </span>
            </p>
          </div>
        ))}
      </ul>
    </div>
  )
}
