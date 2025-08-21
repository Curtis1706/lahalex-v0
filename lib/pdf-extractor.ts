import pdf from "pdf-parse"

export interface ExtractedPDFContent {
  text: string
  pages: number
  metadata: {
    title?: string
    author?: string
    subject?: string
    creator?: string
    producer?: string
    creationDate?: Date
    modificationDate?: Date
  }
}

export async function extractPDFContent(buffer: Buffer): Promise<ExtractedPDFContent> {
  try {
    const data = await pdf(buffer)

    // Helper function to safely parse dates
    const parseDateSafely = (dateString: string | undefined) => {
      if (!dateString) return undefined
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? undefined : date
    }

    return {
      text: data.text,
      pages: data.numpages,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        creator: data.info?.Creator,
        producer: data.info?.Producer,
        creationDate: parseDateSafely(data.info?.CreationDate),
        modificationDate: parseDateSafely(data.info?.ModDate),
      },
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction PDF:", error)
    throw new Error("Impossible d'extraire le contenu du PDF")
  }
}

export function cleanExtractedText(text: string): string {
  return (
    text
      // Supprimer les caractères de contrôle
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Normaliser les espaces
      .replace(/\s+/g, " ")
      // Supprimer les espaces en début et fin
      .trim()
      // Supprimer les lignes vides multiples
      .replace(/\n\s*\n\s*\n/g, "\n\n")
  )
}
