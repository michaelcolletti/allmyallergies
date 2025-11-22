/**
 * AllMyAllergies Engine - Main service (TypeScript)
 * Following ruv's SPARC methodology - Refinement & Completion phase
 *
 * Simple, fast, maintainable TypeScript implementation
 */

import { AllergyProfile, DetectionResult, SeverityLevel } from './types';
import { IngredientParser } from './ingredientParser';
import { AllergenMatcher } from './allergenMatcher';
import { getAllergenDatabase } from './allergenDatabase';

export class AllergiesEngine {
  private parser: IngredientParser;
  private matcher: AllergenMatcher;
  private db = getAllergenDatabase();

  constructor() {
    this.parser = new IngredientParser();
    this.matcher = new AllergenMatcher();
  }

  /**
   * Analyze ingredients text against user's allergy profile
   */
  analyzeIngredients(
    ingredientsText: string,
    profile: AllergyProfile
  ): DetectionResult {
    // Parse ingredients (fast TypeScript parsing)
    const ingredients = this.parser.parse(ingredientsText);

    // Match against allergens
    const matches = this.matcher.findAllergens(ingredients, profile);

    // Determine severity
    const severity = matches.length > 0
      ? this.matcher.getMaxSeverity(matches, profile)
      : 'Mild';

    // Generate warnings
    const warnings = this.generateWarnings(matches, profile);

    // Calculate overall confidence
    const confidence = this.calculateConfidence(matches);

    return {
      isSafe: matches.length === 0,
      detectedAllergens: [...new Set(matches.map(m => m.allergen))],
      severity,
      warnings,
      confidence,
      matchedIngredients: matches,
    };
  }

  /**
   * Fast barcode lookup (mock for now - integrate with real API later)
   */
  async lookupBarcode(barcode: string): Promise<{
    barcode: string;
    productName: string;
    ingredients: string;
    allergens: string[];
  }> {
    // TODO: Integrate with real product database API
    // For now, return mock data
    return {
      barcode,
      productName: 'Sample Product',
      ingredients: 'wheat flour, milk, eggs, sugar',
      allergens: ['wheat', 'milk', 'eggs'],
    };
  }

  private generateWarnings(
    matches: ReturnType<AllergenMatcher['findAllergens']>,
    profile: AllergyProfile
  ): string[] {
    const warnings: string[] = [];

    for (const match of matches) {
      // Extract allergen name (remove cross-reaction suffix)
      const allergenName = match.allergen.split(' (')[0];

      const allergy = profile.allergies.find(a =>
        a.name.toLowerCase() === allergenName.toLowerCase()
      );

      if (!allergy) continue;

      switch (allergy.severity) {
        case 'Anaphylaxis':
          warnings.push(`⚠️ DANGER: ${allergenName} can cause anaphylaxis!`);
          break;
        case 'Severe':
          warnings.push(`⚠️ WARNING: Severe allergy to ${allergenName}`);
          break;
        case 'Moderate':
          warnings.push(`⚠️ CAUTION: Contains ${allergenName}`);
          break;
      }

      // Add cross-reaction warnings
      if (match.matchType === 'cross-reaction') {
        warnings.push(`⚠️ Cross-reaction possible: ${match.allergen}`);
      }
    }

    return warnings;
  }

  private calculateConfidence(
    matches: ReturnType<AllergenMatcher['findAllergens']>
  ): number {
    if (matches.length === 0) {
      return 1.0; // High confidence it's safe
    }

    // Average confidence of all matches
    const sum = matches.reduce((acc, m) => acc + m.confidence, 0);
    return sum / matches.length;
  }

  /**
   * Search allergen database
   */
  searchAllergens(query: string) {
    return this.db.search(query);
  }

  /**
   * Get all known allergens
   */
  getAllAllergens() {
    return this.db.getAllAllergens();
  }
}

// Singleton instance
let engineInstance: AllergiesEngine | null = null;

export function getAllergiesEngine(): AllergiesEngine {
  if (!engineInstance) {
    engineInstance = new AllergiesEngine();
  }
  return engineInstance;
}
