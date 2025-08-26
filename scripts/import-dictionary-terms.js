// Script pour importer en masse des termes dans le dictionnaire
// Usage: node scripts/import-dictionary-terms.js

const fs = require('fs');
const path = require('path');

// Exemple de structure de données à importer
const sampleTerms = [
  {
    term: "Acte authentique",
    grammaticalInfo: "locution nominale, masculin",
    definition: "Document rédigé par un officier public (notaire, huissier, officier d'état civil) qui fait foi jusqu'à inscription de faux. Il constitue une preuve parfaite de son contenu.",
    category: "droit-civil",
    synonyms: ["Document officiel", "Acte notarié"],
    examples: [
      "Le contrat de vente immobilière doit être établi par acte authentique devant notaire pour être valide."
    ],
    relatedTerms: ["Notaire", "Huissier", "Preuve", "Foi"],
    source: "Code civil, article 1319"
  },
  {
    term: "Bail commercial",
    grammaticalInfo: "locution nominale, masculin",
    definition: "Contrat par lequel le propriétaire d'un local commercial met celui-ci à la disposition d'un locataire pour l'exercice d'une activité commerciale, artisanale ou libérale.",
    category: "droit-commercial",
    synonyms: ["Location commerciale", "Louage commercial"],
    examples: [
      "Le boulanger a signé un bail commercial de 9 ans pour son magasin de pain."
    ],
    relatedTerms: ["Locataire", "Propriétaire", "Local commercial", "Droit au bail"],
    source: "Code de commerce, articles L. 145-1 et suivants"
  },
  {
    term: "Contrat de travail",
    grammaticalInfo: "locution nominale, masculin",
    definition: "Accord par lequel une personne s'engage à travailler pour le compte d'une autre, sous la subordination de laquelle elle se place, moyennant une rémunération.",
    category: "droit-du-travail",
    synonyms: ["Accord de travail", "Engagement professionnel"],
    examples: [
      "L'employé a signé un contrat de travail à durée indéterminée avec une période d'essai de 2 mois."
    ],
    relatedTerms: ["Employeur", "Salarié", "Subordination", "Rémunération"],
    source: "Code du travail, article L. 1221-1"
  }
];

async function importTerms(terms) {
  console.log(`🔄 Import de ${terms.length} termes...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    try {
      console.log(`📝 [${i + 1}/${terms.length}] Import de "${term.term}"...`);
      
      const response = await fetch("http://localhost:3000/api/dictionary/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(term)
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ "${term.term}" importé avec succès`);
      } else {
        errorCount++;
        const error = await response.text();
        console.error(`❌ Erreur pour "${term.term}":`, error);
      }
      
      // Pause entre les requêtes pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Erreur de connexion pour "${term.term}":`, error.message);
    }
  }
  
  console.log(`\n📊 Résumé de l'import :`);
  console.log(`✅ Succès : ${successCount}`);
  console.log(`❌ Erreurs : ${errorCount}`);
  console.log(`📚 Total des termes dans le dictionnaire après import : ${successCount + errorCount}`);
}

async function importFromFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier non trouvé : ${filePath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let terms;
    
    if (filePath.endsWith('.json')) {
      terms = JSON.parse(fileContent);
    } else if (filePath.endsWith('.csv')) {
      // Conversion CSV basique (à adapter selon le format)
      const lines = fileContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      terms = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const term = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            if (header === 'synonyms' || header === 'examples' || header === 'relatedTerms') {
              term[header] = values[index].split(';').map(s => s.trim()).filter(s => s);
            } else {
              term[header] = values[index];
            }
          }
        });
        return term;
      });
    } else {
      console.error("❌ Format de fichier non supporté. Utilisez .json ou .csv");
      return;
    }
    
    if (!Array.isArray(terms)) {
      console.error("❌ Le fichier doit contenir un tableau de termes");
      return;
    }
    
    await importTerms(terms);
    
  } catch (error) {
    console.error("❌ Erreur lors de la lecture du fichier:", error.message);
  }
}

async function main() {
  console.log("📚 IMPORT EN MASSE DE TERMES JURIDIQUES");
  console.log("=======================================\n");
  
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Import depuis un fichier spécifié
    const filePath = args[0];
    console.log(`📁 Import depuis le fichier : ${filePath}`);
    await importFromFile(filePath);
  } else {
    // Import des termes d'exemple
    console.log("📝 Import des termes d'exemple...");
    await importTerms(sampleTerms);
    
    console.log("\n💡 Pour importer depuis un fichier :");
    console.log("   node scripts/import-dictionary-terms.js chemin/vers/fichier.json");
    console.log("   node scripts/import-dictionary-terms.js chemin/vers/fichier.csv");
  }
}

// Exécuter le script
main().catch(console.error);
