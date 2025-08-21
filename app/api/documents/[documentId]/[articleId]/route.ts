import { NextRequest, NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string; articleId: string } }
) {
  try {
    const article = await DocumentManager.loadArticle(params.documentId, params.articleId)
    
    if (!article) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Erreur chargement article:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}