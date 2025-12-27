/**
 * Agentic-Flow Types for AllMyAllergies
 * Based on ruv's AgentDB agentic-flow architecture
 *
 * Following SPARC methodology - Specification phase
 * Implements three memory systems:
 * 1. Reflexion Memory - Self-critique and improvement
 * 2. Skill Library - Reusable patterns and knowledge
 * 3. Causal Memory Graph - Cause-and-effect reasoning
 */

// ============================================
// REFLEXION MEMORY TYPES
// ============================================

export interface ReflexionEpisode {
  id: string;
  sessionId: string;
  taskId: string;
  timestamp: string;

  // What was attempted
  input: {
    ingredients: string[];
    userAllergies: string[];
  };

  // What happened
  output: {
    detections: string[];
    confidence: number;
    isSafe: boolean;
  };

  // How well it went
  outcome: number; // 0.0 to 1.0
  success: boolean;

  // Self-reflection
  critique: string;

  // User feedback (if provided)
  userFeedback?: {
    correct: boolean;
    actualAllergen?: string;
    missedAllergen?: string;
    falsePositive?: string;
  };

  // Embedding for semantic search
  embedding?: number[];
}

// ============================================
// SKILL LIBRARY TYPES
// ============================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;

  // Pattern definition
  pattern: {
    trigger: string; // What ingredient/pattern triggers this skill
    action: string;  // What allergen to detect
    confidence: number;
  };

  // Quality metrics
  quality: number; // 0.0 to 1.0
  usageCount: number;
  successRate: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  learnedFrom: string[]; // Episode IDs that contributed
}

export type SkillCategory =
  | 'allergen_detection'
  | 'alias_recognition'
  | 'cross_reaction'
  | 'ingredient_parsing'
  | 'severity_assessment';

// ============================================
// CAUSAL MEMORY TYPES
// ============================================

export interface CausalEdge {
  id: string;
  cause: string;  // e.g., "consumed_peanut"
  effect: string; // e.g., "reaction_severe"
  strength: number; // 0.0 to 1.0 (probability)

  // Evidence
  evidence: {
    occurrences: number;
    confirmedCount: number;
    deniedCount: number;
  };

  // Temporal data
  avgTimeToEffect: number; // minutes
  minTimeToEffect: number;
  maxTimeToEffect: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CausalNode {
  id: string;
  type: CausalNodeType;
  name: string;

  // Connections
  incomingEdges: string[]; // Edge IDs
  outgoingEdges: string[]; // Edge IDs

  // Stats
  occurrences: number;
  lastSeen: string;
}

export type CausalNodeType =
  | 'ingredient'
  | 'allergen'
  | 'reaction'
  | 'symptom'
  | 'severity';

// ============================================
// REACTION TRACKING TYPES
// ============================================

export interface ReactionEvent {
  id: string;
  userId: string;
  timestamp: string;

  // What was consumed
  consumedItems: ConsumedItem[];

  // Reaction details
  reaction: {
    occurred: boolean;
    severity: ReactionSeverity;
    symptoms: string[];
    timeToOnset: number; // minutes
    duration: number; // minutes
    treatmentRequired: boolean;
    medicationUsed?: string[];
  };

  // Context
  location?: string;
  notes?: string;

  // Linked analysis
  linkedScanId?: string;
}

export interface ConsumedItem {
  name: string;
  ingredients: string[];
  scannedBarcode?: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export type ReactionSeverity =
  | 'none'
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'anaphylaxis';

// ============================================
// LEARNING INSIGHTS TYPES
// ============================================

export interface LearningInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;

  // Source data
  supportingEpisodes: string[];
  supportingReactions: string[];

  // Actionable recommendation
  recommendation?: string;

  // Metadata
  discoveredAt: string;
  acknowledged: boolean;
}

export type InsightType =
  | 'new_allergen_suspected'
  | 'cross_reaction_discovered'
  | 'hidden_ingredient_found'
  | 'safe_alternative_found'
  | 'pattern_detected'
  | 'accuracy_improved';

// ============================================
// DETECTION ENHANCEMENT TYPES
// ============================================

export interface EnhancedDetectionResult {
  // Base detection result
  isSafe: boolean;
  detectedAllergens: string[];
  severity: string;
  warnings: string[];
  confidence: number;

  // Learning enhancements
  learnedMatches: LearnedMatch[];
  causalWarnings: CausalWarning[];

  // Confidence breakdown
  confidenceBreakdown: {
    baseEngine: number;
    learnedPatterns: number;
    userHistory: number;
    combined: number;
  };

  // Improvement metrics
  improvementFromLearning: number; // percentage
}

export interface LearnedMatch {
  ingredient: string;
  allergen: string;
  confidence: number;
  source: 'skill' | 'reflexion' | 'causal';
  learnedFrom: string; // Session ID or skill ID
}

export interface CausalWarning {
  message: string;
  probability: number;
  basedOn: string; // Description of causal chain
}

// ============================================
// SYNC & EXPORT TYPES
// ============================================

export interface AgentMemoryExport {
  version: string;
  exportedAt: string;

  reflexionEpisodes: ReflexionEpisode[];
  skills: Skill[];
  causalEdges: CausalEdge[];
  causalNodes: CausalNode[];
  reactionEvents: ReactionEvent[];
  insights: LearningInsight[];

  // Stats
  stats: {
    totalScans: number;
    totalReactions: number;
    skillsLearned: number;
    accuracyImprovement: number;
  };
}
