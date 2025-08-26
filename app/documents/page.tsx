import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Calendar, Tag } from 'lucide-react'
import { DocumentManager } from '@/lib/document-manager'
import { LahalexHeaderResponsive } from '@/components/lahalex-header-responsive'


export const metadata: Metadata = {
  title: 'Documents juridiques - LAHALEX',
  description: 'Accédez à notre bibliothèque complète de documents juridiques'
}

export default async function DocumentsPage() {
  const documents = await DocumentManager.listDocuments()

  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = []
    acc[doc.type].push(doc)
    return acc
  }, {} as Record<string, typeof documents>)

  const typeLabels = {
    constitution: 'Constitutions',
    code: 'Codes',
    loi: 'Lois',
    decret: 'Décrets',
    other: 'Autres documents'
  }

  const typeColors = {
    constitution: 'bg-purple-100 text-purple-800',
    code: 'bg-blue-100 text-blue-800',
    loi: 'bg-green-100 text-green-800',
    decret: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-white">
      <LahalexHeaderResponsive searchValue="" onSearchChange={() => {}} />
      
      <div className="container-responsive py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Documents juridiques
          </h1>
          <p className="text-gray-600">
            Explorez notre bibliothèque complète de documents juridiques avec navigation hiérarchique.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(documentsByType).map(([type, docs]) => (
            <div key={type}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {typeLabels[type as keyof typeof typeLabels]} ({docs.length})
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {docs.map((document) => (
                  <Link
                    key={document.id}
                    href={`/documents/${document.id}`}
                    className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        typeColors[document.type]
                      }`}>
                        {typeLabels[document.type]}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {document.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {document.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {document.structure.totalArticles} articles
                      </div>
                      
                      {document.publishedDate && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(document.publishedDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun document trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par uploader vos premiers documents via l'interface d'administration.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aller à l'admin
            </Link>
          </div>
        )}
      </div>

      
    </div>
  )
}
