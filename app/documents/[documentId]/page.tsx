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

  const firstArticleId = findFirstArticle()
  if (firstArticleId) {
    redirect(`/documents/${documentId}/${firstArticleId}`)
  }

  // Sinon, rediriger vers la première section principale
  const firstSection = document.structure.sections.find(section => 
    ['livre', 'titre', 'chapitre', 'section'].includes(section.type)
  )
  
  if (firstSection) {
    redirect(`/documents/${documentId}/${firstSection.id}`)
  }

  redirect('/404')
}



