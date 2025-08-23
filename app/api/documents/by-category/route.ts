import { NextRequest, NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    
    if (!category) {
      return NextResponse.json({ error: 'Catégorie requise' }, { status: 400 })
    }
    
    const allDocuments = await DocumentManager.listAllDocuments()
    
    const filteredDocuments = allDocuments
      .filter(doc => {
        const docCategory = doc.type?.toLowerCase().replace(/\s+/g, '-')
        const matchesCategory = docCategory === category
        
        // Debug temporaire
        console.log('🔍 Debug filtrage:', {
          docId: doc.id,
          docType: doc.type,
          docCategory,
          requestedCategory: category,
          matches: matchesCategory
        })
        
        if (source && matchesCategory) {
          // Pour les fiches de synthèse, pas de filtrage par source spécifique
          if (category === 'fiche-synthese') {
            return true
          }
          
          const docSource = doc.source?.toLowerCase()
          return docSource === source
        }
        
        return matchesCategory
      })
      .map(doc => ({
        id: doc.id,
        title: doc.title,
        subject: doc.description,
        document_type: doc.type,
        filename: doc.id,
        created_at: doc.publishedDate || new Date().toISOString(),
        estimated_reading_time: Math.ceil((doc.structure?.totalArticles || 1) * 2),
        num_pages: doc.structure?.totalArticles || 0
      }))
    
    return NextResponse.json({ success: true, documents: filteredDocuments })
  } catch (error) {
    console.error('Erreur documents par catégorie:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}



