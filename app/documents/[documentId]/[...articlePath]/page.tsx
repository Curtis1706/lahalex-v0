import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DocumentManager } from '@/lib/document-manager'
import { processMarkdownContent } from '@/lib/text-processor'
import { DocumentReader } from '@/components/DocumentReader'

interface ArticlePageProps {
  params: Promise<{
    documentId: string
    articlePath: string[]
  }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { documentId, articlePath } = await params
  const articleId = articlePath[articlePath.length - 1]
  
  const [document, article] = await Promise.all([
    DocumentManager.loadDocument(documentId),
    DocumentManager.loadArticle(documentId, articleId)
  ])
  
  if (!document || !article) {
    return { title: 'Article non trouvé' }
  }

  return {
    title: `${article.metadata.title} - ${document.title} - LAHALEX`,
    description: article.content.substring(0, 160)
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { documentId, articlePath } = await params
  const articleId = articlePath[articlePath.length - 1]
  
  console.log('🔍 Article page accessed:', { documentId, articlePath, articleId })
  
  const [document, article, allArticles] = await Promise.all([
    DocumentManager.loadDocument(documentId),
    DocumentManager.loadArticle(documentId, articleId),
    DocumentManager.loadAllArticles(documentId)
  ])

  if (!document || !article) {
    console.log('🔍 Document or article not found:', { documentId, articleId })
    notFound()
  }

  console.log('🔍 Article loaded successfully:', article.metadata.title)

  const processedContent = await processMarkdownContent(article.content)

  return (
    <DocumentReader 
      document={document}
      article={article}
      processedContent={processedContent}
      allArticles={allArticles}
    />
  )
}
