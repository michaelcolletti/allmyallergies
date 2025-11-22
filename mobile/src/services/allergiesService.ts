/**
 * Allergies Service - TypeScript implementation
 * Simple, fast, maintainable
 *
 * Following ruv's SPARC methodology with TypeScript
 */

import { getAllergiesEngine } from '../core';
import type { AllergyProfile, DetectionResult } from '../core';

const engine = getAllergiesEngine();

/**
 * Initialize the engine (instant with TypeScript - no WASM loading!)
 */
export async function initEngine(): Promise<void> {
  console.log('✅ AllergiesEngine initialized (TypeScript)');
  return Promise.resolve();
}

/**
 * Analyze ingredients text for allergens
 */
export async function analyzeIngredients(
  ingredientsText: string,
  profile: AllergyProfile
): Promise<DetectionResult> {
  try {
    const result = engine.analyzeIngredients(ingredientsText, profile);
    return result;
  } catch (error) {
    console.error('Ingredient analysis failed:', error);
    throw error;
  }
}

/**
 * Lookup product by barcode
 */
export interface BarcodeResult {
  barcode: string;
  productName: string;
  ingredients: string;
  allergens: string[];
}

export async function lookupBarcode(barcode: string): Promise<BarcodeResult> {
  try {
    const result = await engine.lookupBarcode(barcode);
    return result;
  } catch (error) {
    console.error('Barcode lookup failed:', error);
    throw error;
  }
}

/**
 * Search for allergens in database
 */
export function searchAllergens(query: string) {
  return engine.searchAllergens(query);
}

/**
 * Get all known allergens
 */
export function getAllAllergens() {
  return engine.getAllAllergens();
}
