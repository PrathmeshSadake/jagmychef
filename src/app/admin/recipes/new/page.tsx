import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RecipeForm } from "@/components/recipe-form"

export default function NewRecipePage() {
  return (
    <div className="container py-10">
      <div className="mb-6">
        <Link href="/admin" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Recipe</h1>
          <p className="text-muted-foreground mt-1">Create a new recipe with ingredients and instructions.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <RecipeForm />
      </div>
    </div>
  )
}

