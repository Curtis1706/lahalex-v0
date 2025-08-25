"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Image from "next/image"

interface FicheSynthese {
  id: string
  title: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
}

export default function FichesSynthesePage() {
  const [fiches, setFiches] = useState<FicheSynthese[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: ""
  })

  const router = useRouter()

  // Charger les fiches existantes
  useEffect(() => {
    fetchFiches()
  }, [])

  const fetchFiches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/fiches-synthese")
      if (response.ok) {
        const data = await response.json()
        setFiches(data.fiches || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des fiches:", error)
             toast.error("Erreur lors du chargement des fiches de méthode")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      toast.error("Tous les champs sont obligatoires")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/admin/fiches-synthese", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Fiche de méthode créée avec succès")
        setFormData({ title: "", description: "", content: "" })
        setShowForm(false)
        fetchFiches() // Recharger la liste
      } else {
        const error = await response.json()
        toast.error(error.error || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      toast.error("Erreur lors de la création")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
         if (!confirm("Êtes-vous sûr de vouloir supprimer cette fiche de méthode ?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/fiches-synthese/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Fiche de méthode supprimée")
        fetchFiches() // Recharger la liste
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des fiches de méthode</h1>
              <p className="text-gray-600">Créer et gérer les fiches de méthode</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="flex items-center space-x-2"
            >
              <span>← Retour admin</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/", "_blank")}
              className="flex items-center space-x-2"
            >
              <span>👁️ Voir le site</span>
            </Button>
          </div>
        </div>

        {/* Bouton pour créer une nouvelle fiche */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2"
          >
            <span>{showForm ? "❌ Annuler" : "➕ Créer une fiche de méthode"}</span>
          </Button>
        </div>

        {/* Formulaire de création */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Créer une nouvelle fiche de méthode</CardTitle>
              <CardDescription>
                Remplissez les champs ci-dessous pour créer une fiche de méthode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                         placeholder="Titre de la fiche de méthode"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                         placeholder="Description courte de la fiche de méthode"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Contenu *
                  </label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                         placeholder="Contenu complet de la fiche de méthode (Markdown supporté)"
                    rows={15}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Le contenu supporte le format Markdown pour la mise en forme
                  </p>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isCreating}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating}
                  >
                                         {isCreating ? "Création en cours..." : "Créer la fiche de méthode"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des fiches existantes */}
        <Card>
          <CardHeader>
                          <CardTitle>Fiches de méthode existantes</CardTitle>
              <CardDescription>
                {fiches.length} fiche{fiches.length > 1 ? 's' : ''} de méthode
              </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                       <p className="text-gray-500">Chargement des fiches de méthode...</p>
              </div>
            ) : fiches.length === 0 ? (
              <div className="text-center py-8">
                                     <p className="text-gray-500">Aucune fiche de méthode créée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fiches.map((fiche) => (
                  <div key={fiche.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{fiche.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{fiche.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="secondary">
                          {fiche.content.length} caractères
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Créée le {new Date(fiche.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/documents/${fiche.id}`, "_blank")}
                      >
                        👁️ Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(fiche.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
