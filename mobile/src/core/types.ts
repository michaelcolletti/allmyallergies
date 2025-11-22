/**
 * Core TypeScript types for AllMyAllergies
 * Following ruv's SPARC methodology - Specification phase
 */

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe' | 'Anaphylaxis';

export interface Allergy {
  id: string;
  name: string;
  severity: SeverityLevel;
  aliases: string[];
  notes?: string;
  addedAt: string;
}

export interface Sensitivity {
  id: string;
  name: string;
  symptoms: string[];
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface AllergyProfile {
  userId: string;
  allergies: Allergy[];
  sensitivities: Sensitivity[];
  emergencyContacts: EmergencyContact[];
  medicalId?: string;
  epiPenExpiry?: string;
}

export interface Ingredient {
  name: string;
  normalizedName: string;
  quantity?: string;
  percentage?: number;
}

export interface DetectionResult {
  isSafe: boolean;
  detectedAllergens: string[];
  severity: SeverityLevel;
  warnings: string[];
  confidence: number;
  matchedIngredients: MatchedIngredient[];
}

export interface MatchedIngredient {
  ingredient: string;
  allergen: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'alias' | 'cross-reaction';
}

export enum AllergenCategory {
  TreeNut = 'tree_nut',
  Peanut = 'peanut',
  Shellfish = 'shellfish',
  Fish = 'fish',
  Milk = 'milk',
  Egg = 'egg',
  Soy = 'soy',
  Wheat = 'wheat',
  Sesame = 'sesame',
  Mustard = 'mustard',
  Celery = 'celery',
  Lupin = 'lupin',
  Sulfites = 'sulfites',
  Molluscs = 'molluscs',
  Other = 'other',
}

export interface AllergenInfo {
  name: string;
  commonNames: string[];
  scientificName?: string;
  category: AllergenCategory;
  crossReactions: string[];
}
