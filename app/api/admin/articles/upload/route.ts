import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { extractPDFContent, cleanExtractedText } from "@/lib/pdf-extractor"
import { extractArticleMetadata, formatLegalContent } from "@/lib/ai-processor"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { saveMetadata, saveMarkdownContent, articleExists } from "@/lib/file-manager"
import type { ArticleMetadata, RawNestedSection } from "@/types/article" // Import RawNestedSection
import { flattenAndAssignSectionIds } from "@/lib/section-flattener" // Import the new flattener

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("pdf") as File
    const markdownFile = formData.get("markdownFile") as File
    const metadataFile = formData.get("metadataFile") as File

    if (!file && (!markdownFile || !metadataFile)) {
      return NextResponse.json({ error: "Aucun fichier fourni ou fichiers Markdown (.md) et JSON (.json) requis" }, { status: 400 })
    }

    if (file && !file.type.includes("pdf")) {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 })
    }

    if (markdownFile && !markdownFile.name.endsWith('.md')) {
      return NextResponse.json({ error: "Le fichier de contenu doit être un .md" }, { status: 400 })
    }

    if (metadataFile && !metadataFile.name.endsWith('.json')) {
      return NextResponse.json({ error: "Le fichier de métadonnées doit être un .json" }, { status: 400 })
    }

    let articleId: string
    let extractedContent: any
    let cleanedText: string
    let metadata: ArticleMetadata // This will be the *flattened* metadata

    if (file) {
      // Convertir le fichier en buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Créer le dossier uploads s'il n'existe pas
      const uploadsDir = join(process.cwd(), "public", "uploads", "pdfs")
      await mkdir(uploadsDir, { recursive: true })

      // Sauvegarder le fichier PDF
      const fileName = `${uuidv4()}-${file.name}`
      const filePath = join(uploadsDir, fileName)
      await writeFile(filePath, buffer)

      // Extraire le contenu du PDF
      extractedContent = await extractPDFContent(buffer)
      cleanedText = cleanExtractedText(extractedContent.text)

      // Créer un utilisateur admin par défaut s'il n'existe pas
      let adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      })

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: "admin@lahalex.com",
            name: "Administrateur LAHALEX",
            role: "ADMIN",
          },
        })
      }

      // Créer l'article en base avec le statut DRAFT
      const article = await prisma.article.create({
        data: {
          title: extractedContent.metadata.title || file.name.replace(".pdf", ""),
          slug: `document-${Date.now()}`,
          description: "Document en cours de traitement...",
          content: "",
          status: "DRAFT",
          pdfUrl: `/uploads/pdfs/${fileName}`,
          pdfFileName: file.name,
          extractedText: cleanedText,
          aiProcessed: false,
          authorId: adminUser.id,
          categoryId: await getDefaultCategoryId(),
        },
      })

      articleId = article.id

      // Créer un job de traitement IA
      const job = await prisma.processingJob.create({
        data: {
          type: "AI_PROCESSING",
          status: "PENDING",
          articleId: article.id,
          inputData: {
            extractedText: cleanedText,
            metadata: extractedContent.metadata,
            fileSize: buffer.length,
            pages: extractedContent.pages,
          },
        },
      })

      // Lancer le traitement IA en arrière-plan
      processArticleInBackground(article.id, cleanedText)

      return NextResponse.json({
        success: true,
        article: {
          id: article.id,
          title: article.title,
          status: article.status,
          pdfUrl: article.pdfUrl,
        },
        jobId: job.id,
      })
    } else {
      // Process Markdown + JSON upload
      const markdownContent = await markdownFile.text()
      const metadataContent = await metadataFile.text()

      let rawMetadata: any // Use 'any' to parse the potentially nested structure first
      try {
        rawMetadata = JSON.parse(metadataContent)
      } catch (error) {
        return NextResponse.json({ error: "Format JSON invalide pour le fichier de métadonnées" }, { status: 400 })
      }

      // Validate required fields from the raw metadata
      if (!rawMetadata.title || !rawMetadata.slug || !rawMetadata.category || !rawMetadata.sections) {
        return NextResponse.json({ error: "Champs requis manquants dans les métadonnées (title, slug, category, sections)" }, { status: 400 })
      }

      // Flatten sections and assign IDs
      const flattenedSections = flattenAndAssignSectionIds(rawMetadata.sections as RawNestedSection[]);

      // Construct the final metadata object conforming to ArticleMetadata type
      const now = new Date().toISOString()
      const completeMetadata: ArticleMetadata = {
        ...rawMetadata, // Copy other properties from rawMetadata
        id: rawMetadata.id || uuidv4(), // Ensure ID is present
        createdAt: rawMetadata.createdAt || now,
        updatedAt: now,
        author: rawMetadata.author || {
          id: "admin",
          name: "Administrateur LAHALEX"
        },
        favoritesCount: rawMetadata.favoritesCount || 0,
        summary: rawMetadata.summary || rawMetadata.description,
        sourceUrl: rawMetadata.sourceUrl || undefined,
        publishedAt: rawMetadata.publishedAt || now,
        documentType: rawMetadata.documentType || "Document",
        subcategories: rawMetadata.subcategories || [],
        tags: rawMetadata.tags || [],
        sections: flattenedSections, // Use the flattened sections here
      }

      // Check if article with this slug already exists
      if (await articleExists(completeMetadata.slug)) {
        return NextResponse.json({ error: `Un article avec le slug '${completeMetadata.slug}' existe déjà` }, { status: 400 })
      }

      // Save the flattened metadata and markdown content
      await Promise.all([
        saveMetadata(completeMetadata.slug, completeMetadata),
        saveMarkdownContent(completeMetadata.slug, markdownContent)
      ])

      articleId = completeMetadata.id

      return NextResponse.json({
        success: true,
        article: {
          id: completeMetadata.id,
          title: completeMetadata.title,
          slug: completeMetadata.slug,
          status: "published"
        }
      })
    }
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json({ error: "Erreur lors du traitement du fichier" }, { status: 500 })
  }
}

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

async function processArticleInBackground(articleId: string, extractedText: string) {
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
    console.log(`[Job ${articleId}] Métadonnées extraites:`, metadata.title, metadata.category)
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

    // Trouver ou créer la catégorie
    let category = await prisma.category.findFirst({
      where: { name: metadata.category },
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: metadata.category,
          slug: metadata.category
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, ""),
          description: `Catégorie ${metadata.category}`,
        },
      })
    }

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
        categoryId: category.id,
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
