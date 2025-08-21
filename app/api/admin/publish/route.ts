import { NextRequest, NextResponse } from "next/server"
import { saveArticle } from "@/lib/file-manager"
import type { ArticleMetadata } from "@/types/article"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { markdownContent, metadata } = await request.json()

    if (!markdownContent || !metadata) {
      return NextResponse.json({ error: "Contenu Markdown et métadonnées requis" }, { status: 400 })
    }

    // Valider les métadonnées requises
    if (!metadata.slug || !metadata.title) {
      return NextResponse.json({ error: "Slug et titre requis dans les métadonnées" }, { status: 400 })
    }

    // Sauvegarder l'article
    await saveArticle(metadata.slug, metadata as ArticleMetadata, markdownContent)

    return NextResponse.json({ 
      success: true, 
      slug: metadata.slug,
      message: "Article publié avec succès" 
    })

  } catch (error: any) {
    console.error("Erreur lors de la publication:", error)
    return NextResponse.json({ 
      error: error.message || "Erreur lors de la publication" 
    }, { status: 500 })
  }
}