import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { articleSlug, userId } = await request.json()

    // Vérifier que l'article existe dans le système de fichiers
    const { articleExists } = await import("@/lib/file-manager")
    if (!(await articleExists(articleSlug))) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 })
    }

    // Ajouter aux favoris
    const favorite = await prisma.favorite.create({
      data: {
        articleSlug,
        userId,
      },
    })

    return NextResponse.json({ success: true, favorite })
  } catch (error) {
    console.error("Erreur favoris:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { articleSlug, userId } = await request.json()

    await prisma.favorite.deleteMany({
      where: {
        articleSlug,
        userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression favori:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
