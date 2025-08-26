// Script pour ajouter facilement de nouveaux termes au dictionnaire
// Usage: node scripts/add-dictionary-term.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function addDictionaryTerm() {
  try {
    console.log("📚 AJOUT D'UN NOUVEAU TERME JURIDIQUE");
    console.log("=====================================\n");

    // Collecter les informations du terme
    const term = await question("Terme juridique : ");
    const grammaticalInfo = await question("Informations grammaticales (optionnel) : ");
    const definition = await question("Définition : ");
    const category = await question("Catégorie (ex: droit-civil, droit-pénal, droit-commercial) : ");
    
    let synonyms = [];
    const synonymsInput = await question("Synonymes (séparés par des virgules, optionnel) : ");
    if (synonymsInput.trim()) {
      synonyms = synonymsInput.split(',').map(s => s.trim()).filter(s => s);
    }
    
    let examples = [];
    const examplesInput = await question("Exemples (séparés par des virgules, optionnel) : ");
    if (examplesInput.trim()) {
      examples = examplesInput.split(',').map(s => s.trim()).filter(s => s);
    }
    
    let relatedTerms = [];
    const relatedInput = await question("Termes liés (séparés par des virgules, optionnel) : ");
    if (relatedInput.trim()) {
      relatedTerms = relatedInput.split(',').map(s => s.trim()).filter(s => s);
    }
    
    const source = await question("Source (ex: Code civil, article X) : ");

    const termData = {
      term: term.trim(),
      grammaticalInfo: grammaticalInfo.trim() || undefined,
      definition: definition.trim(),
      category: category.trim(),
      synonyms,
      examples,
      relatedTerms,
      source: source.trim()
    };

    console.log("\n📝 Récapitulatif du terme à ajouter :");
    console.log(JSON.stringify(termData, null, 2));

    const confirm = await question("\nConfirmer l'ajout ? (oui/non) : ");
    
    if (confirm.toLowerCase() === 'oui' || confirm.toLowerCase() === 'o') {
      console.log("\n🔄 Ajout du terme...");
      
      const response = await fetch("http://localhost:3000/api/dictionary/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(termData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Terme ajouté avec succès !");
        console.log("🆔 ID généré:", result.term.id);
        console.log("📅 Créé le:", new Date(result.term.createdAt).toLocaleString());
        
        // Vérifier que le terme est bien accessible
        console.log("\n🔍 Vérification de l'ajout...");
        const verifyResponse = await fetch(`http://localhost:3000/api/dictionary/terms?id=${result.term.id}`);
        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          console.log("✅ Terme vérifié et accessible !");
          console.log("📊 Total des termes dans le dictionnaire:", verifyResult.total);
        }
        
      } else {
        const error = await response.text();
        console.error("❌ Erreur lors de l'ajout:", error);
      }
    } else {
      console.log("❌ Ajout annulé.");
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.log("💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)");
  } finally {
    rl.close();
  }
}

// Exécuter le script
addDictionaryTerm();
