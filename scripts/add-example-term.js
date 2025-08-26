// Script pour ajouter le terme "Ab intestat" via l'API
// Usage: node scripts/add-example-term.js

const termData = {
  term: "Ab intestat",
  grammaticalInfo: "locution latine, féminin",
  definition: `Locution juridique latine signifiant qu'une succession est ouverte en l'absence de testament, soit parce que le défunt n'en a jamais rédigé, soit parce que le testament est nul, inefficace ou caduc. Elle désigne à la fois ce mode légal de transmission des biens selon l'ordre successoral fixé par le droit civil, et les héritiers qui en bénéficient sans avoir été expressément désignés par le défunt.`,
  examples: [
    "Après le décès soudain de M. Bio, qui n'avait laissé aucun testament, ses deux enfants ont été déclarés héritiers ab intestat et ont reçu chacun une part égale des biens successoraux conformément aux règles de la dévolution légale."
  ],
  category: "Droit civil",
  source: "Code civil, articles 721 et suivants",
  synonyms: ["Succession légale", "Dévolution légale"],
  relatedTerms: ["Testament", "Héritier", "Succession", "Dévolution"]
};

async function addExampleTerm() {
  try {
    console.log("🔄 Ajout du terme 'Ab intestat'...");
    
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
      console.log("📝 Détails:", result.term);
      
      // Tester la recherche
      console.log("\n🔍 Test de la recherche...");
      const searchResponse = await fetch("http://localhost:3000/api/dictionary/search?query=ab intestat");
      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        console.log("✅ Recherche fonctionnelle !");
        console.log("🔍 Résultats trouvés:", searchResult.results.length);
      }
      
    } else {
      const error = await response.text();
      console.error("❌ Erreur lors de l'ajout:", error);
    }
    
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
    console.log("💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)");
  }
}

// Exécuter le script
addExampleTerm();






