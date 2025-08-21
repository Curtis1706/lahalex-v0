import { NextRequest, NextResponse } from 'next/server'
import { DocumentParser } from '@/lib/document-parser'
import { DocumentManager } from '@/lib/document-manager'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type doit être multipart/form-data' },
        { status: 400 }
      )
    }
    
    const formData = await request.formData()
    const markdownFile = formData.get('markdown') as File
    const metadataFile = formData.get('metadata') as File

    if (!markdownFile || !metadataFile) {
      return NextResponse.json(
        { error: 'Fichiers markdown et metadata requis' },
        { status: 400 }
      )
    }

    // Lire les fichiers
    const [markdownContent, metadataContent] = await Promise.all([
      markdownFile.text(),
      metadataFile.text()
    ])

    const metadata = JSON.parse(metadataContent)

    // Parser automatiquement le document
    console.log(`📖 Parsing du document: ${metadata.title}`)
    const parsedDocument = DocumentParser.parseDocument(
      markdownContent,
      metadata.slug || metadata.id,
      metadata.title
    )

    // Enrichir avec les métadonnées existantes
    parsedDocument.metadata.description = metadata.description || parsedDocument.metadata.description
    parsedDocument.metadata.publishedDate = metadata.publishedAt
    parsedDocument.metadata.source = metadata.source

    // PRÉSERVER LE TYPE FOURNI dans le JSON au lieu de la détection automatique
    if (metadata.type) {
      parsedDocument.metadata.type = metadata.type
    }

    // Sauvegarder dans la nouvelle structure
    await DocumentManager.saveDocument(parsedDocument)

    console.log(`✅ Document sauvegardé: ${parsedDocument.articles.length} articles créés`)

    return NextResponse.json({
      success: true,
      document: {
        id: parsedDocument.metadata.id,
        title: parsedDocument.metadata.title,
        articlesCount: parsedDocument.articles.length,
        sectionsCount: parsedDocument.metadata.structure.sections.length
      }
    })

  } catch (error) {
    console.error('Erreur upload document:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du document' },
      { status: 500 }
    )
  }
}

