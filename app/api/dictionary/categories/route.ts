import { NextResponse } from "next/server"
import { DictionaryCategory } from "@/types/dictionary"

// Données de démonstration pour les catégories
const mockCategories: DictionaryCategory[] = [
  {
    id: "droit-civil",
    name: "Droit civil",
    description: "Règles régissant les relations entre particuliers",
    color: "#3B82F6",
    termCount: 120
  },
  {
    id: "droit-penal",
    name: "Droit pénal",
    description: "Règles définissant les infractions et leurs sanctions",
    color: "#EF4444",
    termCount: 95
  },
  {
    id: "droit-commercial",
    name: "Droit commercial",
    description: "Règles applicables aux commerçants et aux actes de commerce",
    color: "#10B981",
    termCount: 88
  },
  {
    id: "droit-administratif",
    name: "Droit administratif",
    description: "Règles régissant l'administration et les relations avec les citoyens",
    color: "#8B5CF6",
    termCount: 76
  },
  {
    id: "droit-constitutionnel",
    name: "Droit constitutionnel",
    description: "Règles fondamentales de l'organisation de l'État",
    color: "#F59E0B",
    termCount: 65
  },
  {
    id: "droit-fiscal",
    name: "Droit fiscal",
    description: "Règles relatives aux impôts et à la fiscalité",
    color: "#6366F1",
    termCount: 58
  },
  {
    id: "droit-social",
    name: "Droit social",
    description: "Règles du travail et de la sécurité sociale",
    color: "#EC4899",
    termCount: 52
  },
  {
    id: "droit-international",
    name: "Droit international",
    description: "Règles régissant les relations entre États",
    color: "#6B7280",
    termCount: 45
  },
  {
    id: "droit-procedural",
    name: "Droit procédural",
    description: "Règles de procédure civile et pénale",
    color: "#059669",
    termCount: 38
  },
  {
    id: "droit-propriete",
    name: "Droit de la propriété",
    description: "Règles relatives à la propriété intellectuelle et industrielle",
    color: "#DC2626",
    termCount: 42
  },
  {
    id: "droit-famille",
    name: "Droit de la famille",
    description: "Règles régissant les relations familiales",
    color: "#7C3AED",
    termCount: 35
  },
  {
    id: "droit-urbanisme",
    name: "Droit de l'urbanisme",
    description: "Règles d'aménagement et d'urbanisme",
    color: "#0891B2",
    termCount: 28
  },
  {
    id: "droit-environnement",
    name: "Droit de l'environnement",
    description: "Règles de protection de l'environnement",
    color: "#16A34A",
    termCount: 32
  },
  {
    id: "droit-medias",
    name: "Droit des médias",
    description: "Règles relatives à la communication et aux médias",
    color: "#EA580C",
    termCount: 25
  },
  {
    id: "droit-numerique",
    name: "Droit du numérique",
    description: "Règles relatives aux technologies numériques",
    color: "#9333EA",
    termCount: 30
  }
]

export async function GET() {
  try {
    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json({
      success: true,
      categories: mockCategories,
      total: mockCategories.length
    })
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur interne du serveur"
    }, { status: 500 })
  }
}


