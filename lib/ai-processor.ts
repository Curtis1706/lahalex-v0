import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { prisma } from "@/lib/prisma" // Declare the prisma variable

const ArticleMetadataSchema = z.object({
  title: z.string().describe("Titre principal du document tel qu'il apparaît"),
  description: z.string().describe("Description factuelle du document (2-3 phrases)"),
  category: z.string().describe("Catégorie principale (ex: Droit public, Droit privé)"),
  subcategories: z.array(z.string()).describe("Sous-catégories spécifiques"), // <-- Assure-toi que l'IA remplit bien ce champ
  tags: z.array(z.string()).describe("Mots-clés juridiques pertinents"),
  source: z.string().optional().describe("Source du document"),
  publishedDate: z.string().optional().describe("Date de publication au format ISO"),
  documentType: z.string().describe("Type de document (Loi, Décret, Jurisprudence, etc.)"),
  sections: z
    .array(
      z.object({
        id: z.string(), // Ensure ID is part of the schema
        title: z.string(),
        startIndex: z.number(),
        endIndex: z.number(),
        level: z.number().min(1).max(6),
        order: z.number(),
      }),
    )
    .describe("Structure des sections du document avec positions dans le texte original"),
})

export type ProcessedArticleMetadata = z.infer<typeof ArticleMetadataSchema>

// Fonction pour diviser le texte en chunks
export function chunkText(text: string, maxChunkSize = 15000): string[] {
  const chunks: string[] = []
  let currentIndex = 0

  while (currentIndex < text.length) {
    let endIndex = currentIndex + maxChunkSize

    // Si on n'est pas à la fin du texte, essayer de couper à un point logique
    if (endIndex < text.length) {
      // Chercher le dernier point, saut de ligne ou espace dans les 500 derniers caractères
      const searchStart = Math.max(endIndex - 500, currentIndex)
      const substring = text.substring(searchStart, endIndex)

      const lastPeriod = substring.lastIndexOf(".")
      const lastNewline = substring.lastIndexOf("\n")
      const lastSpace = substring.lastIndexOf(" ")

      const bestCutPoint = Math.max(lastPeriod, lastNewline, lastSpace)

      if (bestCutPoint > 0) {
        endIndex = searchStart + bestCutPoint + 1
      }
    }

    chunks.push(text.substring(currentIndex, endIndex))
    currentIndex = endIndex
  }

  return chunks
}

export async function extractArticleMetadata(extractedText: string): Promise<ProcessedArticleMetadata> {
  try {
    // Utiliser seulement les premiers 8000 caractères pour l'analyse des métadonnées
    const textForAnalysis = extractedText.substring(0, 8000)

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: ArticleMetadataSchema,
      prompt: `
        Analyse ce début de texte juridique et extrait UNIQUEMENT les métadonnées sans modifier le contenu.
        
        Instructions STRICTES :
        1. Identifie le titre EXACT tel qu'il apparaît dans le document
        2. Crée une description FACTUELLE sans interprétation
        3. Détermine la catégorie juridique appropriée (ex: Droit public, Droit privé, Droit mixte)
        4. Identifie les sous-catégories spécifiques si elles sont clairement mentionnées (ex: Droit constitutionnel, Droit administratif, Droit civil, Droit commercial, Droit OHADA). Retourne un tableau vide si aucune sous-catégorie spécifique n'est trouvée.
        5. Identifie les mots-clés juridiques pertinents
        6. Détecte la structure des sections (titres, chapitres, articles) avec leurs positions. Pour chaque section, génère un ID unique et stable (par exemple, basé sur le titre ou un hash) et inclus-le dans l'objet section.
        7. Si une date de publication est mentionnée explicitement dans le texte (ex: "Loi du 15 mai 2023", "Décret n°... du 12/03/2024"), extrais-la et formate-la au format ISO 8601 (YYYY-MM-DD). Si aucune date n'est trouvée, laisse le champ vide.
        8. NE MODIFIE JAMAIS le contenu original
        9. Reste factuel et objectif
        
        Contexte : Plateforme juridique béninoise avec focus sur le droit OHADA, constitutionnel et administratif.
        
        Début du texte à analyser :
        ${textForAnalysis}
      `,
    })

    return object
  } catch (error) {
    console.error("Erreur lors de l'extraction des métadonnées:", error)
    throw new Error("Impossible d'extraire les métadonnées du document")
  }
}

export async function formatLegalContent(
  text: string,
  sections: ProcessedArticleMetadata["sections"],
): Promise<string> {
  try {
    const chunks = chunkText(text, 12000)
    const formattedChunks: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      // Filter sections relevant to the current chunk based on their start/end indices
      const relevantSections = sections.filter(
        (section) => section.startIndex >= i * 12000 && section.startIndex < (i + 1) * 12000,
      )

      const { text: formattedChunk } = await generateText({
        model: openai("gpt-4o"),
        prompt: `
          Formate ce texte juridique en HTML en préservant INTÉGRALEMENT le contenu original.
          
          Instructions STRICTES :
          1. PRÉSERVE EXACTEMENT tout le texte original - aucune modification du contenu
          2. Ajoute uniquement des balises HTML pour la structure
          3. Utilise les balises appropriées : <h1>, <h2>, <h3>, <p>, <ul>, <li>, blockquote
          4. Pour chaque titre de section (h1, h2, h3, etc.) qui correspond à une section fournie dans 'relevantSections', ajoute un attribut 'id' au format 'section-{section.id}'. Par exemple, si une section a l'id 'my-section-id' et le titre 'Mon Titre', le HTML devrait être <h2 id="section-my-section-id">Mon Titre</h2>.
          5. Respecte la numérotation des articles, chapitres, sections
          6. Formate les listes et énumérations correctement
          7. Ajoute des classes CSS pour le styling : "legal-article", "legal-section", etc.
          8. NE RÉSUME PAS, NE PARAPHRASE PAS, NE MODIFIE PAS le contenu
          
          Sections détectées dans ce chunk (utilise ces IDs pour les attributs 'id' dans les balises de titre) :
          ${JSON.stringify(relevantSections, null, 2)}
          
          Texte à formater (PRÉSERVER INTÉGRALEMENT) :
          ${chunk}
        `,
      })

      formattedChunks.push(formattedChunk)
    }

    return formattedChunks.join("\n")
  } catch (error) {
    console.error("Erreur lors du formatage:", error)
    // En cas d'erreur, retourner le texte original avec un formatage minimal
    return `<div class="legal-document">${text.replace(/\n/g, "<br>")}</div>`
  }
}

// Fonction pour traiter l'article en arrière-plan
export async function processArticleInBackground(articleId: string, extractedText: string) {
  try {
    // Mettre à jour le statut du job
    await prisma.processingJob.updateMany({
      where: { articleId, type: "AI_PROCESSING" },
      data: { status: "PROCESSING", progress: 10 },
    })

    // Ajoute des logs pour suivre la progression
    console.log(`[Job ${articleId}] Début de l'extraction des métadonnées IA...`)

    // Extraire les métadonnées avec l'IA
    const metadata = await extractArticleMetadata(extractedText)

    // Après la ligne `const metadata = await extractArticleMetadata(extractedText)`
    console.log(`[Job ${articleId}] Métadonnées extraites:`, metadata.title, metadata.category, metadata.subcategories)
    console.log(`[Job ${articleId}] Début du formatage du contenu...`)

    // Mettre à jour le progrès
    await prisma.processingJob.updateMany({
      where: { articleId, type: "AI_PROCESSING" },
      data: { progress: 40 },
    })

    // Formater le contenu en préservant l'intégrité
    const formattedContent = await formatLegalContent(extractedText, metadata.sections)

    // Après la ligne `const formattedContent = await formatLegalContent(extractedText, metadata.sections)`
    console.log(`[Job ${articleId}] Contenu formaté. Mise à jour de l'article en base...`)

    // Mettre à jour le progrès
    await prisma.processingJob.updateMany({
      where: { articleId, type: "AI_PROCESSING" },
      data: { progress: 70 },
    })

    // --- Logique pour trouver ou créer la catégorie la plus spécifique ---
    let targetCategoryId: string | null = null
    let assignedCategoryName = "Non classé" // For logging

    // 1. Essayer de trouver ou créer une sous-catégorie parmi celles suggérées par l'IA
    if (metadata.subcategories && metadata.subcategories.length > 0) {
      for (const subCategoryName of metadata.subcategories) {
        let subCategory = await prisma.category.findFirst({
          where: { name: subCategoryName },
        })

        if (!subCategory) {
          // Try to find its parent if the main category is also suggested
          let parentCategory = null
          if (metadata.category) {
            parentCategory = await prisma.category.findFirst({
              where: { name: metadata.category },
            })
            if (!parentCategory) {
              // Create parent if it doesn't exist
              parentCategory = await prisma.category.create({
                data: {
                  name: metadata.category,
                  slug: generateSlug(metadata.category),
                  description: `Catégorie principale ${metadata.category}`,
                },
              })
              console.log(`[Job ${articleId}] Catégorie parente créée: ${parentCategory.name}`)
            }
          }

          // Create the subcategory
          subCategory = await prisma.category.create({
            data: {
              name: subCategoryName,
              slug: generateSlug(subCategoryName),
              description: `Sous-catégorie ${subCategoryName}`,
              parentId: parentCategory?.id, // Link to parent if found/created
            },
          })
          console.log(`[Job ${articleId}] Sous-catégorie créée: ${subCategory.name}`)
        }
        targetCategoryId = subCategory.id
        assignedCategoryName = subCategory.name
        console.log(`[Job ${articleId}] Article assigné à la sous-catégorie: ${subCategory.name}`)
        break // Assign to the first specific subcategory found/created
      }
    }

    // 2. Si aucune sous-catégorie spécifique n'a été trouvée/créée, utiliser ou créer la catégorie principale
    if (!targetCategoryId && metadata.category) {
      let mainCategory = await prisma.category.findFirst({
        where: { name: metadata.category },
      })

      if (!mainCategory) {
        mainCategory = await prisma.category.create({
          data: {
            name: metadata.category,
            slug: generateSlug(metadata.category),
            description: `Catégorie ${metadata.category}`,
          },
        })
        console.log(`[Job ${articleId}] Catégorie principale créée: ${mainCategory.name}`)
      }
      targetCategoryId = mainCategory.id
      assignedCategoryName = mainCategory.name
      console.log(`[Job ${articleId}] Article assigné à la catégorie principale: ${mainCategory.name}`)
    }

    // 3. Si toujours pas de catégorie, utiliser la catégorie par défaut "Non classé"
    if (!targetCategoryId) {
      targetCategoryId = await getDefaultCategoryId()
      assignedCategoryName = "Non classé"
      console.log(`[Job ${articleId}] Article assigné à la catégorie par défaut: Non classé`)
    }
    // --- Fin de la logique de catégorie ---

    // Générer un slug unique
    const baseSlug = metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100)

    let slug = baseSlug
    let counter = 1

    while (await prisma.article.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Mettre à jour l'article
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title: metadata.title,
        slug,
        description: metadata.description,
        content: formattedContent,
        source: metadata.source,
        publishedAt: metadata.publishedDate ? new Date(metadata.publishedDate) : new Date(),
        categoryId: targetCategoryId, // Utilise l'ID de la catégorie déterminée
        aiProcessed: true,
        status: "PUBLISHED",
      },
    })

    // Après la ligne `await prisma.article.update(...)`
    console.log(`[Job ${articleId}] Article mis à jour. Création des sections et tags...`)

    // Créer les sections
    if (metadata.sections.length > 0) {
      await prisma.articleSection.createMany({
        data: metadata.sections.map((section) => ({
          articleId,
          title: section.title,
          content: extractedText.substring(section.startIndex, section.endIndex),
          level: section.level,
          order: section.order,
        })),
      })
    }

    // Créer les tags
    for (const tagName of metadata.tags) {
      let tag = await prisma.tag.findFirst({
        where: { name: tagName },
      })

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: tagName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
          },
        })
      }

      // Associer le tag à l'article
      await prisma.article.update({
        where: { id: articleId },
        data: {
          tags: {
            connect: { id: tag.id },
          },
        },
      })
    }

    // Après la création des sections et tags
    console.log(`[Job ${articleId}] Sections et tags créés. Job terminé.`)

    // Marquer le job comme terminé
    await prisma.processingJob.updateMany({
      where: { articleId, type: "AI_PROCESSING" },
      data: {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        outputData: {
          metadata,
          sectionsCount: metadata.sections.length,
          tagsCount: metadata.tags.length,
        },
      },
    })
  } catch (error) {
    // Dans le bloc `catch` de `processArticleInBackground`
    console.error(`[Job ${articleId}] Erreur critique lors du traitement IA:`, error)

    console.error("Erreur lors du traitement IA:", error)

    // Marquer le job comme échoué
    await prisma.processingJob.updateMany({
      where: { articleId, type: "AI_PROCESSING" },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Erreur inconnue",
      },
    })
  }
}

// Fonction pour générer un slug à partir d'un titre
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Fonction pour obtenir l'ID de la catégorie par défaut
async function getDefaultCategoryId(): Promise<string> {
  let category = await prisma.category.findFirst({
    where: { slug: "non-classe" },
  })

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Non classé",
        slug: "non-classe",
        description: "Articles en attente de classification",
      },
    })
  }

  return category.id
}
