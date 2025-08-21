import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { ProcessingJob, Article } from "@prisma/client" // <-- Ces types seront disponibles après 'npm run db:generate'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminAuth = request.cookies.get("admin-auth")?.value
    if (adminAuth !== "authenticated") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const jobs = await prisma.processingJob.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"], // Récupérer les jobs en attente ou en cours
        },
      },
      include: {
        article: {
          select: { id: true, title: true, slug: true, pdfFileName: true }, // Inclure les infos de l'article
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      jobs: jobs.map((job: ProcessingJob & { article: Article | null }) => ({
        id: job.id,
        type: job.type,
        status: job.status,
        progress: job.progress,
        errorMessage: job.errorMessage,
        article: job.article,
        createdAt: job.createdAt,
      })),
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des jobs:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des jobs" }, { status: 500 })
  }
}
