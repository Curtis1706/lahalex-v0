"use client"

import { useState, useEffect } from "react"
import { DictionaryTerm, DictionaryCategory } from "@/types/dictionary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Save, X, BookOpen, FileText, Info } from "lucide-react"

interface DictionaryAdminProps {
  className?: string
}

export function DictionaryAdmin({ className }: DictionaryAdminProps) {
  const [terms, setTerms] = useState<DictionaryTerm[]>([])
  const [categories, setCategories] = useState<DictionaryCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [editingTerm, setEditingTerm] = useState<DictionaryTerm | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    term: "",
    grammaticalInfo: "",
    definition: "",
    examples: "",
    category: "",
    source: "",
    synonyms: "",
    relatedTerms: ""
  })

  useEffect(() => {
    fetchTerms()
    fetchCategories()
  }, [])

  const fetchTerms = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/dictionary/terms")
      if (response.ok) {
        const data = await response.json()
        setTerms(data.terms || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des termes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/dictionary/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.term.trim() || !formData.definition.trim()) {
      alert("Le terme et la définition sont obligatoires")
      return
    }

    const newTerm: Partial<DictionaryTerm> = {
      term: formData.term.trim(),
      definition: formData.definition.trim(),
      category: formData.category || undefined,
      source: formData.source || undefined,
      synonyms: formData.synonyms ? formData.synonyms.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      relatedTerms: formData.relatedTerms ? formData.relatedTerms.split(",").map(s => s.trim()).filter(Boolean) : undefined,
      examples: formData.examples ? formData.examples.split("\n").map(s => s.trim()).filter(Boolean) : undefined
    }

    try {
      const url = editingTerm ? `/api/dictionary/terms/${editingTerm.id}` : "/api/dictionary/terms"
      const method = editingTerm ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTerm)
      })

      if (response.ok) {
        await fetchTerms()
        resetForm()
        setShowForm(false)
      } else {
        alert("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde")
    }
  }

  const handleEdit = (term: DictionaryTerm) => {
    setEditingTerm(term)
    setFormData({
      term: term.term,
      grammaticalInfo: term.grammaticalInfo || "",
      definition: term.definition,
      examples: term.examples ? term.examples.join("\n") : "",
      category: term.category || "",
      source: term.source || "",
      synonyms: term.synonyms ? term.synonyms.join(", ") : "",
      relatedTerms: term.relatedTerms ? term.relatedTerms.join(", ") : ""
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce terme ?")) return

    try {
      const response = await fetch(`/api/dictionary/terms/${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchTerms()
      } else {
        alert("Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      alert("Erreur lors de la suppression")
    }
  }

  const resetForm = () => {
    setFormData({
      term: "",
      grammaticalInfo: "",
      definition: "",
      examples: "",
      category: "",
      source: "",
      synonyms: "",
      relatedTerms: ""
    })
    setEditingTerm(null)
  }

  const formatDefinition = (term: DictionaryTerm) => {
    let formatted = ""
    
    if (term.grammaticalInfo) {
      formatted += `🔹 ${term.term} (${term.grammaticalInfo})\n\n`
    } else {
      formatted += `🔹 ${term.term}\n\n`
    }
    
    formatted += term.definition
    
    if (term.examples && term.examples.length > 0) {
      formatted += "\n\n🔸 Exemple : " + term.examples.join("\n🔸 Exemple : ")
    }
    
    return formatted
  }

  return (
    <div className={className}>
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des termes du dictionnaire</h2>
          <p className="text-gray-600 mt-1">
            Ajoutez, modifiez et supprimez les termes juridiques du dictionnaire
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un terme
        </Button>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingTerm ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingTerm ? "Modifier le terme" : "Ajouter un nouveau terme"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="term">Terme juridique *</Label>
                  <Input
                    id="term"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="Ex: Ab intestat"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="grammaticalInfo">Informations grammaticales</Label>
                  <Input
                    id="grammaticalInfo"
                    value={formData.grammaticalInfo}
                    onChange={(e) => setFormData({ ...formData, grammaticalInfo: e.target.value })}
                    placeholder="Ex: locution latine, féminin"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="definition">Définition *</Label>
                <Textarea
                  id="definition"
                  value={formData.definition}
                  onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                  placeholder="Définition complète du terme juridique..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="examples">Exemples d'utilisation</Label>
                <Textarea
                  id="examples"
                  value={formData.examples}
                  onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                  placeholder="Exemple 1&#10;Exemple 2&#10;Un exemple par ligne..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Saisissez un exemple par ligne. Ils seront affichés avec le préfixe "🔸 Exemple :"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Source légale</Label>
                  <Input
                    id="source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="Ex: Code civil, article 1101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="synonyms">Synonymes</Label>
                  <Input
                    id="synonyms"
                    value={formData.synonyms}
                    onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
                    placeholder="Synonyme 1, Synonyme 2, Synonyme 3"
                  />
                  <p className="text-sm text-gray-500 mt-1">Séparés par des virgules</p>
                </div>
                <div>
                  <Label htmlFor="relatedTerms">Termes liés</Label>
                  <Input
                    id="relatedTerms"
                    value={formData.relatedTerms}
                    onChange={(e) => setFormData({ ...formData, relatedTerms: e.target.value })}
                    placeholder="Terme 1, Terme 2, Terme 3"
                  />
                  <p className="text-sm text-gray-500 mt-1">Séparés par des virgules</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingTerm ? "Modifier" : "Ajouter"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des termes existants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Termes existants ({terms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des termes...</p>
            </div>
          ) : terms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun terme ajouté pour le moment</p>
              <p className="text-sm">Commencez par ajouter votre premier terme juridique</p>
            </div>
          ) : (
            <div className="space-y-4">
              {terms.map((term) => (
                <div key={term.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {term.term}
                        {term.grammaticalInfo && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            ({term.grammaticalInfo})
                          </span>
                        )}
                      </h3>
                      
                      {term.category && (
                        <Badge variant="secondary" className="mb-2">
                          {term.category}
                        </Badge>
                      )}
                      
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">
                          {formatDefinition(term)}
                        </p>
                      </div>
                      
                      {term.source && (
                        <p className="text-sm text-gray-500 mt-3 italic">
                          <Info className="w-4 h-4 inline mr-1" />
                          Source : {term.source}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(term)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(term.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

