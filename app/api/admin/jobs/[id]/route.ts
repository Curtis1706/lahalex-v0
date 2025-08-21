import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing its properties
    const { id } = await params // <-- Correction ici

    const job = await prisma.processingJob.findUnique({
      where: { id: id }, // Utilise la variable 'id' déstructurée
      include: {
        article: {
          select: { id: true, title: true, slug: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      id: job.id,
      type: job.type,
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
      article: job.article,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du job:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du job" }, { status: 500 })
  }
}
