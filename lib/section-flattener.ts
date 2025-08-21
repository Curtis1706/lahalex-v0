import { v4 as uuidv4 } from 'uuid';
import type { RawNestedSection, ArticleMetadata } from '../types/article'; // Corrected import path

/**
 * Recursively flattens a nested section structure and assigns unique IDs.
 * Converts 'articles' arrays into individual sections.
 * @param nestedSections The sections array from the loaded JSON (RawNestedSection[]).
 * @returns A flat array of sections suitable for ArticleMetadata['sections'].
 */
export function flattenAndAssignSectionIds(nestedSections: RawNestedSection[]): ArticleMetadata['sections'] {
  const flatSections: ArticleMetadata['sections'] = [];
  let globalOrder = 0; // To maintain a global order across all flattened sections

  function traverse(sections: RawNestedSection[]) {
    sections.forEach((section) => {
      const currentLevel = section.level;

      // Ensure a unique ID for the section itself
      const sectionId = section.id || uuidv4();

      flatSections.push({
        id: sectionId,
        title: section.title,
        level: currentLevel,
        order: globalOrder++, // Assign global order
        startIndex: 0, // Not directly used for Markdown, but required by type
        endIndex: 0,   // Not directly used for Markdown, but required by type
      });

      // Process nested children
      if (section.children && section.children.length > 0) {
        traverse(section.children);
      }

      // Process articles as leaf sections, one level deeper than their parent
      if (section.articles && section.articles.length > 0) {
        section.articles.forEach((articleTitle: string) => { // Explicitly typed articleTitle
          flatSections.push({
            id: uuidv4(), // Unique ID for each article
            title: articleTitle,
            level: currentLevel + 1, // Articles are one level deeper
            order: globalOrder++, // Assign global order
            startIndex: 0, // Not directly used for Markdown
            endIndex: 0,   // Not directly used for Markdown
          });
        });
      }
    });
  }

  traverse(nestedSections); // Start traversal
  return flatSections;
}
