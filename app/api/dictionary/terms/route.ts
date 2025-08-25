import { NextRequest, NextResponse } from "next/server"
import { DictionaryTerm } from "@/types/dictionary"

// Stockage temporaire en mémoire (à remplacer par une vraie base de données)
let dictionaryTerms: DictionaryTerm[] = [
  {
    id: "1",
    term: "Abandon",
    grammaticalInfo: "nom masculin",
    definition: "Très anc. comp.; issu de la locution a bandon, dans laisser, mettre a bandon: à la discrétion, à la merci. Bandon: anc. terme jurid. signifiant pouvoir, dér. du germ. banda: étendard, d'où signe d'autorité auquel se rattache aussi bande: troupe.\n\n1. Fait de délaisser une personne, un bien ou une activité, au mépris d'un devoir.\n— de famille (sens strict). Fait pour toute personne de demeurer deux mois sans s'acquitter intégralement de sa dette, au mépris de la décision de justice ou de la convention judiciairement homologuée qui lui impose soit de contribuer aux charges du mariage, soit de payer une pension alimentaire à son conjoint, à ses ascendants, ou à ses descendants, soit de verser des subsides à un enfant ou des prestations dues en vertu d'un devoir de famille...",
    category: "droit-civil",
    synonyms: ["Délaissement", "Renonciation"],
    examples: [
      "L'abandon de famille est puni par la loi.",
      "L'abandon d'un bien peut entraîner sa perte."
    ],
    relatedTerms: ["Famille", "Obligation alimentaire", "Dette"],
    source: "Code civil, article 227",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    term: "Abandonnataire",
    grammaticalInfo: "nom masculin",
    definition: "Subst. – De *abandon; dér., fait au XIXe siècle, d'après donataire.\n\nCelui au profit duquel est fait l'*abandonnement ou l'*abandon du navire. V. bénéficiaire, cessionnaire, acquéreur, attributaire.",
    category: "droit-maritime",
    synonyms: ["Bénéficiaire", "Cessionnaire"],
    examples: [
      "L'abandonnataire reçoit le navire abandonné."
    ],
    relatedTerms: ["Abandon", "Navire", "Cession"],
    source: "Code de commerce maritime",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    term: "Abandonnement",
    grammaticalInfo: "nom masculin",
    definition: "Dér. d'abandonner. V. abandon.\n\n1. Opération par laquelle des biens sont attribués à titre de partage à un indivisaire pour le remplir de ses droits. Syn. *attribution. Ex. abandonnement d'immeuble fait à un conjoint au cours du mariage. Comp. *assignation de parts, allotissement, *partage d'ascendant.\n\n2. Dans certaines expressions, *abandon de possession. Ex. contrat d'abandonnement. V. déguerpissement, délaissement.",
    category: "droit-civil",
    synonyms: ["Attribution", "Partage"],
    examples: [
      "L'abandonnement d'immeuble permet de régler une succession."
    ],
    relatedTerms: ["Partage", "Succession", "Indivision"],
    source: "Code civil",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    term: "Abattage",
    grammaticalInfo: "nom masculin",
    definition: "Action d'abattre, de couper, de démolir. En droit immobilier, démolition d'un bâtiment ou d'une construction.",
    category: "droit-immobilier",
    synonyms: ["Démolition", "Destruction"],
    examples: [
      "L'abattage d'un arbre nécessite une autorisation."
    ],
    relatedTerms: ["Démolition", "Construction", "Autorisation"],
    source: "Code de l'urbanisme",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    term: "Abattement",
    grammaticalInfo: "nom masculin",
    definition: "Réduction accordée sur une base imposable ou sur un montant à payer. En fiscalité, déduction autorisée avant calcul de l'impôt.",
    category: "droit-fiscal",
    synonyms: ["Réduction", "Déduction"],
    examples: [
      "L'abattement fiscal réduit la base imposable."
    ],
    relatedTerms: ["Impôt", "Fiscalité", "Déduction"],
    source: "Code général des impôts",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "6",
    term: "Abattoir",
    grammaticalInfo: "nom masculin",
    definition: "Établissement où l'on abat les animaux de boucherie pour la consommation humaine. Soumis à des réglementations sanitaires strictes.",
    category: "droit-sanitaire",
    synonyms: ["Établissement d'abattage"],
    examples: [
      "L'abattoir doit respecter les normes d'hygiène."
    ],
    relatedTerms: ["Hygiène", "Santé publique", "Réglementation"],
    source: "Code rural",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "7",
    term: "Abdicatif",
    grammaticalInfo: "adjectif",
    definition: "Qui concerne l'abdication, qui a trait à la renonciation à un pouvoir ou à une fonction.",
    category: "droit-constitutionnel",
    synonyms: ["Relatif à l'abdication"],
    examples: [
      "L'acte abdicatif met fin aux fonctions royales."
    ],
    relatedTerms: ["Abdication", "Renonciation", "Pouvoir"],
    source: "Droit constitutionnel",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "8",
    term: "Abdication",
    grammaticalInfo: "nom féminin",
    definition: "Renonciation volontaire à une fonction, un pouvoir ou une dignité. En droit constitutionnel, renonciation d'un souverain au trône.",
    category: "droit-constitutionnel",
    synonyms: ["Renonciation", "Démission"],
    examples: [
      "L'abdication du roi a été acceptée par le parlement."
    ],
    relatedTerms: ["Souverain", "Trône", "Renonciation"],
    source: "Droit constitutionnel",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "9",
    term: "Ab intestat",
    grammaticalInfo: "locution latine, féminin",
    definition: "Locution juridique latine signifiant qu'une succession est ouverte en l'absence de testament, soit parce que le défunt n'en a jamais rédigé, soit parce que le testament est nul, inefficace ou caduc. Elle désigne à la fois ce mode légal de transmission des biens selon l'ordre successoral fixé par le droit civil, et les héritiers qui en bénéficient sans avoir été expressément désignés par le défunt.",
    category: "droit-successoral",
    synonyms: ["Succession légale", "Héritage sans testament"],
    examples: [
      "Après le décès soudain de M. Bio, qui n'avait laissé aucun testament, ses deux enfants ont été déclarés héritiers ab intestat et ont reçu chacun une part égale des biens successoraux conformément aux règles de la dévolution légale."
    ],
    relatedTerms: ["Succession", "Testament", "Héritier"],
    source: "Code civil, articles 721 et suivants",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "10",
    term: "Ab Irato",
    grammaticalInfo: "locution latine",
    definition: "Locution latine signifiant 'dans la colère'. En droit, se dit d'un acte juridique accompli sous l'emprise de la colère ou de l'émotion, ce qui peut affecter sa validité.",
    category: "droit-civil",
    synonyms: ["Sous l'emprise de la colère"],
    examples: [
      "Un testament rédigé ab irato peut être contesté."
    ],
    relatedTerms: ["Testament", "Validité", "Émotion"],
    source: "Code civil",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "11",
    term: "Abolitif",
    grammaticalInfo: "adjectif",
    definition: "Qui a pour effet d'abolir, de supprimer une loi, un délit ou une peine. Se dit d'une loi qui abroge une disposition antérieure.",
    category: "droit-penal",
    synonyms: ["Abolitrice", "Suppresseur"],
    examples: [
      "La loi abolitive a supprimé la peine de mort."
    ],
    relatedTerms: ["Abolition", "Loi", "Peine"],
    source: "Code pénal",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "12",
    term: "Abolition",
    grammaticalInfo: "nom féminin",
    definition: "Suppression complète d'une loi, d'une institution ou d'une peine. En droit pénal, suppression rétroactive d'une infraction.",
    category: "droit-penal",
    synonyms: ["Suppression", "Abrogation"],
    examples: [
      "L'abolition de l'esclavage a été proclamée en 1848."
    ],
    relatedTerms: ["Loi", "Institution", "Peine"],
    source: "Code pénal",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "13",
    term: "Abonnement",
    grammaticalInfo: "nom masculin",
    definition: "Contrat par lequel une personne s'engage à payer une somme déterminée pour recevoir un service ou un bien pendant une période fixée.",
    category: "droit-commercial",
    synonyms: ["Souscription", "Engagement"],
    examples: [
      "L'abonnement téléphonique engage le client pour 24 mois."
    ],
    relatedTerms: ["Contrat", "Service", "Engagement"],
    source: "Code de la consommation",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "14",
    term: "Abordage",
    grammaticalInfo: "nom masculin",
    definition: "Collision entre deux navires ou entre un navire et un autre objet flottant. En droit maritime, ensemble des règles applicables aux dommages résultant de telles collisions.",
    category: "droit-maritime",
    synonyms: ["Collision maritime"],
    examples: [
      "L'abordage en mer obéit à des règles spéciales."
    ],
    relatedTerms: ["Navire", "Collision", "Dommage"],
    source: "Code de commerce maritime",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "15",
    term: "Abornement",
    grammaticalInfo: "nom masculin",
    definition: "Action de délimiter un terrain par des bornes ou des repères. En droit immobilier, opération de bornage consistant à fixer les limites d'une propriété.",
    category: "droit-immobilier",
    synonyms: ["Bornage", "Délimitation"],
    examples: [
      "L'abornement permet de fixer les limites d'une propriété."
    ],
    relatedTerms: ["Bornage", "Propriété", "Limite"],
    source: "Code civil",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "16",
    term: "Aboutissant",
    grammaticalInfo: "nom masculin",
    definition: "Terrain qui aboutit à un autre, qui lui est contigu. En droit immobilier, propriété qui touche une voie publique ou une autre propriété.",
    category: "droit-immobilier",
    synonyms: ["Contigu", "Adjacent"],
    examples: [
      "Le terrain aboutissant à la route a une plus-value."
    ],
    relatedTerms: ["Propriété", "Contiguïté", "Voirie"],
    source: "Code civil",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "17",
    term: "Aboyeur",
    grammaticalInfo: "nom masculin",
    definition: "Personne qui crie ou qui parle fort. En droit commercial, crieur public chargé d'annoncer des ventes aux enchères.",
    category: "droit-commercial",
    synonyms: ["Crieur", "Annonceur"],
    examples: [
      "L'aboyeur annonce les prix lors des enchères."
    ],
    relatedTerms: ["Enchères", "Vente", "Annonce"],
    source: "Code de commerce",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "18",
    term: "Abréviation",
    grammaticalInfo: "nom féminin",
    definition: "Raccourcissement d'un mot ou d'une expression. En droit, forme abrégée utilisée dans les documents officiels et les textes juridiques.",
    category: "droit-general",
    synonyms: ["Raccourcissement", "Raccourci"],
    examples: [
      "Les abréviations sont courantes dans les textes de loi."
    ],
    relatedTerms: ["Document", "Texte", "Forme"],
    source: "Usage juridique",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "19",
    term: "Abrégé",
    grammaticalInfo: "nom masculin",
    definition: "Résumé, sommaire d'un texte ou d'un ouvrage. En droit, version condensée d'une décision judiciaire ou d'un texte législatif.",
    category: "droit-general",
    synonyms: ["Résumé", "Sommaire"],
    examples: [
      "L'abrégé de la décision est publié au bulletin officiel."
    ],
    relatedTerms: ["Décision", "Publication", "Résumé"],
    source: "Usage juridique",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "20",
    term: "Abrogatif",
    grammaticalInfo: "adjectif",
    definition: "Qui a pour effet d'abroger, de supprimer une loi ou un règlement. Se dit d'une disposition qui annule une règle antérieure.",
    category: "droit-administratif",
    synonyms: ["Suppresseur", "Annulateur"],
    examples: [
      "La loi abrogative a supprimé l'ancien règlement."
    ],
    relatedTerms: ["Abrogation", "Loi", "Règlement"],
    source: "Code administratif",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
]

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
