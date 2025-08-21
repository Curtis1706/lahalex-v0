import { NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'

export async function GET() {
  try {
    const documents = await DocumentManager.listAllDocuments()
    const counts: { [key: string]: number } = {}
    
    documents.forEach(doc => {
      const category = doc.type || 'autres'
      counts[category] = (counts[category] || 0) + 1
    })
    
    return NextResponse.json({ success: true, counts })
  } catch (error) {
    console.error('Erreur compteurs catégories:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

