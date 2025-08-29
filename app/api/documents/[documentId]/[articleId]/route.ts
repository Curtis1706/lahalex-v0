import { NextRequest, NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string; articleId: string }> }
) {
  try {
    const { documentId, articleId } = await params
    const article = await DocumentManager.loadArticle(documentId, articleId)
    
    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Erreur chargement article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}