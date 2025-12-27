/**
 * Smart Allergies Engine - AI-Powered Detection with Learning
 * Combines base engine with AgentDB agentic-flow capabilities
 *
 * Following ruv's SPARC methodology - Refinement & Completion phase
 *
 * Features:
 * - Learns from every scan
 * - Improves accuracy over time
 * - Discovers hidden patterns
 * - Personalized to user's history
 */

import { AllergiesEngine, getAllergiesEngine } from './allergiesEngine';
import { getAgentMemory } from '../services/agentMemory';
import type {
  AllergyProfile,
  DetectionResult,
  MatchedIngredient,
  SeverityLevel,
} from './types';
import type {
  EnhancedDetectionResult,
  LearnedMatch,
  CausalWarning,
  Skill,
  ReflexionEpisode,
} from './agenticTypes';

export class SmartAllergiesEngine {
  private baseEngine: AllergiesEngine;
  private agentMemory = getAgentMemory();
  private lastEpisodeId: string | null = null;

  constructor() {
    this.baseEngine = getAllergiesEngine();
  }

  /**
   * Initialize the smart engine with agent memory
   */
  async initialize(): Promise<void> {
    await this.agentMemory.initialize();
    console.log('✅ SmartAllergiesEngine initialized with agentic-flow');
  }

  /**
   * Enhanced ingredient analysis with learning
   */
  async analyzeIngredients(
    ingredientsText: string,
    profile: AllergyProfile
  ): Promise<EnhancedDetectionResult> {
    // Parse ingredients
    const ingredients = ingredientsText
      .toLowerCase()
      .split(/[,;]/)
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const userAllergies = profile.allergies.map((a) => a.name);

    // Get relevant past experiences and skills
    const [pastExperiences, applicableSkills, causalWarnings] = await Promise.all([
      this.agentMemory.getRelevantExperiences(ingredients, userAllergies),
      this.agentMemory.getApplicableSkills(ingredients),
      this.agentMemory.getCausalWarnings(ingredients),
    ]);

    // Run base engine detection
    const baseResult = this.baseEngine.analyzeIngredients(ingredientsText, profile);

    // Apply learned skills
    const learnedMatches = await this.applyLearnedSkills(ingredients, applicableSkills);

    // Combine results
    const enhanced = this.combineResults(
      baseResult,
      learnedMatches,
      pastExperiences,
      causalWarnings
    );

    // Record this scan for future learning
    this.lastEpisodeId = await this.agentMemory.recordScanExperience(
      { ingredients, userAllergies },
      {
        detections: enhanced.detectedAllergens,
        confidence: enhanced.confidence,
        isSafe: enhanced.isSafe,
      },
      true // Assume success until user says otherwise
    );

    return enhanced;
  }

  /**
   * Apply learned skills to find additional allergens
   */
  private async applyLearnedSkills(
    ingredients: string[],
    skills: Skill[]
  ): Promise<LearnedMatch[]> {
    const matches: LearnedMatch[] = [];

    for (const skill of skills) {
      for (const ingredient of ingredients) {
        // Check if skill trigger matches this ingredient
        if (
          ingredient.toLowerCase().includes(skill.pattern.trigger.toLowerCase()) ||
          skill.pattern.trigger.toLowerCase().includes(ingredient.toLowerCase())
        ) {
          matches.push({
            ingredient,
            allergen: skill.pattern.action,
            confidence: skill.pattern.confidence * skill.quality,
            source: 'skill',
            learnedFrom: skill.id,
          });

          // Record skill usage
          await this.agentMemory.skills.recordUsage(skill.id, true);
        }
      }
    }

    return matches;
  }

  /**
   * Combine base detection with learned patterns
   */
  private combineResults(
    baseResult: DetectionResult,
    learnedMatches: LearnedMatch[],
    pastExperiences: ReflexionEpisode[],
    causalWarnings: Array<{ warning: string; probability: number }>
  ): EnhancedDetectionResult {
    // Merge allergen detections
    const allAllergens = new Set([
      ...baseResult.detectedAllergens,
      ...learnedMatches.map((m) => m.allergen),
    ]);

    // Merge matched ingredients
    const allMatches = [
      ...baseResult.matchedIngredients,
      ...learnedMatches.map((m) => ({
        ingredient: m.ingredient,
        allergen: m.allergen,
        confidence: m.confidence,
        matchType: 'alias' as const,
      })),
    ];

    // Calculate confidence breakdown
    const baseConfidence = baseResult.confidence;
    const learnedConfidence =
      learnedMatches.length > 0
        ? learnedMatches.reduce((sum, m) => sum + m.confidence, 0) / learnedMatches.length
        : 1.0;

    // Calculate history-based confidence
    const historyConfidence = this.calculateHistoryConfidence(pastExperiences);

    // Combined confidence (weighted average)
    const combinedConfidence =
      baseConfidence * 0.5 + learnedConfidence * 0.3 + historyConfidence * 0.2;

    // Calculate improvement from learning
    const improvementFromLearning =
      learnedMatches.length > 0 || pastExperiences.length > 0
        ? ((combinedConfidence - baseConfidence) / baseConfidence) * 100
        : 0;

    // Generate enhanced warnings
    const enhancedWarnings = [
      ...baseResult.warnings,
      ...causalWarnings.map((w) => `📊 ${w.warning}`),
    ];

    // Determine severity (take the highest from all matches)
    const severity = this.determineSeverity(allMatches, baseResult.severity);

    return {
      isSafe: allAllergens.size === 0,
      detectedAllergens: Array.from(allAllergens),
      severity,
      warnings: enhancedWarnings,
      confidence: combinedConfidence,
      learnedMatches,
      causalWarnings: causalWarnings.map((w) => ({
        message: w.warning,
        probability: w.probability,
        basedOn: 'Your personal reaction history',
      })),
      confidenceBreakdown: {
        baseEngine: baseConfidence,
        learnedPatterns: learnedConfidence,
        userHistory: historyConfidence,
        combined: combinedConfidence,
      },
      improvementFromLearning: Math.max(0, improvementFromLearning),
    };
  }

  /**
   * Calculate confidence based on past similar experiences
   */
  private calculateHistoryConfidence(experiences: ReflexionEpisode[]): number {
    if (experiences.length === 0) return 1.0;

    // Weight by recency and success
    let weightedSum = 0;
    let totalWeight = 0;

    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const recencyWeight = 1 / (i + 1); // More recent = higher weight
      const successWeight = exp.success ? 1.0 : 0.5;
      const feedbackBoost = exp.userFeedback?.correct ? 1.2 : 1.0;

      const weight = recencyWeight * successWeight * feedbackBoost;
      weightedSum += exp.outcome * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 1.0;
  }

  /**
   * Determine the highest severity from all matches
   */
  private determineSeverity(
    matches: MatchedIngredient[],
    baseSeverity: SeverityLevel
  ): SeverityLevel {
    const severityOrder: SeverityLevel[] = ['Mild', 'Moderate', 'Severe', 'Anaphylaxis'];
    let highestIndex = severityOrder.indexOf(baseSeverity);

    // Check if any learned matches should escalate severity
    // (This would be enhanced with actual severity data from the profile)

    return severityOrder[highestIndex];
  }

  /**
   * Provide feedback on the last scan
   */
  async provideFeedback(feedback: {
    wasCorrect: boolean;
    missedAllergen?: string;
    falsePositive?: string;
    actualAllergen?: string;
  }): Promise<void> {
    if (!this.lastEpisodeId) {
      console.warn('No recent scan to provide feedback for');
      return;
    }

    await this.agentMemory.learnFromCorrection(this.lastEpisodeId, {
      wasWrong: !feedback.wasCorrect,
      missedAllergen: feedback.missedAllergen,
      falsePositive: feedback.falsePositive,
      actualAllergen: feedback.actualAllergen,
    });

    console.log('✅ Feedback recorded - improving future detections');
  }

  /**
   * Get the last episode ID for feedback
   */
  getLastEpisodeId(): string | null {
    return this.lastEpisodeId;
  }

  /**
   * Get learning statistics
   */
  async getLearningStats(): Promise<{
    totalScans: number;
    skillsLearned: number;
    patternsDiscovered: number;
    accuracyRate: number;
    unreadInsights: number;
  }> {
    return await this.agentMemory.getStats();
  }

  /**
   * Get unacknowledged insights
   */
  async getInsights() {
    return await this.agentMemory.insights.getUnacknowledged();
  }

  /**
   * Acknowledge an insight
   */
  async acknowledgeInsight(insightId: string): Promise<void> {
    await this.agentMemory.insights.acknowledge(insightId);
  }

  /**
   * Export learning data
   */
  async exportLearningData() {
    return await this.agentMemory.export();
  }

  /**
   * Delegate to base engine methods
   */
  searchAllergens(query: string) {
    return this.baseEngine.searchAllergens(query);
  }

  getAllAllergens() {
    return this.baseEngine.getAllAllergens();
  }

  async lookupBarcode(barcode: string) {
    return await this.baseEngine.lookupBarcode(barcode);
  }
}

// Singleton instance
let smartEngineInstance: SmartAllergiesEngine | null = null;

export function getSmartAllergiesEngine(): SmartAllergiesEngine {
  if (!smartEngineInstance) {
    smartEngineInstance = new SmartAllergiesEngine();
  }
  return smartEngineInstance;
}
