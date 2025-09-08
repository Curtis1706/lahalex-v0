# Système QCM pour les Fiches de Synthèse

## Vue d'ensemble

Le système QCM (Questionnaire à Choix Multiples) a été intégré dans les fiches de synthèse et fiches de méthode pour permettre aux utilisateurs de tester leur compréhension du contenu.

## Fonctionnalités

### 🎯 **5 Questions par Fiche**
- Chaque fiche de synthèse dispose de 5 questions QCM
- Les questions couvrent les points essentiels du contenu
- Format à choix multiples avec 4 options par question

### 📝 **Interface Interactive**
- Navigation entre les questions (Précédent/Suivant)
- Sélection des réponses avec boutons radio
- Barre de progression visuelle
- Indication du nombre de questions répondues

### 🏆 **Système de Score**
- Calcul automatique du score (X/5)
- Pourcentage de réussite
- Messages d'encouragement personnalisés selon le score
- Code couleur : Vert (80%+), Bleu (60%+), Jaune (40%+), Rouge (<40%)

### ✅ **Correction Détaillée**
- Affichage des bonnes réponses
- Mise en évidence des erreurs de l'utilisateur
- Explications pour chaque question
- Possibilité de recommencer le QCM

## Structure des Données

### Format JSON
```json
{
  "document-id": {
    "title": "Titre de la fiche",
    "questions": [
      {
        "id": 1,
        "question": "Texte de la question",
        "options": [
          "Option 1",
          "Option 2", 
          "Option 3",
          "Option 4"
        ],
        "correctAnswer": 1,
        "explanation": "Explication de la bonne réponse"
      }
    ]
  }
}
```

### Propriétés des Questions
- `id` : Identifiant unique de la question
- `question` : Texte de la question
- `options` : Tableau des 4 options de réponse
- `correctAnswer` : Index de la bonne réponse (0-3)
- `explanation` : Explication optionnelle de la bonne réponse

## Intégration

### Dans DocumentReader
Le composant QCM est automatiquement affiché :
- **Desktop** : Dans la sidebar droite, sous les outils d'annotation
- **Mobile** : Dans la sidebar mobile, sous les outils d'annotation
- **Condition** : Seulement pour les fiches de synthèse et fiches de méthode

### Chargement Automatique
- Les questions QCM sont chargées automatiquement au montage du composant
- Le fichier `/public/qcm-questions.json` est consulté pour récupérer les questions
- Affichage conditionnel selon le type de document

## Utilisation

### Pour l'Utilisateur
1. **Lire la fiche** : Consulter le contenu de la fiche de synthèse
2. **Répondre au QCM** : Sélectionner une réponse pour chaque question
3. **Naviguer** : Utiliser les boutons Précédent/Suivant
4. **Terminer** : Cliquer sur "Terminer le QCM" après avoir répondu à toutes les questions
5. **Consulter les résultats** : Voir le score et les corrections
6. **Recommencer** : Utiliser le bouton "Recommencer le QCM"

### Pour le Développeur
1. **Créer les questions** : Ajouter les questions dans `/public/qcm-questions.json`
2. **Structurer les données** : Respecter le format JSON défini
3. **Tester** : Vérifier le bon fonctionnement avec la fiche correspondante

## Personnalisation

### Ajouter de Nouvelles Fiches
1. Créer une nouvelle entrée dans `/public/qcm-questions.json`
2. Utiliser l'ID du document comme clé
3. Ajouter 5 questions pertinentes
4. Tester l'intégration

### Modifier le Style
Le composant utilise Tailwind CSS et peut être personnalisé via :
- Classes CSS personnalisées
- Variables CSS pour les couleurs
- Composants UI existants (Button, Card, etc.)

## Avantages

### Pédagogiques
- **Évaluation** : Test de compréhension immédiat
- **Révision** : Outil de révision interactif
- **Engagement** : Interface ludique et motivante
- **Feedback** : Correction immédiate avec explications

### Techniques
- **Responsive** : Adaptation automatique mobile/desktop
- **Performance** : Chargement asynchrone des questions
- **Maintenance** : Gestion centralisée des questions
- **Extensibilité** : Facile d'ajouter de nouvelles fiches

## Support

Pour toute question ou problème avec le système QCM :
1. Vérifier la structure JSON des questions
2. Contrôler les logs de la console
3. Tester avec différentes fiches de synthèse
4. Vérifier la compatibilité mobile/desktop







