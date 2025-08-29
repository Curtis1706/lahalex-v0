import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join } from "path"

const FICHES_DIR = join(process.cwd(), "content", "documents", "fiches-synthese")

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = params
    const documentDir = join(FICHES_DIR, id)

    // Vérifier si le dossier existe
    try {
      await fs.access(documentDir)
    } catch {
      return NextResponse.json({ error: "Fiche de synthèse non trouvée" }, { status: 404 })
    }

    // Supprimer le dossier et tout son contenu
    await fs.rm(documentDir, { recursive: true, force: true })

    return NextResponse.json({ 
      success: true, 
      message: "Fiche de synthèse supprimée avec succès" 
    })
  } catch (error) {
    console.error("Erreur lors de la suppression de la fiche de synthèse:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
