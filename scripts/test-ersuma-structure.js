import fs from 'fs';
import path from 'path';

const testERSUMAStructure = () => {
  const filePath = path.join(process.cwd(), 'content/documents/statut-ersuma-ohada/metadata.json');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    console.log('🔍 Test de la structure ERSUMA OHADA');
    console.log('=====================================');
    
    if (data.structure && data.structure.sections) {
      const sections = data.structure.sections;
      
      // Compter les différents types
      const titres = sections.filter(s => s.type === 'titre');
      const articles = sections.filter(s => s.type === 'article');
      
      console.log(`📊 Total des sections: ${sections.length}`);
      console.log(`📋 Titres: ${titres.length}`);
      console.log(`📄 Articles: ${articles.length}`);
      
      // Vérifier la hiérarchie
      console.log('\n🏗️  Hiérarchie des titres:');
      titres.forEach(titre => {
        console.log(`  ${titre.title} (${titre.children.length} articles)`);
        if (titre.children.length > 0) {
          titre.children.forEach(childId => {
            const child = sections.find(s => s.id === childId);
            if (child) {
              console.log(`    └─ ${child.title} (niveau ${child.level})`);
            }
          });
        }
      });
      
      // Vérifier les paths
      console.log('\n🛣️  Vérification des paths:');
      articles.forEach(article => {
        console.log(`  ${article.title}: [${article.path.join(' → ')}]`);
      });
      
      console.log('\n✅ Structure testée avec succès !');
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
};

testERSUMAStructure();

