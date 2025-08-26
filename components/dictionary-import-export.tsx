"use client"

import { useState } from "react"
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DictionaryTerm } from "@/types/dictionary"

interface DictionaryImportExportProps {
  onImportComplete?: () => void
  className?: string
}

export function DictionaryImportExport({ onImportComplete, className }: DictionaryImportExportProps) {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    details?: string
  } | null>(null)

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportStatus(null)

    try {
      const text = await file.text()
      let terms: DictionaryTerm[] = []

      // Détecter le format du fichier
      if (file.name.endsWith('.json')) {
        terms = JSON.parse(text)
      } else if (file.name.endsWith('.csv')) {
        terms = parseCSV(text)
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        terms = parseTextFile(text)
      } else {
        throw new Error("Format de fichier non supporté. Utilisez JSON, CSV, TXT ou MD.")
      }

      // Valider les termes
      const validTerms = terms.filter(validateTerm)
      
      if (validTerms.length === 0) {
        throw new Error("Aucun terme valide trouvé dans le fichier")
      }

      // Importer les termes
      let successCount = 0
      let errorCount = 0

      for (const term of validTerms) {
        try {
          const response = await fetch("/api/dictionary/terms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(term)
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      setImportStatus({
        type: 'success',
        message: `Import terminé : ${successCount} termes importés avec succès`,
        details: errorCount > 0 ? `${errorCount} erreurs rencontrées` : undefined
      })

      if (onImportComplete) {
        onImportComplete()
      }

    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      setImportStatus({
        type: 'error',
        message: "Erreur lors de l'import",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      })
    } finally {
      setImporting(false)
      // Réinitialiser l'input
      event.target.value = ""
    }
  }

  const handleExport = async () => {
    setExporting(true)
    
    try {
      const response = await fetch("/api/dictionary/terms")
      if (!response.ok) throw new Error("Erreur lors de la récupération des termes")
      
      const data = await response.json()
      const terms = data.terms || []

      // Créer le fichier JSON
      const jsonContent = JSON.stringify(terms, null, 2)
      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      
      // Télécharger le fichier
      const a = document.createElement("a")
      a.href = url
      a.download = `dictionnaire-lahalex-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error("Erreur lors de l'export:", error)
      alert("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }

  const parseCSV = (csvText: string): DictionaryTerm[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const terms: DictionaryTerm[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const term: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ""
        if (header === 'synonyms' || header === 'examples' || header === 'relatedTerms') {
          term[header] = value ? value.split(';').map(s => s.trim()) : []
        } else {
          term[header] = value
        }
      })

      // Ajouter les champs manquants
      if (term.term && term.definition) {
        terms.push({
          id: generateId(),
          term: term.term,
          definition: term.definition,
          category: term.category,
          synonyms: term.synonyms || [],
          examples: term.examples || [],
          relatedTerms: term.relatedTerms || [],
          source: term.source,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    }

    return terms
  }

  const parseTextFile = (text: string): DictionaryTerm[] => {
    const terms: DictionaryTerm[] = []
    const sections = text.split(/\n\s*\n/) // Séparer par des lignes vides

    sections.forEach(section => {
      const lines = section.split('\n').filter(line => line.trim())
      if (lines.length < 2) return

      const term: any = {}
      
      lines.forEach(line => {
        if (line.startsWith('Terme:')) {
          term.term = line.replace('Terme:', '').trim()
        } else if (line.startsWith('Définition:')) {
          term.definition = line.replace('Définition:', '').trim()
        } else if (line.startsWith('Catégorie:')) {
          term.category = line.replace('Catégorie:', '').trim()
        } else if (line.startsWith('Synonymes:')) {
          term.synonyms = line.replace('Synonymes:', '').trim().split(',').map(s => s.trim())
        } else if (line.startsWith('Exemples:')) {
          term.examples = [line.replace('Exemples:', '').trim()]
        } else if (line.startsWith('Source:')) {
          term.source = line.replace('Source:', '').trim()
        }
      })

      if (term.term && term.definition) {
        terms.push({
          id: generateId(),
          term: term.term,
          definition: term.definition,
          category: term.category,
          synonyms: term.synonyms || [],
          examples: term.examples || [],
          relatedTerms: term.relatedTerms || [],
          source: term.source,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
    })

    return terms
  }

  const validateTerm = (term: any): term is DictionaryTerm => {
    return term.term && 
           typeof term.term === 'string' && 
           term.definition && 
           typeof term.definition === 'string' &&
           term.term.trim().length > 0 &&
           term.definition.trim().length > 0
  }

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const downloadTemplate = () => {
    const template = `Terme: [Nom du terme juridique]
Définition: [Définition complète du terme]
Catégorie: [Catégorie juridique]
Synonymes: [Synonyme 1, Synonyme 2]
Exemples: [Exemple d'utilisation du terme]
Source: [Source légale de référence]

Terme: [Autre terme juridique]
Définition: [Définition complète du terme]
Catégorie: [Catégorie juridique]
Synonymes: [Synonyme 1, Synonyme 2]
Exemples: [Exemple d'utilisation du terme]
Source: [Source légale de référence]`

    const blob = new Blob([template], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "template-dictionnaire.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Import/Export du dictionnaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importer des termes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Importez des termes depuis un fichier JSON, CSV, TXT ou MD. 
                Assurez-vous que chaque terme a au minimum un nom et une définition.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".json,.csv,.txt,.md"
                  onChange={handleFileImport}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={importing}
                />
              </div>
              
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Modèle
              </Button>
            </div>

            {importStatus && (
              <div className={`p-4 rounded-lg border ${
                importStatus.type === 'success' 
                  ? 'border-green-200 bg-green-50' 
                  : importStatus.type === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start gap-3">
                  {importStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : importStatus.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      importStatus.type === 'success' 
                        ? 'text-green-800' 
                        : importStatus.type === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }`}>
                      {importStatus.message}
                    </p>
                    {importStatus.details && (
                      <p className={`text-sm mt-1 ${
                        importStatus.type === 'success' 
                          ? 'text-green-700' 
                          : importStatus.type === 'error'
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}>
                        {importStatus.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {importing && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Import en cours...
              </div>
            )}
          </div>

          {/* Export */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Exporter le dictionnaire</h3>
              <p className="text-sm text-gray-600 mb-4">
                Téléchargez tous les termes du dictionnaire au format JSON pour sauvegarde ou partage.
              </p>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Export en cours..." : "Exporter en JSON"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Instructions d'import</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Format JSON</h4>
                <p>Structure attendue : tableau d'objets avec les propriétés : term, definition, category, synonyms, examples, relatedTerms, source</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Format CSV</h4>
                <p>Colonnes : term, definition, category, synonyms (séparés par ;), examples (séparés par ;), relatedTerms (séparés par ;), source</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Format TXT/MD</h4>
                <p>Structure : sections séparées par des lignes vides, avec des préfixes (Terme:, Définition:, etc.)</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Champs requis</h4>
                <p>Seuls le terme et la définition sont obligatoires. Les autres champs sont optionnels.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


