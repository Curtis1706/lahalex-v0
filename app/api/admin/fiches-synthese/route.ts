import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import { join } from "path"

const FICHES_DIR = join(process.cwd(), "content", "documents", "fiches-synthese")

interface FicheSynthese {
  id: string
  title: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
}

// Créer le dossier s'il n'existe pas
async function ensureFichesDirectory() {
  try {
    await fs.access(FICHES_DIR)
  } catch {
    await fs.mkdir(FICHES_DIR, { recursive: true })
  }
}

// Générer un ID unique basé sur le titre
function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '')
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await ensureFichesDirectory()

    const entries = await fs.readdir(FICHES_DIR, { withFileTypes: true })
    const fiches: FicheSynthese[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metadataPath = join(FICHES_DIR, entry.name, 'metadata.json')
          const metadataContent = await fs.readFile(metadataPath, 'utf-8')
          const metadata = JSON.parse(metadataContent)
          
          // Créer l'objet fiche pour l'affichage
          const fiche: FicheSynthese = {
            id: metadata.id,
            title: metadata.title,
            description: metadata.description,
            content: "", // On ne charge pas le contenu complet pour la liste
            createdAt: metadata.publishedDate || new Date().toISOString(),
            updatedAt: metadata.publishedDate || new Date().toISOString()
          }
          fiches.push(fiche)
        } catch (error) {
                     console.error(`Erreur lecture fiche de méthode ${entry.name}:`, error)
        }
      }
    }

    // Trier par date de création (plus récent en premier)
    fiches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ fiches })
  } catch (error) {
         console.error("Erreur lors de la récupération des fiches de méthode:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { title, description, content } = await request.json()

    if (!title?.trim() || !description?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires" }, { status: 400 })
    }

    await ensureFichesDirectory()

    const id = generateId(title)
    const now = new Date().toISOString()

    // Créer la structure de document compatible avec le système existant
    const documentMetadata = {
      id,
      title: title.trim(),
             type: "fiche-methode",
      description: description.trim(),
      publishedDate: now,
      structure: {
        sections: [
          {
            id: "section-principale",
            title: title.trim(),
            type: "section-synthese",
            level: 1,
            order: 0,
            path: ["section-principale"],
            children: []
          }
        ],
        totalArticles: 1
      }
    }

    // Créer l'article principal
    const articleMetadata = {
      id: "section-principale",
      title: title.trim(),
      type: "section-synthese",
      level: 1,
      order: 0,
      path: ["section-principale"],
      children: []
    }

    // Créer le dossier du document
    const documentDir = join(FICHES_DIR, id)
    await fs.mkdir(documentDir, { recursive: true })

    // Sauvegarder les métadonnées du document
    await fs.writeFile(
      join(documentDir, 'metadata.json'),
      JSON.stringify(documentMetadata, null, 2)
    )

    // Sauvegarder l'article principal
    await fs.writeFile(
      join(documentDir, 'section-principale.json'),
      JSON.stringify({
        metadata: articleMetadata,
        content: content.trim()
      }, null, 2)
    )

    // Créer l'objet fiche pour la réponse
    const fiche: FicheSynthese = {
      id,
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now
    }

    return NextResponse.json({ 
      success: true, 
      fiche,
             message: "Fiche de méthode créée avec succès" 
    })
  } catch (error) {
         console.error("Erreur lors de la création de la fiche de méthode:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
