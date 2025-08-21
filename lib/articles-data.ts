export interface ArticleData {
  id: string
  slug: string
  title: string
  content: string
  livre?: string
  titre?: string
  version?: string
  effectiveDate?: string
  modifiedBy?: string
  isCommented?: boolean
  hierarchy: {
    livre?: string
    titre?: string
    article: string
  }
}

export interface ArticleNode {
  id: string
  title: string
  type: 'livre' | 'titre' | 'article'
  children?: ArticleNode[]
  slug?: string
  articleData?: ArticleData
}

// Données d'exemple pour le Code de Commerce
export const articlesData: ArticleData[] = [
  {
    id: 'l110-1',
    slug: 'l110-1',
    title: 'Article L. 110-1',
    content: `La loi répute actes de commerce :

1º Tout achat de biens meubles pour les revendre, soit en nature, soit après travail et façonnage ;

2º Tout achat de biens immeubles aux fins de les revendre en bloc ou par portions ;

3º Toute entreprise de manufactures, de commission, de transport par terre ou par eau ;

4º Toute entreprise de fournitures, d'agences, bureaux d'affaires, établissements de ventes à l'encan, de spectacles publics ;

5º Toute opération de change, banque et courtage ;

6º Toutes les opérations de banque publique ;

7º Toutes les assurances à primes ;

8º Tous les baux à loyer de choses mobilières ou immobilières, et tous les baux à ferme de fonds ruraux ;

9º Toutes les entreprises de constructions, de réparations, de fournitures, de garde-meubles, de vente en gros ou en détail ;

10º Toutes les entreprises de librairie, et d'imprimerie de toute nature ;

11º Toutes les opérations de commerce maritime.`,
    livre: 'LIVRE Ier',
    titre: 'TITRE Ier',
    version: 'Version en vigueur depuis le 1 janvier 2022',
    modifiedBy: 'Modifié par Ordonnance n°2021-1192 du 15 septembre 2021 - art. 28',
    isCommented: true,
    hierarchy: {
      livre: 'LIVRE Ier: Du commerce en général',
      titre: 'TITRE Ier: De l\'acte de commerce',
      article: 'Article L. 110-1'
    }
  },
  {
    id: 'l110-2',
    slug: 'l110-2',
    title: 'Article L. 110-2',
    content: `La loi répute aussi actes de commerce :

1º Toute entreprise de location de choses mobilières ou immobilières ;

2º Toute entreprise de fournitures de denrées ou marchandises ;

3º Toute entreprise de manufactures, d'agences, de bureaux d'affaires ;

4º Toute entreprise de spectacles publics ;

5º Toute opération de change, banque et courtage ;

6º Toutes les opérations de banque publique ;

7º Toutes les assurances à primes ;

8º Tous les baux à loyer de choses mobilières ou immobilières, et tous les baux à ferme de fonds ruraux ;

9º Toutes les entreprises de constructions, de réparations, de fournitures, de garde-meubles, de vente en gros ou en détail ;

10º Toutes les entreprises de librairie, et d'imprimerie de toute nature ;

11º Toutes les opérations de commerce maritime.`,
    livre: 'LIVRE Ier',
    titre: 'TITRE Ier',
    version: 'Version en vigueur depuis le 1 janvier 2022',
    modifiedBy: 'Modifié par Ordonnance n°2021-1192 du 15 septembre 2021 - art. 28',
    hierarchy: {
      livre: 'LIVRE Ier: Du commerce en général',
      titre: 'TITRE Ier: De l\'acte de commerce',
      article: 'Article L. 110-2'
    }
  },
  {
    id: 'l110-3',
    slug: 'l110-3',
    title: 'Article L. 110-3',
    content: `La loi répute encore actes de commerce :

1º Toute entreprise de location de choses mobilières ou immobilières ;

2º Toute entreprise de fournitures de denrées ou marchandises ;

3º Toute entreprise de manufactures, d'agences, de bureaux d'affaires ;

4º Toute entreprise de spectacles publics ;

5º Toute opération de change, banque et courtage ;

6º Toutes les opérations de banque publique ;

7º Toutes les assurances à primes ;

8º Tous les baux à loyer de choses mobilières ou immobilières, et tous les baux à ferme de fonds ruraux ;

9º Toutes les entreprises de constructions, de réparations, de fournitures, de garde-meubles, de vente en gros ou en détail ;

10º Toutes les entreprises de librairie, et d'imprimerie de toute nature ;

11º Toutes les opérations de commerce maritime.`,
    livre: 'LIVRE Ier',
    titre: 'TITRE Ier',
    version: 'Version en vigueur depuis le 1 janvier 2022',
    modifiedBy: 'Modifié par Ordonnance n°2021-1192 du 15 septembre 2021 - art. 28',
    hierarchy: {
      livre: 'LIVRE Ier: Du commerce en général',
      titre: 'TITRE Ier: De l\'acte de commerce',
      article: 'Article L. 110-3'
    }
  },
  {
    id: 'l110-4',
    slug: 'l110-4',
    title: 'Article L. 110-4',
    content: `La loi répute enfin actes de commerce :

1º Toute entreprise de location de choses mobilières ou immobilières ;

2º Toute entreprise de fournitures de denrées ou marchandises ;

3º Toute entreprise de manufactures, d'agences, de bureaux d'affaires ;

4º Toute entreprise de spectacles publics ;

5º Toute opération de change, banque et courtage ;

6º Toutes les opérations de banque publique ;

7º Toutes les assurances à primes ;

8º Tous les baux à loyer de choses mobilières ou immobilières, et tous les baux à ferme de fonds ruraux ;

9º Toutes les entreprises de constructions, de réparations, de fournitures, de garde-meubles, de vente en gros ou en détail ;

10º Toutes les entreprises de librairie, et d'imprimerie de toute nature ;

11º Toutes les opérations de commerce maritime.`,
    livre: 'LIVRE Ier',
    titre: 'TITRE Ier',
    version: 'Version en vigueur depuis le 1 janvier 2022',
    modifiedBy: 'Modifié par Ordonnance n°2021-1192 du 15 septembre 2021 - art. 28',
    hierarchy: {
      livre: 'LIVRE Ier: Du commerce en général',
      titre: 'TITRE Ier: De l\'acte de commerce',
      article: 'Article L. 110-4'
    }
  }
]

// Fonction pour obtenir un article par son slug
export function getArticleBySlug(slug: string): ArticleData | undefined {
  return articlesData.find(article => article.slug === slug)
}

// Fonction pour construire l'arborescence des articles
export function buildArticleTree(): ArticleNode[] {
  const tree: ArticleNode[] = []
  const livreMap = new Map<string, ArticleNode>()
  const titreMap = new Map<string, ArticleNode>()

  articlesData.forEach(article => {
    // Créer ou récupérer le livre
    let livreNode = livreMap.get(article.livre!)
    if (!livreNode) {
      livreNode = {
        id: `livre-${article.livre}`,
        title: article.livre!,
        type: 'livre',
        children: []
      }
      livreMap.set(article.livre!, livreNode)
      tree.push(livreNode)
    }

    // Créer ou récupérer le titre
    let titreNode = titreMap.get(`${article.livre}-${article.titre}`)
    if (!titreNode) {
      titreNode = {
        id: `titre-${article.livre}-${article.titre}`,
        title: article.titre!,
        type: 'titre',
        children: []
      }
      titreMap.set(`${article.livre}-${article.titre}`, titreNode)
      livreNode.children!.push(titreNode)
    }

    // Ajouter l'article
    const articleNode: ArticleNode = {
      id: article.id,
      title: article.title,
      type: 'article',
      slug: article.slug,
      articleData: article
    }

    titreNode.children!.push(articleNode)
  })

  return tree
}

// Fonction pour obtenir tous les articles
export function getAllArticles(): ArticleData[] {
  return articlesData
}

// Fonction pour rechercher des articles
export function searchArticles(query: string): ArticleData[] {
  const lowercaseQuery = query.toLowerCase()
  return articlesData.filter(article => 
    article.title.toLowerCase().includes(lowercaseQuery) ||
    article.content.toLowerCase().includes(lowercaseQuery) ||
    article.livre?.toLowerCase().includes(lowercaseQuery) ||
    article.titre?.toLowerCase().includes(lowercaseQuery)
  )
}






