/**
 * Allergen Database - TypeScript implementation
 * Following ruv's SPARC methodology
 *
 * Provides fast allergen lookup using in-memory Map and fuzzy search
 */

import { AllergenInfo, AllergenCategory } from './types';

export class AllergenDatabase {
  private allergens: Map<string, AllergenInfo> = new Map();
  private categoryIndex: Map<AllergenCategory, Set<string>> = new Map();

  constructor() {
    this.initializeCommonAllergens();
  }

  /**
   * Initialize with FDA's "Big 9" + EU's additional allergens
   */
  private initializeCommonAllergens(): void {
    const commonAllergens: Array<[string, AllergenCategory, string[]]> = [
      // Tree nuts
      ['almond', AllergenCategory.TreeNut, ['almonds', 'almond meal', 'almond flour']],
      ['cashew', AllergenCategory.TreeNut, ['cashews', 'cashew butter']],
      ['walnut', AllergenCategory.TreeNut, ['walnuts', 'black walnut']],
      ['pecan', AllergenCategory.TreeNut, ['pecans']],
      ['pistachio', AllergenCategory.TreeNut, ['pistachios']],
      ['hazelnut', AllergenCategory.TreeNut, ['hazelnuts', 'filbert']],
      ['macadamia', AllergenCategory.TreeNut, ['macadamia nut', 'macadamias']],
      ['brazil nut', AllergenCategory.TreeNut, ['brazil nuts']],

      // Peanuts
      ['peanut', AllergenCategory.Peanut, ['peanuts', 'groundnut', 'peanut butter', 'peanut oil']],

      // Shellfish
      ['shrimp', AllergenCategory.Shellfish, ['prawns', 'scampi']],
      ['crab', AllergenCategory.Shellfish, ['crabmeat']],
      ['lobster', AllergenCategory.Shellfish, []],
      ['crayfish', AllergenCategory.Shellfish, ['crawfish']],

      // Fish
      ['salmon', AllergenCategory.Fish, []],
      ['tuna', AllergenCategory.Fish, []],
      ['cod', AllergenCategory.Fish, []],
      ['fish', AllergenCategory.Fish, ['fish oil', 'fish sauce']],

      // Milk
      ['milk', AllergenCategory.Milk, ['dairy', 'lactose', 'whey', 'casein', 'butter', 'cream', 'cheese', 'yogurt']],

      // Eggs
      ['egg', AllergenCategory.Egg, ['eggs', 'egg white', 'egg yolk', 'albumin', 'mayonnaise']],

      // Soy
      ['soy', AllergenCategory.Soy, ['soya', 'soybean', 'tofu', 'tempeh', 'soy lecithin', 'edamame']],

      // Wheat
      ['wheat', AllergenCategory.Wheat, ['wheat flour', 'whole wheat', 'durum', 'semolina', 'spelt']],

      // Sesame
      ['sesame', AllergenCategory.Sesame, ['sesame seed', 'tahini', 'sesame oil']],

      // Others (EU allergens)
      ['mustard', AllergenCategory.Mustard, ['mustard seed']],
      ['celery', AllergenCategory.Celery, ['celeriac']],
      ['lupin', AllergenCategory.Lupin, ['lupine']],
      ['sulfites', AllergenCategory.Sulfites, ['sulfur dioxide', 'sulphites']],
    ];

    for (const [name, category, aliases] of commonAllergens) {
      this.addAllergen({
        name,
        commonNames: aliases,
        category,
        crossReactions: [],
      });
    }

    this.addCrossReactions();
  }

  private addCrossReactions(): void {
    const crossReactions: Array<[string, string[]]> = [
      ['peanut', ['lupin']], // Legume cross-reaction
      ['shrimp', ['crab', 'lobster', 'crayfish']], // Shellfish cross-reaction
      ['milk', ['beef']], // Milk-meat syndrome
    ];

    for (const [allergen, crossWith] of crossReactions) {
      const info = this.allergens.get(allergen);
      if (info) {
        info.crossReactions = crossWith;
      }
    }
  }

  addAllergen(info: AllergenInfo): void {
    this.allergens.set(info.name.toLowerCase(), info);

    if (!this.categoryIndex.has(info.category)) {
      this.categoryIndex.set(info.category, new Set());
    }
    this.categoryIndex.get(info.category)!.add(info.name.toLowerCase());
  }

  get(name: string): AllergenInfo | undefined {
    return this.allergens.get(name.toLowerCase());
  }

  byCategory(category: AllergenCategory): AllergenInfo[] {
    const names = this.categoryIndex.get(category);
    if (!names) return [];

    return Array.from(names)
      .map(name => this.allergens.get(name))
      .filter((info): info is AllergenInfo => info !== undefined);
  }

  /**
   * Check if ingredient text contains any known allergen
   * Returns all matching allergens
   */
  containsAllergen(ingredient: string): AllergenInfo[] {
    const normalized = ingredient.toLowerCase();
    const matches: AllergenInfo[] = [];

    for (const info of this.allergens.values()) {
      // Check main name
      if (normalized.includes(info.name)) {
        matches.push(info);
        continue;
      }

      // Check aliases
      for (const alias of info.commonNames) {
        if (normalized.includes(alias.toLowerCase())) {
          matches.push(info);
          break;
        }
      }
    }

    return matches;
  }

  getAllAllergens(): AllergenInfo[] {
    return Array.from(this.allergens.values());
  }

  search(query: string): AllergenInfo[] {
    const normalized = query.toLowerCase();
    return Array.from(this.allergens.values()).filter(
      info =>
        info.name.includes(normalized) ||
        info.commonNames.some(alias => alias.toLowerCase().includes(normalized))
    );
  }
}

// Singleton instance
let dbInstance: AllergenDatabase | null = null;

export function getAllergenDatabase(): AllergenDatabase {
  if (!dbInstance) {
    dbInstance = new AllergenDatabase();
  }
  return dbInstance;
}
