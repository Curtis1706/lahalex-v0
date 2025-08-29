import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;
    
    // Chemin vers le fichier content-complet.md
    const contentPath = join(process.cwd(), 'content', 'documents', 'fiches-synthese', documentId, 'content-complet.md');
    
    // Lire le contenu du fichier
    const content = await fs.readFile(contentPath, 'utf-8');
    
    return NextResponse.json({ 
      content: content,
      documentId: documentId 
    });
  } catch (error) {
    console.error('Erreur lors de la lecture du contenu complet:', error);
    return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
  }
}
