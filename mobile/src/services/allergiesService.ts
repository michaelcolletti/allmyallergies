/**
 * Allergies Service - Smart AI-Powered Implementation
 * Powered by AgentDB agentic-flow for intelligent learning
 *
 * Following ruv's SPARC methodology with agentic-flow integration
 */

import { getSmartAllergiesEngine } from '../core';
import { getAgentMemory } from './agentMemory';
import type { AllergyProfile, DetectionResult, EnhancedDetectionResult } from '../core';

const smartEngine = getSmartAllergiesEngine();
const agentMemory = getAgentMemory();

/**
 * Initialize the smart engine with agentic-flow capabilities
 */
export async function initEngine(): Promise<void> {
  await smartEngine.initialize();
  console.log('✅ SmartAllergiesEngine initialized with agentic-flow');
}

/**
 * Analyze ingredients with AI-powered learning
 * Returns enhanced results with learned patterns
 */
export async function analyzeIngredients(
  ingredientsText: string,
  profile: AllergyProfile
): Promise<EnhancedDetectionResult> {
  try {
    const result = await smartEngine.analyzeIngredients(ingredientsText, profile);
    return result;
  } catch (error) {
    console.error('Smart ingredient analysis failed:', error);
    throw error;
  }
}

/**
 * Provide feedback on the last scan for learning
 */
export async function provideFeedback(feedback: {
  wasCorrect: boolean;
  missedAllergen?: string;
  falsePositive?: string;
  actualAllergen?: string;
}): Promise<void> {
  await smartEngine.provideFeedback(feedback);
}

/**
 * Get the last scan episode ID for feedback
 */
export function getLastEpisodeId(): string | null {
  return smartEngine.getLastEpisodeId();
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
    const result = await smartEngine.lookupBarcode(barcode);
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
  return smartEngine.searchAllergens(query);
}

/**
 * Get all known allergens
 */
export function getAllAllergens() {
  return smartEngine.getAllAllergens();
}

/**
 * Get learning statistics
 */
export async function getLearningStats() {
  return await smartEngine.getLearningStats();
}

/**
 * Get unread insights
 */
export async function getInsights() {
  return await smartEngine.getInsights();
}

/**
 * Acknowledge an insight
 */
export async function acknowledgeInsight(insightId: string) {
  return await smartEngine.acknowledgeInsight(insightId);
}

/**
 * Export learning data for backup
 */
export async function exportLearningData() {
  return await smartEngine.exportLearningData();
}

/**
 * Track a reaction event
 */
export async function trackReaction(reaction: Parameters<typeof agentMemory.trackReaction>[0]) {
  return await agentMemory.trackReaction(reaction);
}

/**
 * Get recent reactions
 */
export async function getRecentReactions(count: number = 10) {
  return await agentMemory.reactions.getRecent(count);
}
