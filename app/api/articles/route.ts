import { NextRequest, NextResponse } from "next/server"
import { listAllArticles, loadArticle } from "@/lib/file-manager"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "publishedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const articleSlugs = await listAllArticles()
    const allArticles = []

    for (const slug of articleSlugs) {
      const article = await loadArticle(slug)
      if (article) {
        allArticles.push(article.metadata)
      }
    }

    // Filtrage par catégorie
    let filteredArticles = allArticles
    if (category && category !== "all") {
      filteredArticles = filteredArticles.filter(article => 
        article.category.slug === category
      )
    }

    // Filtrage par recherche
    if (search) {
      const searchLower = search.toLowerCase()
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.description.toLowerCase().includes(searchLower) ||
        (article.tags && article.tags.some(tag => 
          tag.name.toLowerCase().includes(searchLower)
        ))
      )
    }

    // Tri
    filteredArticles.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a]
      const bValue = b[sortBy as keyof typeof b]
      
      if (sortOrder === "desc") {
        return String(bValue).localeCompare(String(aValue))
      } else {
        return String(aValue).localeCompare(String(bValue))
      }
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

    return NextResponse.json({
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total: filteredArticles.length,
        pages: Math.ceil(filteredArticles.length / limit),
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}


