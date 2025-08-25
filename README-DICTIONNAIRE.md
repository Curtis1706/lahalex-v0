# Dictionnaire Juridique LAHALEX

## Vue d'ensemble

Le dictionnaire juridique LAHALEX est un système complet de gestion et de consultation de termes juridiques, conçu pour aider les utilisateurs à comprendre les concepts juridiques du droit béninois et africain.

## Fonctionnalités

### 🔍 Recherche avancée
- Recherche textuelle dans les termes, définitions et synonymes
- Filtrage par catégorie juridique
- Historique des recherches récentes
- Résultats triés par pertinence

### 📚 Gestion des termes
- Ajout, modification et suppression de termes
- Catégorisation automatique
- Gestion des synonymes et termes liés
- Exemples d'utilisation
- Sources légales référencées

### 📁 Import/Export
- Import depuis JSON, CSV, TXT ou MD
- Export au format JSON
- Validation automatique des données
- Modèles d'import fournis

### 🎨 Interface utilisateur
- Design responsive et moderne
- Navigation intuitive
- Catégories colorées
- Recherche en temps réel

## Structure des données

### Terme du dictionnaire
```typescript
interface DictionaryTerm {
  id: string                    // Identifiant unique
  term: string                  // Nom du terme (obligatoire)
  definition: string            // Définition (obligatoire)
  category?: string             // Catégorie juridique
  synonyms?: string[]           // Synonymes
  examples?: string[]           // Exemples d'utilisation
  relatedTerms?: string[]       // Termes liés
  source?: string               // Source légale
  createdAt: string             // Date de création
  updatedAt: string             // Date de modification
}
```

### Catégorie
```typescript
interface DictionaryCategory {
  id: string                    // Identifiant unique
  name: string                  // Nom de la catégorie
  description?: string          // Description
  color: string                 // Couleur d'affichage
  termCount: number             // Nombre de termes
}
```

## Utilisation

### Pour les utilisateurs finaux

1. **Accéder au dictionnaire** : Naviguez vers `/dictionnaire`
2. **Rechercher un terme** : Utilisez la barre de recherche
3. **Filtrer les résultats** : Utilisez les filtres par catégorie
4. **Consulter un terme** : Cliquez sur un résultat pour voir les détails
5. **Naviguer entre les termes** : Utilisez les liens vers les termes liés

### Pour les administrateurs

1. **Accéder à l'administration** : Naviguez vers `/admin/dictionnaire`
2. **Gérer les termes** : Ajouter, modifier ou supprimer des termes
3. **Importer des données** : Utilisez l'onglet Import/Export
4. **Exporter les données** : Téléchargez le dictionnaire complet

## Formats d'import supportés

### JSON
```json
[
  {
    "term": "Acte authentique",
    "definition": "Document rédigé par un officier public...",
    "category": "droit-civil",
    "synonyms": ["Document authentique", "Acte notarié"],
    "examples": ["Le contrat de mariage doit être établi..."],
    "source": "Code civil, article 1317"
  }
]
```

### CSV
```csv
term,definition,category,synonyms,examples,source
"Acte authentique","Document rédigé par un officier public...","droit-civil","Document authentique;Acte notarié","Le contrat de mariage doit être établi...","Code civil, article 1317"
```

### TXT/MD
```text
Terme: Acte authentique
Définition: Document rédigé par un officier public...
Catégorie: droit-civil
Synonymes: Document authentique, Acte notarié
Exemples: Le contrat de mariage doit être établi...
Source: Code civil, article 1317

Terme: Bail commercial
Définition: Contrat de location d'un local commercial...
```

## API Endpoints

### Recherche
- `GET /api/dictionary/search?query=...&category=...&limit=...`

### Catégories
- `GET /api/dictionary/categories`

### Gestion des termes
- `GET /api/dictionary/terms` - Lister tous les termes
- `POST /api/dictionary/terms` - Créer un terme
- `PUT /api/dictionary/terms` - Modifier un terme
- `DELETE /api/dictionary/terms?id=...` - Supprimer un terme

## Installation et configuration

### Prérequis
- Node.js 18+
- Next.js 13+
- Base de données (optionnel, stockage en mémoire par défaut)

### Étapes d'installation
1. Clonez le repository
2. Installez les dépendances : `npm install`
3. Lancez le serveur de développement : `npm run dev`
4. Accédez à l'application : `http://localhost:3000`

### Configuration de la base de données
Pour une utilisation en production, remplacez le stockage en mémoire par une vraie base de données :

1. Configurez votre base de données (PostgreSQL, MySQL, MongoDB)
2. Modifiez les fichiers API pour utiliser votre ORM/ODM
3. Ajoutez les variables d'environnement nécessaires

## Personnalisation

### Ajouter de nouvelles catégories
Modifiez le fichier `app/api/dictionary/categories/route.ts` pour ajouter de nouvelles catégories juridiques.

### Modifier le design
Les composants utilisent Tailwind CSS. Modifiez les classes CSS dans les composants pour personnaliser l'apparence.

### Étendre les fonctionnalités
Le système est modulaire. Vous pouvez facilement ajouter :
- Système de favoris
- Historique des consultations
- Export vers d'autres formats
- Intégration avec d'autres systèmes

## Support et maintenance

### Logs
Les erreurs sont loggées dans la console du serveur. Surveillez les logs pour détecter les problèmes.

### Sauvegarde
Exportez régulièrement le dictionnaire via l'interface d'administration pour créer des sauvegardes.

### Mise à jour
Le système est conçu pour être facilement mis à jour. Vérifiez régulièrement les nouvelles fonctionnalités et corrections de bugs.

## Contribution

Pour contribuer au développement du dictionnaire :

1. Forkez le repository
2. Créez une branche pour votre fonctionnalité
3. Développez et testez votre code
4. Soumettez une pull request

## Licence

Ce projet est sous licence [votre licence]. Voir le fichier LICENSE pour plus de détails.

## Contact

Pour toute question ou suggestion concernant le dictionnaire juridique LAHALEX, contactez l'équipe de développement.
