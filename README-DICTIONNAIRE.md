# 📚 Dictionnaire Juridique LAHALEX

Ce dictionnaire juridique permet de stocker, rechercher et gérer des termes juridiques avec leurs définitions, exemples et sources.

## 🚀 Fonctionnalités

- **Recherche alphabétique** : Navigation par lettre de l'alphabet
- **Recherche textuelle** : Recherche dans les termes et définitions
- **Structure hiérarchique** : Organisation par catégories juridiques
- **Persistance des données** : Sauvegarde automatique dans un fichier JSON
- **API REST** : Endpoints pour créer, modifier, supprimer et rechercher des termes

## 🛠️ Installation et démarrage

1. **Démarrer le serveur Next.js** :
   ```bash
   npm run dev
   ```

2. **Accéder au dictionnaire** :
   - URL : `http://localhost:3000/dictionnaire`
   - Interface : Navigation alphabétique + recherche

## 📝 Ajout de nouveaux termes

### Méthode 1 : Interface web
- Aller sur `/admin/dictionnaire`
- Utiliser l'interface d'administration pour ajouter des termes

### Méthode 2 : Script interactif
```bash
node scripts/add-dictionary-term.js
```
Le script vous guidera pour saisir :
- Terme juridique
- Informations grammaticales
- Définition
- Catégorie
- Synonymes
- Exemples
- Termes liés
- Source

### Méthode 3 : Import en masse
```bash
# Import des termes d'exemple
node scripts/import-dictionary-terms.js

# Import depuis un fichier JSON
node scripts/import-dictionary-terms.js chemin/vers/termes.json

# Import depuis un fichier CSV
node scripts/import-dictionary-terms.js chemin/vers/termes.csv
```

## 📊 Structure des données

### Format JSON pour l'import
```json
[
  {
    "term": "Acte authentique",
    "grammaticalInfo": "locution nominale, masculin",
    "definition": "Document rédigé par un officier public...",
    "category": "droit-civil",
    "synonyms": ["Document officiel", "Acte notarié"],
    "examples": ["Le contrat de vente immobilière..."],
    "relatedTerms": ["Notaire", "Huissier", "Preuve"],
    "source": "Code civil, article 1319"
  }
]
```

### Format CSV pour l'import
```csv
term,grammaticalInfo,definition,category,synonyms,examples,relatedTerms,source
"Acte authentique","locution nominale, masculin","Document rédigé...","droit-civil","Document officiel;Acte notarié","Le contrat de vente...","Notaire;Huissier;Preuve","Code civil, article 1319"
```

## 🔧 API Endpoints

### GET `/api/dictionary/terms`
Récupérer tous les termes ou filtrer
- `?id=term-id` : Terme spécifique
- `?category=droit-civil` : Par catégorie
- `?search=mot-clé` : Recherche textuelle

### POST `/api/dictionary/terms`
Créer un nouveau terme

### PUT `/api/dictionary/terms`
Mettre à jour un terme existant

### DELETE `/api/dictionary/terms?id=term-id`
Supprimer un terme

## 🧪 Tests et maintenance

### Tester l'API de suppression
```bash
node scripts/test-delete-term.js
```

### Restaurer un terme supprimé par erreur
```bash
node scripts/restore-deleted-term.js
```

## 📁 Organisation des fichiers

```
data/
├── dictionary-terms.json          # Stockage principal des termes
└── example-term-format.md        # Format d'exemple

scripts/
├── add-dictionary-term.js        # Ajout interactif de termes
├── import-dictionary-terms.js    # Import en masse
├── add-example-term.js          # Ajout d'un terme d'exemple
├── test-delete-term.js          # Test de l'API de suppression
└── restore-deleted-term.js      # Restauration d'un terme supprimé

app/
├── dictionnaire/                 # Page principale du dictionnaire
│   ├── page.tsx                 # Liste alphabétique
│   └── [term]/page.tsx          # Définition d'un terme
└── api/dictionary/               # API REST
    └── terms/route.ts           # Gestion des termes
```

## 🎯 Catégories juridiques recommandées

- `droit-civil` : Droit civil, contrats, responsabilité
- `droit-pénal` : Droit pénal, infractions, procédure
- `droit-commercial` : Droit des affaires, sociétés
- `droit-administratif` : Droit public, administration
- `droit-constitutionnel` : Constitution, institutions
- `droit-du-travail` : Relations de travail, droit social
- `droit-international` : Droit international public/privé
- `droit-fiscal` : Fiscalité, impôts
- `droit-immobilier` : Droit de la propriété, baux
- `droit-financier` : Droit bancaire, marchés financiers

## 🔍 Recherche et navigation

### Navigation alphabétique
- Cliquer sur une lettre pour voir tous les termes commençant par cette lettre
- Utiliser "Voir plus..." pour afficher tous les termes d'une lettre
- Utiliser "Voir moins..." pour revenir à l'affichage limité

### Recherche textuelle
- Barre de recherche dans la sidebar
- Recherche dans : termes, définitions, synonymes, exemples
- Recherche globale depuis le header principal

## 💾 Persistance des données

- **Sauvegarde automatique** : Chaque modification est immédiatement sauvegardée
- **Fichier JSON** : Stockage dans `data/dictionary-terms.json`
- **Organisation par lettre** : Structure automatiquement maintenue
- **Tri alphabétique** : Maintien de l'ordre alphabétique

## 🚨 Résolution des problèmes

### Les termes disparaissent au rechargement
- ✅ **Résolu** : L'API charge maintenant depuis le fichier JSON
- ✅ **Persistant** : Les données sont sauvegardées automatiquement

### La suppression des termes ne fonctionne pas
- ✅ **Résolu** : URL de l'API corrigée dans l'interface d'administration
- ✅ **Testé** : Script de test disponible pour vérifier l'API
- ✅ **Sécurisé** : Confirmation demandée avant suppression

### Erreur lors de l'ajout de termes
- Vérifier que le serveur Next.js est démarré
- Vérifier le format des données (term et definition obligatoires)
- Consulter les logs de la console

### Problème de performance avec beaucoup de termes
- La pagination est gérée côté client (20 termes par défaut)
- Utiliser "Voir plus..." pour afficher tous les termes
- La recherche est optimisée pour de grandes quantités de données

## 🔮 Améliorations futures

- [ ] Interface d'administration avancée
- [ ] Export des données (PDF, Word)
- [ ] Historique des modifications
- [ ] Système de tags et étiquettes
- [ ] Intégration avec d'autres modules LAHALEX
- [ ] API de recherche avancée
- [ ] Système de suggestions automatiques

## 📞 Support

Pour toute question ou problème :
1. Vérifier ce README
2. Consulter les logs de la console
3. Vérifier la structure des fichiers JSON
4. Tester avec les scripts d'exemple

---

**Développé pour LAHALEX** - Plateforme juridique complète
