import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { saveMetadata, saveMarkdownContent, articleExists } from "@/lib/file-manager"
import type { ArticleMetadata, RawNestedSection } from "@/types/article"
import { flattenAndAssignSectionIds } from "@/lib/section-flattener"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const markdownFile = formData.get("markdownFile") as File
    const metadataFile = formData.get("metadataFile") as File

    if (!markdownFile || !metadataFile) {
      return NextResponse.json({ error: "Fichiers Markdown (.md) et JSON (.json) requis" }, { status: 400 })
    }

    if (!markdownFile.name.endsWith('.md')) {
      return NextResponse.json({ error: "Le fichier de contenu doit être un .md" }, { status: 400 })
    }

    if (!metadataFile.name.endsWith('.json')) {
      return NextResponse.json({ error: "Le fichier de métadonnées doit être un .json" }, { status: 400 })
    }

    // Process Markdown + JSON upload
    const markdownContent = await markdownFile.text()
    const metadataContent = await metadataFile.text()

    let rawMetadata: any
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
      ...rawMetadata,
      id: rawMetadata.id || uuidv4(),
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
      sections: flattenedSections,
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

    return NextResponse.json({
      success: true,
      article: {
        id: completeMetadata.id,
        title: completeMetadata.title,
        slug: completeMetadata.slug,
        status: "published"
      }
    })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json({ error: "Erreur lors du traitement du fichier" }, { status: 500 })
  }
}
