import { redirect } from 'next/navigation'
import { DocumentManager } from '@/lib/document-manager'

interface DocumentPageProps {
  params: Promise<{ documentId: string }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { documentId } = await params
  const document = await DocumentManager.loadDocument(documentId)

  if (!document) {
    redirect('/404')
  }

  // Vérification de sécurité pour document.type
  if (!document.type) {
    console.error('Document invalide:', document)
    redirect('/404')
  }

  console.log('🔍 Document chargé:', {
    id: document.id,
    type: document.type,
    sections: document.structure.sections.map(s => ({ id: s.id, type: s.type, title: s.title }))
  })

  // Fonction pour trouver le premier article logique
  const findFirstArticle = () => {
    // 1. Chercher "article-1er-" ou "article-1-"
    const firstArticleVariants = ['article-1er-', 'article-1-', 'article-premier-']
    for (const variant of firstArticleVariants) {
      const found = document.structure.sections.find(s => s.id === variant) ||
                   document.structure.sections.find(s => s.children.includes(variant))
      if (found) return variant
    }

    // 2. Chercher le premier article dans les enfants des sections
    for (const section of document.structure.sections) {
      const firstChild = section.children.find(child => child.startsWith('article-'))
      if (firstChild) return firstChild
    }

    // 3. Chercher le premier article direct
    const firstArticle = document.structure.sections.find(s => s.type === 'article')
    if (firstArticle) return firstArticle.id

    return null
  }

  // Fonction pour trouver la première section de fiche de synthèse
  const findFirstFicheSection = () => {
    // Pour les fiches de synthèse, chercher la première section après la section principale
    if (document.type === 'fiche-synthese') {
      console.log('🔍 Recherche section fiche de synthèse...')
      const sections = document.structure.sections.filter(s => s.type === 'section-synthese')
      console.log('🔍 Sections trouvées:', sections.map(s => ({ id: s.id, title: s.title })))
      
      // Retourner la première section (après la section principale)
      if (sections.length > 1) {
        const firstSection = sections[1] // sections[0] est la section principale
        console.log('🔍 Première section trouvée:', firstSection.id)
        return firstSection.id
      }
    }
    return null
  }

  const firstArticleId = findFirstArticle()
  if (firstArticleId) {
    console.log('🔍 Redirection vers article:', firstArticleId)
    redirect(`/documents/${documentId}/${firstArticleId}`)
  }

  // Pour les fiches de synthèse, essayer de trouver la première section
  const firstFicheSection = findFirstFicheSection()
  if (firstFicheSection) {
    console.log('🔍 Redirection vers section fiche:', firstFicheSection)
    redirect(`/documents/${documentId}/${firstFicheSection}`)
  }

  // Sinon, rediriger vers la première section principale
  const firstSection = document.structure.sections.find(section => 
    ['livre', 'titre', 'chapitre', 'section', 'section-synthese'].includes(section.type)
  )
  
  if (firstSection) {
    console.log('🔍 Redirection vers section principale:', firstSection.id)
    redirect(`/documents/${documentId}/${firstSection.id}`)
  }

  console.log('🔍 Aucune section trouvée, redirection vers 404')
  redirect('/404')
}



