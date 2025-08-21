import type { ParsedDocument, DocumentSection, ArticleMetadata } from '@/types/document'

interface ParseContext {
  currentPath: string[]
  currentSection: DocumentSection | null
  sections: DocumentSection[]
  articles: Array<{ metadata: ArticleMetadata; content: string }>
  order: number
}

export class DocumentParser {
  private static readonly HIERARCHY_PATTERNS = [
    // LIVRES - niveau 1
    { pattern: /^\*\*(LIVRE)\s+(\d+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'livre', level: 1 },
    { pattern: /^(LIVRE)\s+(\d+)\s*[:\\]*\s*(.+)$/i, type: 'livre', level: 1 },
    
    // TITRES - niveau 2
    { pattern: /^\*\*(TITRE)\s+(\d+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'titre', level: 2 },
    { pattern: /^(TITRE)\s+(\d+)\s*[:\\]*\s*(.+)$/i, type: 'titre', level: 2 },
    
    // CHAPITRES - niveau 3
    { pattern: /^\*\*(CHAPITRE)\s+(\d+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'chapitre', level: 3 },
    { pattern: /^(CHAPITRE)\s+(\d+)\s*[:\\]*\s*(.+)$/i, type: 'chapitre', level: 3 },
    
    // SECTIONS - niveau 4
    { pattern: /^\*\*(SECTION)\s+(\d+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'section', level: 4 },
    { pattern: /^(SECTION)\s+(\d+)\s*[:\\]*\s*(.+)$/i, type: 'section', level: 4 },
    
    // SOUS-SECTIONS - niveau 5
    { pattern: /^\*\*(SOUS-SECTION)\s+(\d+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'sous-section', level: 5 },
    { pattern: /^(SOUS-SECTION)\s+(\d+)\s*[:\\]*\s*(.+)$/i, type: 'sous-section', level: 5 },
    
    // PARAGRAPHES - niveau 6
    { pattern: /^\*\*(PARAGRAPHE)\s+(\d+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'paragraphe', level: 6 },
    { pattern: /^(PARAGRAPHE)\s+(\d+)\s*[:\\]*\s*(.+)$/i, type: 'paragraphe', level: 6 },
    
    // ARTICLES - niveau dynamique (s'adapte au contexte)
    { pattern: /^\*\*(Article)\s+([^:*]+)\s*[:\\]*\s*(.+)\*\*$/i, type: 'article', level: 99 },
    { pattern: /^(Article)\s+([^:*]+)\s*[:\\]*\s*(.+)$/i, type: 'article', level: 99 }
  ]

  static parseDocument(content: string, documentId: string, title: string): ParsedDocument {
    console.log(`🔍 Parsing document: ${title}`)
    
    const lines = content.split('\n')
    const sectionsMap = new Map<string, DocumentSection>()
    const articles: Array<{ metadata: ArticleMetadata; content: string }> = []
    
    // Stack dynamique qui s'adapte au contenu
    const hierarchyStack: DocumentSection[] = []
    let currentArticleContent = ''
    let currentArticleMetadata: ArticleMetadata | null = null
    let order = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const hierarchyMatch = this.matchHierarchy(line)
      
      if (hierarchyMatch) {
        if (hierarchyMatch.type === 'article') {
          // Sauvegarder l'article précédent
          if (currentArticleMetadata && currentArticleContent) {
            articles.push({
              metadata: currentArticleMetadata,
              content: currentArticleContent.trim()
            })
          }
          
          // Créer le nouvel article
          const articleId = this.generateArticleId(hierarchyMatch.number)
          const currentPath = hierarchyStack.map(s => s.id)
          
          currentArticleMetadata = {
            id: articleId,
            title: hierarchyMatch.fullTitle,
            numero: hierarchyMatch.number,
            document: documentId,
            path: [...currentPath],
            navigation: {
              parent: hierarchyStack.length > 0 ? hierarchyStack[hierarchyStack.length - 1].id : documentId
            }
          }
          
          // Initialiser le contenu avec uniquement le texte après l'intitulé de l'article

currentArticleContent = (hierarchyMatch.title ? hierarchyMatch.title.replace(/^[:\s]+/, '') : '') + '\n'

          
          // AJOUTER L'ARTICLE COMME SECTION DANS LA STRUCTURE
          const articleSection: DocumentSection = {
            id: articleId,
            title: hierarchyMatch.fullTitle,
            type: 'article',
            level: hierarchyStack.length + 1, // Niveau dynamique basé sur la profondeur
            order: order++,
            path: [...currentPath],
            children: []
          }
          
          sectionsMap.set(articleId, articleSection)
          
          // Ajouter l'article à la section parente appropriée
          if (hierarchyStack.length > 0) {
            const parentSection = hierarchyStack[hierarchyStack.length - 1]
            if (!parentSection.children.includes(articleId)) {
              parentSection.children.push(articleId)
            }
          }
          
          console.log(`📄 Article: ${articleId} dans ${currentPath.join(' > ')}`)
        } else {
          // Sauvegarder l'article en cours
          if (currentArticleMetadata && currentArticleContent) {
            articles.push({
              metadata: currentArticleMetadata,
              content: currentArticleContent.trim()
            })
            currentArticleContent = ''
            currentArticleMetadata = null
          }
          
          // Traiter la section hiérarchique avec stack dynamique
          this.updateDynamicHierarchyStack(hierarchyMatch, hierarchyStack, sectionsMap, order++)
        }
      } else if (currentArticleMetadata) {
        currentArticleContent += line + '\n'
      }
    }

    // Sauvegarder le dernier article
    if (currentArticleMetadata && currentArticleContent) {
      articles.push({
        metadata: currentArticleMetadata,
        content: currentArticleContent.trim()
      })
      
      // AJOUTER AUSSI LE DERNIER ARTICLE À LA STRUCTURE
      const articleId = currentArticleMetadata.id
      const currentPath = hierarchyStack.map(s => s.id)
      
      const articleSection: DocumentSection = {
        id: articleId,
        title: currentArticleMetadata.title,
        type: 'article',
        level: hierarchyStack.length + 1,
        order: order++,
        path: [...currentPath],
        children: []
      }
      
      sectionsMap.set(articleId, articleSection)
      
      if (hierarchyStack.length > 0) {
        const parentSection = hierarchyStack[hierarchyStack.length - 1]
        if (!parentSection.children.includes(articleId)) {
          parentSection.children.push(articleId)
        }
      }
    }

    const sections = Array.from(sectionsMap.values())
    this.createNavigationLinks(articles)

    console.log(`🎯 Articles: ${articles.length}, Sections: ${sections.length}`)

    return {
      metadata: {
        id: documentId,
        title,
        type: this.detectDocumentType(title),
        description: `Document juridique: ${title}`,
        structure: { sections, totalArticles: articles.length }
      },
      articles
    }
  }

  private static matchHierarchy(line: string): any {
    for (const pattern of this.HIERARCHY_PATTERNS) {
      const match = line.match(pattern.pattern)
      if (match) {
        const result = {
          type: pattern.type,
          level: pattern.level,
          category: match[1],
          number: match[2],
          title: match[3] || '',
          fullTitle: line
        }
        console.log(`✅ Found match: ${result.type} - ${result.number} - "${line.substring(0, 100)}..."`)
        return result
      }
    }
    
    // Debug: afficher les lignes qui commencent par **Article mais ne matchent pas
    if (line.startsWith('**Article')) {
      console.log(`❌ Article non matché: "${line.substring(0, 100)}..."`)
    }
    
    return null
  }

  private static updateDynamicHierarchyStack(
    match: any, 
    hierarchyStack: DocumentSection[], 
    sectionsMap: Map<string, DocumentSection>, 
    order: number
  ) {
    const sectionId = this.generateSectionId(match.type, match.number)
    
    // Trouver le bon niveau dans le stack basé sur le type
    const targetLevel = match.level
    
    // Nettoyer le stack : garder seulement les niveaux supérieurs
    while (hierarchyStack.length > 0 && hierarchyStack[hierarchyStack.length - 1].level >= targetLevel) {
      hierarchyStack.pop()
    }
    
    if (!sectionsMap.has(sectionId)) {
      const currentPath = hierarchyStack.map(s => s.id)
      currentPath.push(sectionId)
      
      const section: DocumentSection = {
        id: sectionId,
        title: match.fullTitle,
        type: match.type,
        level: targetLevel,
        order,
        path: [...currentPath],
        children: []
      }

      // Ajouter comme enfant du parent direct
      if (hierarchyStack.length > 0) {
        const parent = hierarchyStack[hierarchyStack.length - 1]
        if (!parent.children.includes(sectionId)) {
          parent.children.push(sectionId)
        }
      }

      sectionsMap.set(sectionId, section)
      hierarchyStack.push(section)
      
      console.log(`📁 Section: ${sectionId} (niveau ${targetLevel}) dans ${currentPath.slice(0, -1).join(' > ')}`)
    }
  }

  private static getStackIndex(type: string): number {
    switch (type) {
      case 'livre': return 0
      case 'titre': return 1
      case 'chapitre': return 2
      case 'section': return 3
      case 'sous-section': return 4
      case 'paragraphe': return 5
      default: return -1
    }
  }

  private static buildCurrentPath(hierarchyStack: (DocumentSection | null)[]): string[] {
    return hierarchyStack
      .filter(section => section !== null)
      .map(section => section!.id)
  }

  private static findCurrentParentSection(hierarchyStack: (DocumentSection | null)[]): DocumentSection | null {
    for (let i = hierarchyStack.length - 1; i >= 0; i--) {
      if (hierarchyStack[i] !== null) {
        return hierarchyStack[i]
      }
    }
    return null
  }

  private static findCurrentParent(hierarchyStack: (DocumentSection | null)[]): string | null {
    const parent = this.findCurrentParentSection(hierarchyStack)
    return parent ? parent.id : null
  }

  private static createArticleMetadata(
    hierarchyMatch: any,
    documentId: string,
    context: ParseContext
  ): ArticleMetadata {
    const articleId = this.generateArticleId(hierarchyMatch.number)
    
    return {
      id: articleId,
      title: hierarchyMatch.fullTitle,
      numero: hierarchyMatch.number,
      document: documentId,
      path: [...context.currentPath],
      navigation: {
        parent: context.currentSection?.id || documentId
      }
    }
  }

  private static createNavigationLinks(articles: Array<{ metadata: ArticleMetadata; content: string }>) {
    for (let i = 0; i < articles.length; i++) {
      if (i > 0) {
        articles[i].metadata.navigation.previous = articles[i - 1].metadata.id
      }
      if (i < articles.length - 1) {
        articles[i].metadata.navigation.next = articles[i + 1].metadata.id
      }
    }
  }

  private static generateSectionId(type: string, number: string): string {
    const cleanNumber = number.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `${type.toLowerCase()}-${cleanNumber}`
  }

  private static generateArticleId(number: string): string {
    const cleanNumber = number.toLowerCase().replace(/[^a-z0-9]/g, '-')
    return `article-${cleanNumber}`
  }

  private static detectDocumentType(title: string): 'constitution' | 'code' | 'loi' | 'decret' | 'other' {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('constitution')) return 'constitution'
    if (titleLower.includes('code')) return 'code'
    if (titleLower.includes('loi')) return 'loi'
    if (titleLower.includes('décret') || titleLower.includes('decret')) return 'decret'
    return 'other'
  }
}




























