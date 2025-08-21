import { NextRequest, NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const document = await DocumentManager.loadDocument(params.documentId)
    
    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Erreur chargement document:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}