import { NextRequest, NextResponse } from "next/server"
import { DictionaryTerm } from "@/types/dictionary"
import fs from 'fs'
import path from 'path'

// Charger les termes depuis le fichier JSON
const loadDictionaryTerms = (): DictionaryTerm[] => {
  try {
    const filePath = path.join(process.cwd() || '.', 'data/dictionary-terms.json')
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const data = JSON.parse(fileContent)
      
      // Convertir la structure organisée par lettre en tableau plat
      const allTerms: DictionaryTerm[] = []
      Object.keys(data).forEach(letter => {
        if (Array.isArray(data[letter])) {
          allTerms.push(...data[letter])
        }
      })
      
      return allTerms
    }
  } catch (error) {
    console.error('Erreur lors du chargement des termes:', error)
  }
  
  return []
}

// Sauvegarder les termes dans le fichier JSON
const saveDictionaryTerms = (terms: DictionaryTerm[]) => {
  try {
    const filePath = path.join(process.cwd() || '.', 'data/dictionary-terms.json')
    
    // Organiser les termes par lettre
    const organizedTerms: { [key: string]: DictionaryTerm[] } = {}
    
    terms.forEach(term => {
      const firstLetter = term.term.charAt(0).toUpperCase()
      if (!organizedTerms[firstLetter]) {
        organizedTerms[firstLetter] = []
      }
      organizedTerms[firstLetter].push(term)
    })
    
    // Trier chaque groupe par ordre alphabétique
    Object.keys(organizedTerms).forEach(letter => {
      organizedTerms[letter].sort((a, b) => a.term.localeCompare(b.term))
    })
    
    fs.writeFileSync(filePath, JSON.stringify(organizedTerms, null, 2))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des termes:', error)
  }
}

// Stockage en mémoire avec persistance
let dictionaryTerms: DictionaryTerm[] = loadDictionaryTerms()

// Générer un ID unique
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// GET - Récupérer tous les termes ou filtrer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let filteredTerms = [...dictionaryTerms]

    // Filtrer par ID si spécifié
    if (id) {
      filteredTerms = filteredTerms.filter(term => term.id === id)
    }

    // Filtrer par catégorie si spécifiée
    if (category) {
      filteredTerms = filteredTerms.filter(term => term.category === category)
    }

    // Recherche textuelle si spécifiée
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTerms = filteredTerms.filter(term => 
        term.term.toLowerCase().includes(searchLower) ||
        term.definition.toLowerCase().includes(searchLower) ||
        term.synonyms?.some(synonym => synonym.toLowerCase().includes(searchLower)) ||
        term.examples?.some(example => example.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      success: true,
      terms: filteredTerms,
      total: filteredTerms.length
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des termes:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur interne du serveur"
    }, { status: 500 })
  }
}

// POST - Créer un nouveau terme
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { term, definition, category, synonyms, examples, relatedTerms, source, grammaticalInfo } = body

    if (!term || !definition) {
      return NextResponse.json(
        { error: "Le terme et la définition sont obligatoires" },
        { status: 400 }
      )
    }

    const newTerm: DictionaryTerm = {
      id: generateId(),
      term: term.trim(),
      grammaticalInfo: grammaticalInfo?.trim(),
      definition: definition.trim(),
      category: category?.trim(),
      synonyms: synonyms || [],
      examples: examples || [],
      relatedTerms: relatedTerms || [],
      source: source?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    dictionaryTerms.push(newTerm)
    
    // Sauvegarder immédiatement
    saveDictionaryTerms(dictionaryTerms)

    return NextResponse.json({
      message: "Terme créé avec succès",
      term: newTerm
    }, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du terme:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un terme existant
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, term, definition, category, synonyms, examples, relatedTerms, source, grammaticalInfo } = body

    if (!id || !term || !definition) {
      return NextResponse.json(
        { error: "L'ID, le terme et la définition sont obligatoires" },
        { status: 400 }
      )
    }

    const termIndex = dictionaryTerms.findIndex(t => t.id === id)
    if (termIndex === -1) {
      return NextResponse.json(
        { error: "Terme non trouvé" },
        { status: 404 }
      )
    }

    const updatedTerm: DictionaryTerm = {
      ...dictionaryTerms[termIndex],
      term: term.trim(),
      grammaticalInfo: grammaticalInfo?.trim(),
      definition: definition.trim(),
      category: category?.trim(),
      synonyms: synonyms || [],
      examples: examples || [],
      relatedTerms: relatedTerms || [],
      source: source?.trim(),
      updatedAt: new Date().toISOString()
    }

    dictionaryTerms[termIndex] = updatedTerm
    
    // Sauvegarder immédiatement
    saveDictionaryTerms(dictionaryTerms)

    return NextResponse.json({
      message: "Terme mis à jour avec succès",
      term: updatedTerm
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du terme:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un terme
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "L'ID du terme est requis"
      }, { status: 400 })
    }

    const termIndex = dictionaryTerms.findIndex(t => t.id === id)
    if (termIndex === -1) {
      return NextResponse.json({
        success: false,
        error: "Terme non trouvé"
      }, { status: 404 })
    }

    const deletedTerm = dictionaryTerms[termIndex]
    dictionaryTerms.splice(termIndex, 1)
    
    // Sauvegarder immédiatement
    saveDictionaryTerms(dictionaryTerms)

    return NextResponse.json({
      success: true,
      message: "Terme supprimé avec succès",
      term: deletedTerm
    })

  } catch (error) {
    console.error("Erreur lors de la suppression du terme:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur interne du serveur"
    }, { status: 500 })
  }
}
