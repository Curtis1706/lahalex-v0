import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'

export function cleanRawText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\n\s*\n\s*\n/g, "\n\n")
}

export interface StructuredArticle {
  id: string
  article: string
  content: string
  livre?: string
  titre?: string
  chapitre?: string
  section?: string
  paragraphe?: string
}

export async function processMarkdownContent(content: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)         // Support des tableaux et du markdown GitHub
    .use(remarkBreaks)      // Sauts de ligne simples convertis en <br>
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)         // Traitement du HTML brut pour les listes
    .use(rehypeSlug)        // Ajout d'id sur les titres
    .use(rehypeSanitize)    // Sécurisation du HTML généré
    .use(rehypeStringify)
    .process(content)
  
  return result.toString()
}

export function parseStructuredArticles(content: string): StructuredArticle[] {
  // Simple parser for articles - this is a basic implementation
  // You may need to adjust this based on your actual content structure
  const articles: StructuredArticle[] = []
  
  // Split content by article markers (adjust regex based on your format)
  const articleMatches = content.match(/Article\s+\d+[^\n]*/g) || []
  
  articleMatches.forEach((match, index) => {
    const articleNumber = match.match(/Article\s+(\d+)/)?.[1] || `${index + 1}`
    articles.push({
      id: `article-${articleNumber}`,
      article: match.trim(),
      content: `Contenu de l'article ${articleNumber}...`, // Placeholder content
      livre: "Livre I", // Placeholder
      titre: "Titre I" // Placeholder
    })
  })
  
  return articles
}

