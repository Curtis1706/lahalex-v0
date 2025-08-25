import { NextRequest, NextResponse } from "next/server"
import { DictionarySearchParams, DictionarySearchResult, DictionaryTerm } from "@/types/dictionary"

// Fonction pour récupérer les termes depuis l'API de gestion
async function fetchDictionaryTerms(): Promise<DictionaryTerm[]> {
  try {
    // Récupérer les termes depuis l'API de gestion
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dictionary/terms`)
    if (response.ok) {
      const data = await response.json()
      return data.terms || []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des termes:", error)
  }
  
  // Fallback vers des données statiques si l'API échoue
  return [
    {
      id: "1",
      term: "Acte authentique",
      definition: "Document rédigé par un officier public (notaire, huissier, officier d'état civil) qui confère une force probante particulière et une exécutoire.",
      category: "droit-civil",
      synonyms: ["Document authentique", "Acte notarié"],
      examples: [
        "Le contrat de mariage doit être établi par acte authentique.",
        "L'acte authentique fait foi jusqu'à inscription de faux."
      ],
      relatedTerms: ["Notaire", "Huissier", "Force probante"],
      source: "Code civil, article 1317",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    },
    {
      id: "2",
      term: "Bail commercial",
      definition: "Contrat par lequel le propriétaire d'un local commercial met celui-ci à la disposition d'un locataire pour l'exercice d'une activité commerciale, artisanale ou libérale.",
      category: "droit-commercial",
      synonyms: ["Location commerciale", "Bail professionnel"],
      examples: [
        "Le bail commercial est conclu pour une durée minimale de 9 ans.",
        "Le locataire commercial bénéficie d'un droit au renouvellement."
      ],
      relatedTerms: ["Locataire", "Propriétaire", "Droit au renouvellement"],
      source: "Code de commerce, articles L.145-1 et suivants",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z"
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!query.trim()) {
      return NextResponse.json({
        success: false,
        error: "Le terme de recherche est requis"
      }, { status: 400 })
    }

    // Récupérer les termes dynamiquement
    const dictionaryTerms = await fetchDictionaryTerms()

    // Recherche simple dans les termes
    let results = dictionaryTerms.filter(term => {
      const searchLower = query.toLowerCase()
      const termLower = term.term.toLowerCase()
      const definitionLower = term.definition.toLowerCase()
      
      // Recherche dans le terme principal
      if (termLower.includes(searchLower)) return true
      
      // Recherche dans la définition
      if (definitionLower.includes(searchLower)) return true
      
      // Recherche dans les synonymes
      if (term.synonyms) {
        for (const synonym of term.synonyms) {
          if (synonym.toLowerCase().includes(searchLower)) return true
        }
      }
      
      // Recherche dans les exemples
      if (term.examples) {
        for (const example of term.examples) {
          if (example.toLowerCase().includes(searchLower)) return true
        }
      }
      
      return false
    })

    // Filtrer par catégorie si spécifiée
    if (category && category !== "all") {
      results = results.filter(term => term.category === category)
    }

    // Calculer la pertinence pour chaque résultat
    const scoredResults: DictionarySearchResult[] = results.map(term => {
      let relevance = 0
      const matchedFields: string[] = []
      
      const searchLower = query.toLowerCase()
      const termLower = term.term.toLowerCase()
      
      // Score plus élevé pour les correspondances exactes dans le terme
      if (termLower === searchLower) {
        relevance += 100
        matchedFields.push("term_exact")
      } else if (termLower.startsWith(searchLower)) {
        relevance += 50
        matchedFields.push("term_starts_with")
      } else if (termLower.includes(searchLower)) {
        relevance += 30
        matchedFields.push("term_contains")
      }
      
      // Score pour la définition
      if (term.definition.toLowerCase().includes(searchLower)) {
        relevance += 20
        matchedFields.push("definition")
      }
      
      // Score pour les synonymes
      if (term.synonyms) {
        for (const synonym of term.synonyms) {
          if (synonym.toLowerCase().includes(searchLower)) {
            relevance += 15
            matchedFields.push("synonyms")
            break
          }
        }
      }
      
      // Score pour les exemples
      if (term.examples) {
        for (const example of term.examples) {
          if (example.toLowerCase().includes(searchLower)) {
            relevance += 10
            matchedFields.push("examples")
            break
          }
        }
      }
      
      return {
        term,
        relevance,
        matchedFields
      }
    })

    // Trier par pertinence décroissante
    scoredResults.sort((a, b) => b.relevance - a.relevance)

    // Appliquer la pagination
    const paginatedResults = scoredResults.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      results: paginatedResults,
      total: scoredResults.length,
      query,
      category,
      limit,
      offset
    })

  } catch (error) {
    console.error("Erreur lors de la recherche:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur interne du serveur"
    }, { status: 500 })
  }
}
