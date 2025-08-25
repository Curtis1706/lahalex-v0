"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

interface UploadedFile {
  id: string
  name: string
  type: 'markdown' | 'metadata'
  status: "ready" | "uploading" | "completed" | "error"
  content?: string
  error?: string
}

interface FilesPair {
  markdownFile: UploadedFile | null
  metadataFile: UploadedFile | null
}

export default function AdminPage() {
  const [filesPair, setFilesPair] = useState<FilesPair>({ markdownFile: null, metadataFile: null })
  const [isUploading, setIsUploading] = useState(false)
  const [stats, setStats] = useState({ 
    totalArticles: 0,
    categories: [] as Array<{ name: string; count: number }>
  })
  const router = useRouter()

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error)
      }
    }

    fetchStats()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const markdownFiles = acceptedFiles.filter(file => file.name.endsWith('.md'))
    const jsonFiles = acceptedFiles.filter(file => file.name.endsWith('.json'))

    if (markdownFiles.length === 0 && jsonFiles.length === 0) {
      toast.error("Seuls les fichiers .md et .json sont acceptés")
      return
    }

    // Traiter les fichiers Markdown
    for (const file of markdownFiles) {
      const fileId = `${Date.now()}-${file.name}`
      const content = await file.text()
      
      setFilesPair(prev => ({
        ...prev,
        markdownFile: {
          id: fileId,
          name: file.name,
          type: 'markdown',
          status: 'ready',
          content
        }
      }))
    }

    // Traiter les fichiers JSON
    for (const file of jsonFiles) {
      const fileId = `${Date.now()}-${file.name}`
      const content = await file.text()
      
      // Valider le JSON
      try {
        JSON.parse(content)
        setFilesPair(prev => ({
          ...prev,
          metadataFile: {
            id: fileId,
            name: file.name,
            type: 'metadata',
            status: 'ready',
            content
          }
        }))
      } catch (error) {
        setFilesPair(prev => ({
          ...prev,
          metadataFile: {
            id: fileId,
            name: file.name,
            type: 'metadata',
            status: 'error',
            error: 'Format JSON invalide'
          }
        }))
        toast.error(`Erreur JSON dans ${file.name}`)
      }
    }
  }, [])

  const handlePublish = async () => {
    if (!filesPair.markdownFile || !filesPair.metadataFile) {
      toast.error("Fichiers Markdown (.md) et JSON (.json) requis")
      return
    }

    if (filesPair.metadataFile.status === 'error') {
      toast.error("Corrigez les erreurs avant de publier")
      return
    }

    setIsUploading(true)

    try {
      // Créer un FormData au lieu d'envoyer du JSON
      const formData = new FormData()
      
      // Créer des objets File à partir du contenu
      const markdownBlob = new Blob([filesPair.markdownFile.content || ''], { type: 'text/markdown' })
      const metadataBlob = new Blob([filesPair.metadataFile.content || ''], { type: 'application/json' })
      
      const markdownFile = new File([markdownBlob], filesPair.markdownFile.name, { type: 'text/markdown' })
      const metadataFile = new File([metadataBlob], filesPair.metadataFile.name, { type: 'application/json' })
      
      formData.append('markdown', markdownFile)
      formData.append('metadata', metadataFile)

      const response = await fetch("/api/admin/documents/upload", {
        method: "POST",
        body: formData, // Utiliser FormData directement, pas de headers
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la publication')
      }

      const result = await response.json()
      
      // Marquer comme complété
      setFilesPair(prev => ({
        markdownFile: prev.markdownFile ? { ...prev.markdownFile, status: 'completed' } : null,
        metadataFile: prev.metadataFile ? { ...prev.metadataFile, status: 'completed' } : null
      }))

      // Mettre à jour les stats
      setStats(prev => ({
        ...prev,
        totalArticles: prev.totalArticles + result.document.articlesCount
      }))

      toast.success(`Document publié avec ${result.document.articlesCount} articles!`)
      
      // Proposer de voir le document
      setTimeout(() => {
        if (confirm("Voulez-vous voir le document publié ?")) {
          window.open(`/documents/${result.document.id}`, '_blank')
        }
      }, 1000)

    } catch (error: any) {
      console.error("Erreur publication:", error)
      toast.error(error.message)
      
      setFilesPair(prev => ({
        markdownFile: prev.markdownFile ? { ...prev.markdownFile, status: 'error', error: error.message } : null,
        metadataFile: prev.metadataFile ? { ...prev.metadataFile, status: 'error', error: error.message } : null
      }))
    } finally {
      setIsUploading(false)
    }
  }

  const clearFiles = () => {
    setFilesPair({ markdownFile: null, metadataFile: null })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'application/json': ['.json']
    },
    disabled: isUploading
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/lahalex-logo-icon.png"
                alt="LAHALEX Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <Image src="/images/lahalex-logo-text.png" alt="LAHALEX" width={120} height={32} className="h-8 w-auto" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600">Gestion des documents juridiques (Markdown + JSON)</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/fiches-synthese")}
              className="flex items-center space-x-2"
            >
                             <span>📋 Fiches de méthode</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/", "_blank")}
              className="flex items-center space-x-2"
            >
              <span>👁️ Voir le site</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center space-x-2 bg-transparent"
            >
              <span>🚪 Déconnexion</span>
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <span className="text-2xl">📄</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              <span className="text-2xl">📂</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-green-600">Opérationnel</div>
            </CardContent>
          </Card>
        </div>

        {/* Zone d'upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload de documents (Markdown + JSON)</CardTitle>
            <CardDescription>
              Glissez-déposez vos fichiers .md (contenu) et .json (métadonnées) ou cliquez pour les sélectionner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} />
              <span className="text-gray-400 text-5xl mx-auto mb-4 block">⬆️</span>
              {isDragActive ? (
                <p className="text-lg text-blue-600">Déposez les fichiers ici...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    Glissez-déposez vos fichiers .md et .json ici
                  </p>
                  <p className="text-sm text-gray-500">ou cliquez pour sélectionner</p>
                </div>
              )}
            </div>

            {/* Affichage des fichiers uploadés */}
            {(filesPair.markdownFile || filesPair.metadataFile) && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Fichiers sélectionnés</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearFiles}
                  >
                    Effacer
                  </Button>
                </div>

                {filesPair.markdownFile && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="font-medium">{filesPair.markdownFile.name}</p>
                        <p className="text-sm text-gray-500">
                          Contenu: {filesPair.markdownFile.content?.length || 0} caractères
                        </p>
                        {filesPair.markdownFile.error && (
                          <p className="text-sm text-red-600 mt-1">{filesPair.markdownFile.error}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        filesPair.markdownFile.status === 'completed' ? 'default' :
                        filesPair.markdownFile.status === 'error' ? 'destructive' : 'secondary'
                      }
                    >
                      {filesPair.markdownFile.status === 'ready' ? 'Prêt' :
                       filesPair.markdownFile.status === 'completed' ? 'Publié' :
                       filesPair.markdownFile.status === 'error' ? 'Erreur' : 'En cours'}
                    </Badge>
                  </div>
                )}

                {filesPair.metadataFile && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="font-medium">{filesPair.metadataFile.name}</p>
                        <p className="text-sm text-gray-500">
                          Métadonnées JSON
                        </p>
                        {filesPair.metadataFile.error && (
                          <p className="text-sm text-red-600 mt-1">{filesPair.metadataFile.error}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        filesPair.metadataFile.status === 'completed' ? 'default' :
                        filesPair.metadataFile.status === 'error' ? 'destructive' : 'secondary'
                      }
                    >
                      {filesPair.metadataFile.status === 'ready' ? 'Prêt' :
                       filesPair.metadataFile.status === 'completed' ? 'Publié' :
                       filesPair.metadataFile.status === 'error' ? 'Erreur' : 'En cours'}
                    </Badge>
                  </div>
                )}

                {filesPair.markdownFile && filesPair.metadataFile && (
                  <Button 
                    onClick={handlePublish} 
                    disabled={isUploading || filesPair.metadataFile.status === 'error'}
                    className="w-full"
                  >
                    {isUploading ? "Publication en cours..." : "Publier l'article"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Catégories */}
        {stats.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.categories.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
















