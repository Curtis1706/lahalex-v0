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

