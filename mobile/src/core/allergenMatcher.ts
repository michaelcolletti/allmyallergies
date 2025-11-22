/**
 * Allergen Matcher - TypeScript implementation with fuzzy matching
 * Following ruv's SPARC methodology - Architecture phase
 *
 * Uses Levenshtein distance for fuzzy matching
 */

import Fuse from 'fuse.js';
import { AllergyProfile, Ingredient, MatchedIngredient, SeverityLevel } from './types';
import { getAllergenDatabase } from './allergenDatabase';

export class AllergenMatcher {
  private db = getAllergenDatabase();

  /**
   * Find allergens in ingredients based on user profile
   */
  findAllergens(
    ingredients: Ingredient[],
    profile: AllergyProfile
  ): MatchedIngredient[] {
    const matches: MatchedIngredient[] = [];

    for (const ingredient of ingredients) {
      // Check against each allergy in profile
      for (const allergy of profile.allergies) {
        // Exact match
        if (this.isExactMatch(ingredient.normalizedName, allergy.name)) {
          matches.push({
            ingredient: ingredient.name,
            allergen: allergy.name,
            confidence: 1.0,
            matchType: 'exact',
          });
          continue;
        }

        // Check aliases
        for (const alias of allergy.aliases) {
          if (this.isExactMatch(ingredient.normalizedName, alias)) {
            matches.push({
              ingredient: ingredient.name,
              allergen: allergy.name,
              confidence: 0.95,
              matchType: 'alias',
            });
            break;
          }
        }

        // Fuzzy match
        const fuzzyScore = this.fuzzyMatch(ingredient.normalizedName, allergy.name);
        if (fuzzyScore > 0.85) {
          matches.push({
            ingredient: ingredient.name,
            allergen: allergy.name,
            confidence: fuzzyScore,
            matchType: 'fuzzy',
          });
        }
      }

      // Check database for additional allergens
      const dbMatches = this.db.containsAllergen(ingredient.normalizedName);
      for (const allergenInfo of dbMatches) {
        // Check if user is allergic to this
        const userAllergy = profile.allergies.find(a =>
          a.name.toLowerCase() === allergenInfo.name.toLowerCase()
        );

        if (!userAllergy) continue;

        // Check if already matched
        if (matches.some(m => m.allergen === allergenInfo.name && m.ingredient === ingredient.name)) {
          continue;
        }

        matches.push({
          ingredient: ingredient.name,
          allergen: allergenInfo.name,
          confidence: 0.9,
          matchType: 'exact',
        });

        // Check cross-reactions
        for (const crossAllergen of allergenInfo.crossReactions) {
          const crossUserAllergy = profile.allergies.find(a =>
            a.name.toLowerCase() === crossAllergen.toLowerCase()
          );

          if (crossUserAllergy) {
            matches.push({
              ingredient: ingredient.name,
              allergen: `${allergenInfo.name} (cross-reactive with ${crossAllergen})`,
              confidence: 0.75,
              matchType: 'cross-reaction',
            });
          }
        }
      }
    }

    return this.deduplicateMatches(matches);
  }

  private isExactMatch(ingredient: string, allergen: string): boolean {
    return ingredient.includes(allergen.toLowerCase());
  }

  /**
   * Fuzzy match using Levenshtein distance
   * Returns similarity score 0.0 - 1.0
   */
  private fuzzyMatch(s1: string, s2: string): number {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);

    if (maxLen === 0) return 1.0;

    const similarity = 1.0 - distance / maxLen;
    return Math.max(0, similarity);
  }

  /**
   * Calculate Levenshtein distance (edit distance)
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;

    const matrix: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  private deduplicateMatches(matches: MatchedIngredient[]): MatchedIngredient[] {
    const seen = new Map<string, MatchedIngredient>();

    for (const match of matches) {
      const key = `${match.ingredient}:${match.allergen}`;
      const existing = seen.get(key);

      if (!existing || match.confidence > existing.confidence) {
        seen.set(key, match);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Get maximum severity from matches
   */
  getMaxSeverity(
    matches: MatchedIngredient[],
    profile: AllergyProfile
  ): SeverityLevel {
    const severityOrder: SeverityLevel[] = ['Mild', 'Moderate', 'Severe', 'Anaphylaxis'];

    let maxSeverity: SeverityLevel = 'Mild';

    for (const match of matches) {
      // Extract allergen name (remove cross-reaction suffix)
      const allergenName = match.allergen.split(' (')[0];

      const allergy = profile.allergies.find(a =>
        a.name.toLowerCase() === allergenName.toLowerCase()
      );

      if (allergy) {
        const currentIndex = severityOrder.indexOf(allergy.severity);
        const maxIndex = severityOrder.indexOf(maxSeverity);

        if (currentIndex > maxIndex) {
          maxSeverity = allergy.severity;
        }
      }
    }

    return maxSeverity;
  }
}
