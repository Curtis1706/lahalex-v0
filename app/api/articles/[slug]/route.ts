import { NextRequest, NextResponse } from "next/server"
import { loadArticle } from "@/lib/file-manager"
import { processMarkdownContent, cleanRawText } from "@/lib/text-processor"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = await params
    const article = await loadArticle(slug)

    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    const htmlContent = await processMarkdownContent(article.content)
    const textContent = cleanRawText(article.content)

    return NextResponse.json({
      article: {
        ...article.metadata,
        content: htmlContent,
        textContent
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}


