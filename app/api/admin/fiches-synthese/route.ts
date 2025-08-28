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
  // Créer un slug de base à partir du titre
  let baseId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '')
  
  // Ajouter un timestamp pour garantir l'unicité
  const timestamp = Date.now().toString(36)
  baseId = `${baseId}-${timestamp}`
  
  return baseId
}

// Fonction pour analyser le contenu et extraire les sections
function extractSections(content: string): Array<{id: string, title: string, content: string, order: number}> {
  const sections: Array<{id: string, title: string, content: string, order: number}> = []
  
  // Détecter les sections basées sur les titres en gras (**Titre**)
  // Pattern plus flexible pour capturer tous les titres en gras
  const boldPattern = /\*\*([^*]+?)\*\*/g
  let match
  let order = 0
  
  while ((match = boldPattern.exec(content)) !== null) {
    const title = match[1].trim()
    if (title && title.length > 3) {
      // Créer un ID unique pour la section
      const id = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-|-$/g, '')
      
      // Extraire le contenu de cette section (jusqu'au prochain titre)
      const startIndex = match.index
      const nextMatch = boldPattern.exec(content)
      const endIndex = nextMatch ? nextMatch.index : content.length
      
      let sectionContent = content.substring(startIndex, endIndex).trim()
      
      // Nettoyer le contenu (enlever le titre en gras)
      sectionContent = sectionContent.replace(/^\*\*[^*]+?\*\*\s*/, '').trim()
      
      sections.push({
        id,
        title,
        content: sectionContent,
        order: order++
      })
    }
  }
  
  return sections
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

    // Extraire les sections du contenu
    const sections = extractSections(content)
    
    if (sections.length === 0) {
      return NextResponse.json({ error: "Aucune section détectée dans le contenu" }, { status: 400 })
    }

    // Créer la structure de document avec toutes les sections
    const documentMetadata = {
      id,
      title: title.trim(),
      type: "fiche-methode",
      description: description.trim(),
      publishedDate: now,
      structure: {
        sections: sections.map(section => ({
          id: section.id,
          title: section.title,
          type: "section-synthese",
          level: 1,
          order: section.order,
          path: [section.id],
          children: []
        })),
        totalArticles: sections.length
      }
    }

    // Créer le dossier du document
    const documentDir = join(FICHES_DIR, id)
    await fs.mkdir(documentDir, { recursive: true })

    // Sauvegarder les métadonnées du document
    await fs.writeFile(
      join(documentDir, 'metadata.json'),
      JSON.stringify(documentMetadata, null, 2)
    )

    // Créer un fichier pour chaque section
    for (const section of sections) {
      const articleMetadata = {
        id: section.id,
        title: section.title,
        type: "section-synthese",
        level: 1,
        order: section.order,
        path: [section.id],
        children: []
      }

      await fs.writeFile(
        join(documentDir, `${section.id}.json`),
        JSON.stringify({
          metadata: articleMetadata,
          content: section.content
        }, null, 2)
      )
    }

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
      message: `Fiche de méthode créée avec succès (${sections.length} sections détectées)`,
      sections: sections.map(s => ({ id: s.id, title: s.title }))
    })
  } catch (error) {
    console.error("Erreur lors de la création de la fiche de méthode:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
