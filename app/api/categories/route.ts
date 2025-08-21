import { NextRequest, NextResponse } from "next/server"
import { listAllArticles, loadArticle } from "@/lib/file-manager"

export async function GET(request: NextRequest) {
  try {
    const articleSlugs = await listAllArticles()
    const categoryStats = new Map<string, { category: any, count: number, children: Map<string, { category: any, count: number }> }>()

    for (const slug of articleSlugs) {
      const article = await loadArticle(slug)
      if (article) {
        const category = article.metadata.category
        
        if (!categoryStats.has(category.slug)) {
          categoryStats.set(category.slug, {
            category,
            count: 0,
            children: new Map()
          })
        }
        
        const categoryData = categoryStats.get(category.slug)!
        categoryData.count++

        // Gérer les sous-catégories si elles existent
        if (article.metadata.subcategories) {
          for (const subcategory of article.metadata.subcategories) {
            if (!categoryData.children.has(subcategory.slug)) {
              categoryData.children.set(subcategory.slug, {
                category: subcategory,
                count: 0
              })
            }
            categoryData.children.get(subcategory.slug)!.count++
          }
        }
      }
    }

    const categories = Array.from(categoryStats.entries()).map(([slug, data]) => ({
      ...data.category,
      count: data.count,
      children: Array.from(data.children.values())
    }))

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

