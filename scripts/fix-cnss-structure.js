import fs from 'fs';
import path from 'path';

const fixCNSSStructure = () => {
  const filePath = path.join(process.cwd(), 'content/documents/convention-collective-cnss-benin/metadata.json');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    if (data.structure && data.structure.sections) {
      // Première passe : identifier les titres et corriger leurs niveaux
      const titres = new Map();
      
      data.structure.sections.forEach((section) => {
        if (section.type === 'titre') {
          section.level = 1; // Titres au niveau 1
          titres.set(section.id, section);
        } else if (section.type === 'article') {
          section.level = 3; // Articles au niveau 3
        } else if (section.type === 'chapitre') {
          section.level = 2; // Chapitres au niveau 2
        }
      });

      // Deuxième passe : corriger les paths des articles
      data.structure.sections.forEach((section) => {
        if (section.type === 'article') {
          // Chercher dans quel titre se trouve l'article
          for (const [titreId, titre] of titres) {
            if (titre.children && titre.children.includes(section.id)) {
              section.path = [titreId, section.id];
              break;
            }
          }
        } else if (section.type === 'chapitre') {
          // Chercher dans quel titre se trouve le chapitre
          for (const [titreId, titre] of titres) {
            if (titre.children && titre.children.includes(section.id)) {
              section.path = [titreId, section.id];
              break;
            }
          }
        }
      });

      // Troisième passe : corriger les paths des titres
      data.structure.sections.forEach((section) => {
        if (section.type === 'titre') {
          section.path = [section.id];
        }
      });
    }

    // Écrire le fichier corrigé
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('✅ Structure de la Convention collective CNSS corrigée avec succès !');
    console.log('📋 Hiérarchie : Titres (niveau 1) → Chapitres (niveau 2) → Articles (niveau 3)');
    console.log('🔗 Tous les paths ont été corrigés pour une navigation correcte');
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
};

fixCNSSStructure();

