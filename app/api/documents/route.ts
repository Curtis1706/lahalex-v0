import { NextResponse } from 'next/server'
import { DocumentManager } from '@/lib/document-manager'

export async function GET() {
  try {
    const documents = await DocumentManager.listDocuments()
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Erreur chargement documents:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}