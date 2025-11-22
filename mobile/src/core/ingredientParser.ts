/**
 * Ingredient Parser - TypeScript implementation
 * Following ruv's SPARC methodology - Pseudocode to Code phase
 *
 * Fast ingredient text parsing for mobile
 */

import { Ingredient } from './types';

export class IngredientParser {
  private separatorRegex = /[,;]|\band\b/i;
  private quantityRegex = /\(([^)]+)\)/;
  private percentageRegex = /(\d+(?:\.\d+)?)\s*%/;

  /**
   * Parse ingredient list text into structured ingredients
   * Handles various formats:
   * - "flour, sugar, eggs"
   * - "wheat flour (enriched), milk, eggs"
   * - "water 50%, sugar 30%, salt 20%"
   */
  parse(text: string): Ingredient[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Remove common prefixes
    const cleaned = this.removeCommonPrefixes(text);

    // Split by separators
    const parts = cleaned
      .split(this.separatorRegex)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    return parts
      .map(part => this.parseIngredient(part))
      .filter((ing): ing is Ingredient => ing !== null);
  }

  private removeCommonPrefixes(text: string): string {
    const prefixes = [
      'ingredients:',
      'contains:',
      'made with:',
      'allergens:',
      'may contain:',
    ];

    let result = text.toLowerCase();
    for (const prefix of prefixes) {
      if (result.startsWith(prefix)) {
        result = result.substring(prefix.length);
        break;
      }
    }
    return result.trim();
  }

  private parseIngredient(text: string): Ingredient | null {
    if (text.length === 0) return null;

    let name = text;
    let quantity: string | undefined;
    let percentage: number | undefined;

    // Extract percentage
    const pctMatch = this.percentageRegex.exec(text);
    if (pctMatch) {
      percentage = parseFloat(pctMatch[1]);
      name = text.replace(this.percentageRegex, '').trim();
    }

    // Extract quantity (in parentheses)
    const qtyMatch = this.quantityRegex.exec(name);
    if (qtyMatch) {
      quantity = qtyMatch[1];
      name = name.replace(this.quantityRegex, '').trim();
    }

    const normalizedName = this.normalizeName(name);

    if (normalizedName.length === 0) return null;

    return {
      name,
      normalizedName,
      quantity,
      percentage,
    };
  }

  private normalizeName(name: string): string {
    // Remove extra whitespace
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  /**
   * Fast path for barcode data (already structured)
   */
  parseStructured(ingredients: string[]): Ingredient[] {
    return ingredients
      .map(name => {
        const normalizedName = this.normalizeName(name);
        if (normalizedName.length === 0) return null;
        return {
          name,
          normalizedName,
        };
      })
      .filter((ing): ing is Ingredient => ing !== null);
  }
}
