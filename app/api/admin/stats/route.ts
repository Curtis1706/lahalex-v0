import { NextRequest, NextResponse } from "next/server"
import { listAllArticles, loadArticle } from "@/lib/file-manager"

export async function GET(request: NextRequest) {
  try {
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const articleSlugs = await listAllArticles()
    const categoryStats = new Map<string, number>()

    for (const slug of articleSlugs) {
      const article = await loadArticle(slug)
      if (article) {
        const catName = article.metadata.category.name
        categoryStats.set(catName, (categoryStats.get(catName) || 0) + 1)
      }
    }

    return NextResponse.json({
      totalArticles: articleSlugs.length,
      categories: Array.from(categoryStats.entries()).map(([name, count]) => ({
        name,
        count
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

