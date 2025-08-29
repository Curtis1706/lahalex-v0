# Système des Fiches de Synthèse - LAHALEX

## Vue d'ensemble

Le système des fiches de synthèse suit exactement la même logique et le même système que les fiches de méthode. Il permet de créer, gérer et consulter des documents de synthèse juridique.

## Architecture

### Structure des dossiers
```
content/documents/fiches-synthese/
├── [id-fiche]/
│   ├── metadata.json          # Métadonnées de la fiche
│   ├── [section-id].json      # Métadonnées de chaque section
│   └── [section-id].md        # Contenu Markdown de chaque section
```

### Format des données

#### Métadonnées de la fiche (metadata.json)
```json
{
  "id": "titre-de-la-fiche-timestamp",
  "title": "Titre de la fiche",
  "type": "fiche-synthese",
  "description": "Description de la fiche",
  "publishedDate": "2025-01-XX...",
  "structure": {
    "sections": [...],
    "totalArticles": 4
  }
}
```

#### Sections
Chaque section est détectée automatiquement à partir du contenu Markdown en cherchant les titres en gras (`**Titre**`).

## Interface d'administration

### Accès
- URL : `/admin/fiches-synthese`
- Authentification admin requise

### Fonctionnalités
1. **Création** : Formulaire avec titre, description et contenu
2. **Visualisation** : Liste des fiches existantes avec statistiques
3. **Suppression** : Suppression d'une fiche et de tout son contenu
4. **Consultation** : Lien direct vers la visualisation publique

### Processus de création
1. L'utilisateur remplit le formulaire
2. Le système génère un ID unique basé sur le titre
3. Le contenu est analysé pour extraire les sections
4. Chaque section est sauvegardée séparément
5. Les métadonnées sont créées avec la structure complète

## API

### Endpoints
- `GET /api/admin/fiches-synthese` : Liste des fiches
- `POST /api/admin/fiches-synthese` : Création d'une fiche
- `DELETE /api/admin/fiches-synthese/[id]` : Suppression d'une fiche

### Authentification
Tous les endpoints nécessitent un cookie `admin-auth` avec la valeur `"authenticated"`.

## Affichage public

### URL de consultation
`/documents/[id-fiche]`

### Rendu
- Le DocumentReader charge automatiquement le contenu complet
- Les sections sont affichées dans l'ordre défini
- Le contenu Markdown est rendu avec la mise en forme appropriée

## Intégration avec le système existant

### DocumentManager
- Gère le chargement des fiches de synthèse
- Compatible avec le système de documents existant
- Supporte la recherche et la navigation

### DocumentReader
- Affiche le contenu complet des fiches de synthèse
- Maintient la cohérence avec l'affichage des autres documents
- Supporte la recherche dans le contenu

## Utilisation

### Créer une fiche de synthèse
1. Aller sur `/admin/fiches-synthese`
2. Cliquer sur "➕ Créer une fiche de synthèse"
3. Remplir le formulaire :
   - **Titre** : Nom de la fiche
   - **Description** : Résumé court
   - **Contenu** : Contenu complet en Markdown avec sections en gras
4. Cliquer sur "Créer la fiche de synthèse"

### Format du contenu
```markdown
**Introduction**
Contenu de l'introduction...

**Définition**
Contenu de la définition...

**Utilisation**
Liste des utilisations :
- Point 1
- Point 2

**Conclusion**
Contenu de la conclusion...
```

### Consulter une fiche
1. Cliquer sur "👁️ Voir" dans la liste des fiches
2. Ou naviguer directement vers `/documents/[id-fiche]`

## Maintenance

### Sauvegarde
Les fiches sont stockées dans le système de fichiers et peuvent être sauvegardées avec le reste du contenu.

### Migration
Le système est compatible avec les migrations existantes et peut être étendu selon les besoins.

## Notes techniques

- Les sections sont automatiquement détectées et numérotées
- L'ordre des sections est préservé lors de l'affichage
- Le système gère les erreurs et les cas limites
- Compatible avec le système de recherche existant

