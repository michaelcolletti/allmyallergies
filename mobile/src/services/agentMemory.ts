/**
 * Agent Memory Service
 * Implements AgentDB agentic-flow patterns for AllMyAllergies
 *
 * Following ruv's SPARC methodology - Architecture & Refinement phase
 *
 * Three memory systems:
 * 1. Reflexion Memory - Self-improvement through experience
 * 2. Skill Library - Reusable learned patterns
 * 3. Causal Memory - Cause-and-effect reasoning
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ReflexionEpisode,
  Skill,
  SkillCategory,
  CausalEdge,
  CausalNode,
  CausalNodeType,
  ReactionEvent,
  LearningInsight,
  InsightType,
  AgentMemoryExport,
} from '../core/agenticTypes';

// Storage keys
const STORAGE_KEYS = {
  REFLEXION: '@allmyallergies:reflexion',
  SKILLS: '@allmyallergies:skills',
  CAUSAL_EDGES: '@allmyallergies:causal_edges',
  CAUSAL_NODES: '@allmyallergies:causal_nodes',
  REACTIONS: '@allmyallergies:reactions',
  INSIGHTS: '@allmyallergies:insights',
  STATS: '@allmyallergies:agent_stats',
};

// ============================================
// REFLEXION MEMORY
// ============================================

class ReflexionMemory {
  private episodes: ReflexionEpisode[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REFLEXION);
      if (stored) {
        this.episodes = JSON.parse(stored);
      }
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load reflexion memory:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.REFLEXION,
        JSON.stringify(this.episodes)
      );
    } catch (error) {
      console.error('Failed to save reflexion memory:', error);
    }
  }

  /**
   * Store a new episode (scan result with context)
   */
  async store(episode: Omit<ReflexionEpisode, 'id' | 'timestamp'>): Promise<string> {
    await this.load();

    const id = `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEpisode: ReflexionEpisode = {
      ...episode,
      id,
      timestamp: new Date().toISOString(),
    };

    this.episodes.push(newEpisode);

    // Keep only last 1000 episodes to manage storage
    if (this.episodes.length > 1000) {
      this.episodes = this.episodes.slice(-1000);
    }

    await this.save();
    return id;
  }

  /**
   * Retrieve similar past experiences
   */
  async retrieve(
    query: { ingredients: string[]; allergens: string[] },
    options: { limit?: number; threshold?: number } = {}
  ): Promise<ReflexionEpisode[]> {
    await this.load();

    const { limit = 10, threshold = 0.5 } = options;

    // Simple keyword matching (in production, use embeddings)
    const scored = this.episodes.map((episode) => {
      let score = 0;

      // Match ingredients
      for (const ing of query.ingredients) {
        for (const epIng of episode.input.ingredients) {
          if (epIng.toLowerCase().includes(ing.toLowerCase()) ||
              ing.toLowerCase().includes(epIng.toLowerCase())) {
            score += 0.3;
          }
        }
      }

      // Match allergens
      for (const all of query.allergens) {
        for (const epAll of episode.input.userAllergies) {
          if (epAll.toLowerCase() === all.toLowerCase()) {
            score += 0.5;
          }
        }
      }

      // Boost successful episodes
      if (episode.success) {
        score *= 1.2;
      }

      // Boost episodes with user feedback
      if (episode.userFeedback) {
        score *= 1.3;
      }

      return { episode, score };
    });

    return scored
      .filter((s) => s.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.episode);
  }

  /**
   * Add user feedback to an episode
   */
  async addFeedback(
    episodeId: string,
    feedback: ReflexionEpisode['userFeedback']
  ): Promise<void> {
    await this.load();

    const episode = this.episodes.find((e) => e.id === episodeId);
    if (episode) {
      episode.userFeedback = feedback;
      await this.save();
    }
  }

  /**
   * Get success rate for a specific allergen
   */
  async getAllergenSuccessRate(allergen: string): Promise<number> {
    await this.load();

    const relevant = this.episodes.filter((e) =>
      e.input.userAllergies.some((a) => a.toLowerCase() === allergen.toLowerCase())
    );

    if (relevant.length === 0) return 0;

    const successful = relevant.filter((e) => e.success).length;
    return successful / relevant.length;
  }

  /**
   * Get all episodes
   */
  async getAll(): Promise<ReflexionEpisode[]> {
    await this.load();
    return [...this.episodes];
  }

  /**
   * Get recent episodes
   */
  async getRecent(count: number = 10): Promise<ReflexionEpisode[]> {
    await this.load();
    return this.episodes.slice(-count);
  }
}

// ============================================
// SKILL LIBRARY
// ============================================

class SkillLibrary {
  private skills: Skill[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SKILLS);
      if (stored) {
        this.skills = JSON.parse(stored);
      }
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load skill library:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(this.skills));
    } catch (error) {
      console.error('Failed to save skill library:', error);
    }
  }

  /**
   * Create a new skill from learned pattern
   */
  async create(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'successRate'>): Promise<string> {
    await this.load();

    const id = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newSkill: Skill = {
      ...skill,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      successRate: skill.quality,
    };

    // Check for existing similar skill
    const existing = this.skills.find(
      (s) =>
        s.pattern.trigger.toLowerCase() === skill.pattern.trigger.toLowerCase() &&
        s.pattern.action.toLowerCase() === skill.pattern.action.toLowerCase()
    );

    if (existing) {
      // Update existing skill's quality
      existing.quality = Math.max(existing.quality, skill.quality);
      existing.updatedAt = now;
      existing.learnedFrom = [...new Set([...existing.learnedFrom, ...skill.learnedFrom])];
      await this.save();
      return existing.id;
    }

    this.skills.push(newSkill);
    await this.save();
    return id;
  }

  /**
   * Search for relevant skills
   */
  async search(
    query: string,
    limit: number = 5
  ): Promise<Skill[]> {
    await this.load();

    const queryLower = query.toLowerCase();

    const scored = this.skills.map((skill) => {
      let score = 0;

      // Match trigger
      if (skill.pattern.trigger.toLowerCase().includes(queryLower) ||
          queryLower.includes(skill.pattern.trigger.toLowerCase())) {
        score += 0.5;
      }

      // Match action
      if (skill.pattern.action.toLowerCase().includes(queryLower) ||
          queryLower.includes(skill.pattern.action.toLowerCase())) {
        score += 0.3;
      }

      // Match name/description
      if (skill.name.toLowerCase().includes(queryLower)) {
        score += 0.2;
      }

      // Weight by quality and success rate
      score *= skill.quality * (0.5 + 0.5 * skill.successRate);

      return { skill, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.skill);
  }

  /**
   * Get skills by category
   */
  async getByCategory(category: SkillCategory): Promise<Skill[]> {
    await this.load();
    return this.skills.filter((s) => s.category === category);
  }

  /**
   * Record skill usage
   */
  async recordUsage(skillId: string, success: boolean): Promise<void> {
    await this.load();

    const skill = this.skills.find((s) => s.id === skillId);
    if (skill) {
      skill.usageCount++;
      // Update success rate with exponential moving average
      const alpha = 0.1;
      skill.successRate = skill.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
      skill.updatedAt = new Date().toISOString();
      await this.save();
    }
  }

  /**
   * Get high-quality skills
   */
  async getHighQuality(minQuality: number = 0.8): Promise<Skill[]> {
    await this.load();
    return this.skills.filter((s) => s.quality >= minQuality);
  }

  /**
   * Get all skills
   */
  async getAll(): Promise<Skill[]> {
    await this.load();
    return [...this.skills];
  }
}

// ============================================
// CAUSAL MEMORY GRAPH
// ============================================

class CausalMemoryGraph {
  private edges: CausalEdge[] = [];
  private nodes: CausalNode[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const [edgesStored, nodesStored] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CAUSAL_EDGES),
        AsyncStorage.getItem(STORAGE_KEYS.CAUSAL_NODES),
      ]);
      if (edgesStored) this.edges = JSON.parse(edgesStored);
      if (nodesStored) this.nodes = JSON.parse(nodesStored);
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load causal memory:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CAUSAL_EDGES, JSON.stringify(this.edges)),
        AsyncStorage.setItem(STORAGE_KEYS.CAUSAL_NODES, JSON.stringify(this.nodes)),
      ]);
    } catch (error) {
      console.error('Failed to save causal memory:', error);
    }
  }

  /**
   * Get or create a node
   */
  private async getOrCreateNode(name: string, type: CausalNodeType): Promise<CausalNode> {
    await this.load();

    let node = this.nodes.find(
      (n) => n.name.toLowerCase() === name.toLowerCase() && n.type === type
    );

    if (!node) {
      node = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        name,
        incomingEdges: [],
        outgoingEdges: [],
        occurrences: 0,
        lastSeen: new Date().toISOString(),
      };
      this.nodes.push(node);
    }

    node.occurrences++;
    node.lastSeen = new Date().toISOString();

    return node;
  }

  /**
   * Add or update a causal edge
   */
  async addEdge(
    cause: { name: string; type: CausalNodeType },
    effect: { name: string; type: CausalNodeType },
    timeToEffect: number,
    confirmed: boolean
  ): Promise<void> {
    await this.load();

    const causeNode = await this.getOrCreateNode(cause.name, cause.type);
    const effectNode = await this.getOrCreateNode(effect.name, effect.type);

    // Find existing edge
    let edge = this.edges.find(
      (e) => e.cause === causeNode.name && e.effect === effectNode.name
    );

    if (edge) {
      // Update existing edge
      edge.evidence.occurrences++;
      if (confirmed) {
        edge.evidence.confirmedCount++;
      } else {
        edge.evidence.deniedCount++;
      }

      // Update strength (probability)
      edge.strength =
        edge.evidence.confirmedCount /
        (edge.evidence.confirmedCount + edge.evidence.deniedCount);

      // Update timing stats
      if (confirmed && timeToEffect > 0) {
        const n = edge.evidence.confirmedCount;
        edge.avgTimeToEffect =
          (edge.avgTimeToEffect * (n - 1) + timeToEffect) / n;
        edge.minTimeToEffect = Math.min(edge.minTimeToEffect, timeToEffect);
        edge.maxTimeToEffect = Math.max(edge.maxTimeToEffect, timeToEffect);
      }

      edge.updatedAt = new Date().toISOString();
    } else {
      // Create new edge
      const id = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      edge = {
        id,
        cause: causeNode.name,
        effect: effectNode.name,
        strength: confirmed ? 1.0 : 0.0,
        evidence: {
          occurrences: 1,
          confirmedCount: confirmed ? 1 : 0,
          deniedCount: confirmed ? 0 : 1,
        },
        avgTimeToEffect: timeToEffect,
        minTimeToEffect: timeToEffect,
        maxTimeToEffect: timeToEffect,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.edges.push(edge);

      // Link nodes
      causeNode.outgoingEdges.push(id);
      effectNode.incomingEdges.push(id);
    }

    await this.save();
  }

  /**
   * Query for causal relationships
   */
  async findEffects(
    cause: string,
    options: { minStrength?: number; maxDepth?: number } = {}
  ): Promise<Array<{ effect: string; strength: number; path: string[] }>> {
    await this.load();

    const { minStrength = 0.5, maxDepth = 2 } = options;
    const results: Array<{ effect: string; strength: number; path: string[] }> = [];
    const visited = new Set<string>();

    const traverse = (current: string, depth: number, path: string[], cumulativeStrength: number) => {
      if (depth > maxDepth || visited.has(current)) return;
      visited.add(current);

      const outgoing = this.edges.filter((e) => e.cause === current);

      for (const edge of outgoing) {
        const newStrength = cumulativeStrength * edge.strength;
        if (newStrength >= minStrength) {
          results.push({
            effect: edge.effect,
            strength: newStrength,
            path: [...path, edge.effect],
          });
          traverse(edge.effect, depth + 1, [...path, edge.effect], newStrength);
        }
      }
    };

    traverse(cause, 0, [cause], 1.0);

    return results.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Discover new patterns (automated causal discovery)
   */
  async discoverPatterns(
    options: { minOccurrences?: number; minStrength?: number } = {}
  ): Promise<Array<{ pattern: string; confidence: number; description: string }>> {
    await this.load();

    const { minOccurrences = 3, minStrength = 0.6 } = options;
    const patterns: Array<{ pattern: string; confidence: number; description: string }> = [];

    for (const edge of this.edges) {
      if (edge.evidence.occurrences >= minOccurrences && edge.strength >= minStrength) {
        patterns.push({
          pattern: `${edge.cause} -> ${edge.effect}`,
          confidence: edge.strength,
          description: `${edge.cause} causes ${edge.effect} (${(edge.strength * 100).toFixed(0)}% confidence, observed ${edge.evidence.occurrences} times)`,
        });
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get all edges
   */
  async getAll(): Promise<{ edges: CausalEdge[]; nodes: CausalNode[] }> {
    await this.load();
    return { edges: [...this.edges], nodes: [...this.nodes] };
  }
}

// ============================================
// REACTION TRACKER
// ============================================

class ReactionTracker {
  private reactions: ReactionEvent[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REACTIONS);
      if (stored) {
        this.reactions = JSON.parse(stored);
      }
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(this.reactions));
    } catch (error) {
      console.error('Failed to save reactions:', error);
    }
  }

  async addReaction(reaction: Omit<ReactionEvent, 'id' | 'timestamp'>): Promise<string> {
    await this.load();

    const id = `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReaction: ReactionEvent = {
      ...reaction,
      id,
      timestamp: new Date().toISOString(),
    };

    this.reactions.push(newReaction);
    await this.save();
    return id;
  }

  async getAll(): Promise<ReactionEvent[]> {
    await this.load();
    return [...this.reactions];
  }

  async getRecent(count: number = 10): Promise<ReactionEvent[]> {
    await this.load();
    return this.reactions.slice(-count);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<ReactionEvent[]> {
    await this.load();
    return this.reactions.filter((r) => {
      const date = new Date(r.timestamp);
      return date >= startDate && date <= endDate;
    });
  }
}

// ============================================
// INSIGHT GENERATOR
// ============================================

class InsightGenerator {
  private insights: LearningInsight[] = [];
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.INSIGHTS);
      if (stored) {
        this.insights = JSON.parse(stored);
      }
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(this.insights));
    } catch (error) {
      console.error('Failed to save insights:', error);
    }
  }

  async addInsight(insight: Omit<LearningInsight, 'id' | 'discoveredAt' | 'acknowledged'>): Promise<string> {
    await this.load();

    const id = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newInsight: LearningInsight = {
      ...insight,
      id,
      discoveredAt: new Date().toISOString(),
      acknowledged: false,
    };

    this.insights.push(newInsight);
    await this.save();
    return id;
  }

  async getUnacknowledged(): Promise<LearningInsight[]> {
    await this.load();
    return this.insights.filter((i) => !i.acknowledged);
  }

  async acknowledge(insightId: string): Promise<void> {
    await this.load();
    const insight = this.insights.find((i) => i.id === insightId);
    if (insight) {
      insight.acknowledged = true;
      await this.save();
    }
  }

  async getAll(): Promise<LearningInsight[]> {
    await this.load();
    return [...this.insights];
  }
}

// ============================================
// MAIN AGENT MEMORY CLASS
// ============================================

class AgentMemory {
  public reflexion: ReflexionMemory;
  public skills: SkillLibrary;
  public causal: CausalMemoryGraph;
  public reactions: ReactionTracker;
  public insights: InsightGenerator;

  private initialized = false;

  constructor() {
    this.reflexion = new ReflexionMemory();
    this.skills = new SkillLibrary();
    this.causal = new CausalMemoryGraph();
    this.reactions = new ReactionTracker();
    this.insights = new InsightGenerator();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Promise.all([
      this.reflexion.load(),
      this.skills.load(),
      this.causal.load(),
      this.reactions.load(),
      this.insights.load(),
    ]);

    this.initialized = true;
    console.log('✅ AgentMemory initialized (agentic-flow)');
  }

  /**
   * Record a scan experience for learning
   */
  async recordScanExperience(
    input: { ingredients: string[]; userAllergies: string[] },
    output: { detections: string[]; confidence: number; isSafe: boolean },
    success: boolean
  ): Promise<string> {
    const critique = this.generateCritique(input, output, success);

    return await this.reflexion.store({
      sessionId: `session_${Date.now()}`,
      taskId: 'ingredient_scan',
      input,
      output,
      outcome: output.confidence,
      success,
      critique,
    });
  }

  private generateCritique(
    input: { ingredients: string[]; userAllergies: string[] },
    output: { detections: string[]; isSafe: boolean },
    success: boolean
  ): string {
    if (success) {
      if (output.detections.length > 0) {
        return `Successfully detected ${output.detections.length} allergen(s): ${output.detections.join(', ')}`;
      }
      return 'Correctly identified as safe - no allergens detected';
    }
    return 'Detection may have missed or incorrectly identified allergens - needs user feedback';
  }

  /**
   * Learn from user correction
   */
  async learnFromCorrection(
    episodeId: string,
    correction: {
      wasWrong: boolean;
      missedAllergen?: string;
      falsePositive?: string;
      actualAllergen?: string;
    }
  ): Promise<void> {
    // Add feedback to episode
    await this.reflexion.addFeedback(episodeId, {
      correct: !correction.wasWrong,
      actualAllergen: correction.actualAllergen,
      missedAllergen: correction.missedAllergen,
      falsePositive: correction.falsePositive,
    });

    // Create skill from correction
    if (correction.missedAllergen) {
      await this.skills.create({
        name: `detect_missed_${correction.missedAllergen}`,
        description: `Learned to detect ${correction.missedAllergen} from user correction`,
        category: 'allergen_detection',
        pattern: {
          trigger: correction.actualAllergen || 'unknown ingredient',
          action: correction.missedAllergen,
          confidence: 1.0,
        },
        quality: 1.0,
        learnedFrom: [episodeId],
      });

      // Generate insight
      await this.insights.addInsight({
        type: 'accuracy_improved',
        title: `Learned new detection: ${correction.missedAllergen}`,
        description: `I will now correctly identify ${correction.missedAllergen} in similar ingredients`,
        confidence: 1.0,
        supportingEpisodes: [episodeId],
        supportingReactions: [],
        recommendation: `Added ${correction.missedAllergen} detection to skill library`,
      });
    }
  }

  /**
   * Track a reaction event
   */
  async trackReaction(
    reaction: Omit<ReactionEvent, 'id' | 'timestamp'>
  ): Promise<void> {
    const reactionId = await this.reactions.addReaction(reaction);

    // Build causal links
    if (reaction.reaction.occurred) {
      for (const item of reaction.consumedItems) {
        for (const ingredient of item.ingredients) {
          // Add causal edge: ingredient -> reaction
          await this.causal.addEdge(
            { name: ingredient, type: 'ingredient' },
            { name: `reaction_${reaction.reaction.severity}`, type: 'reaction' },
            reaction.reaction.timeToOnset,
            true
          );

          // Add symptom edges
          for (const symptom of reaction.reaction.symptoms) {
            await this.causal.addEdge(
              { name: ingredient, type: 'ingredient' },
              { name: symptom, type: 'symptom' },
              reaction.reaction.timeToOnset,
              true
            );
          }
        }
      }

      // Check for new allergen patterns
      await this.checkForNewAllergenPatterns(reaction, reactionId);
    }
  }

  private async checkForNewAllergenPatterns(
    reaction: ReactionEvent,
    reactionId: string
  ): Promise<void> {
    const patterns = await this.causal.discoverPatterns({
      minOccurrences: 2,
      minStrength: 0.7,
    });

    for (const pattern of patterns) {
      // Check if this is a new, significant pattern
      const existingInsight = (await this.insights.getAll()).find(
        (i) => i.description.includes(pattern.pattern)
      );

      if (!existingInsight && pattern.confidence >= 0.8) {
        await this.insights.addInsight({
          type: 'pattern_detected',
          title: 'New Pattern Detected',
          description: pattern.description,
          confidence: pattern.confidence,
          supportingEpisodes: [],
          supportingReactions: [reactionId],
          recommendation: 'Consider adding this as a known allergen trigger',
        });
      }
    }
  }

  /**
   * Get relevant past experiences for a new scan
   */
  async getRelevantExperiences(
    ingredients: string[],
    userAllergies: string[]
  ): Promise<ReflexionEpisode[]> {
    return await this.reflexion.retrieve(
      { ingredients, allergens: userAllergies },
      { limit: 5, threshold: 0.3 }
    );
  }

  /**
   * Get applicable skills for ingredients
   */
  async getApplicableSkills(ingredients: string[]): Promise<Skill[]> {
    const skills: Skill[] = [];

    for (const ingredient of ingredients) {
      const found = await this.skills.search(ingredient, 3);
      skills.push(...found);
    }

    // Deduplicate by ID
    const unique = skills.filter(
      (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
    );

    return unique.filter((s) => s.quality >= 0.7);
  }

  /**
   * Get causal warnings for ingredients
   */
  async getCausalWarnings(
    ingredients: string[]
  ): Promise<Array<{ warning: string; probability: number }>> {
    const warnings: Array<{ warning: string; probability: number }> = [];

    for (const ingredient of ingredients) {
      const effects = await this.causal.findEffects(ingredient, {
        minStrength: 0.6,
        maxDepth: 2,
      });

      for (const effect of effects) {
        if (effect.effect.startsWith('reaction_') || effect.effect.includes('symptom')) {
          warnings.push({
            warning: `${ingredient} may cause ${effect.effect} (${(effect.strength * 100).toFixed(0)}% probability based on your history)`,
            probability: effect.strength,
          });
        }
      }
    }

    return warnings.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Export all memory data
   */
  async export(): Promise<AgentMemoryExport> {
    const [episodes, skills, causalData, reactions, insights] = await Promise.all([
      this.reflexion.getAll(),
      this.skills.getAll(),
      this.causal.getAll(),
      this.reactions.getAll(),
      this.insights.getAll(),
    ]);

    // Calculate stats
    const successfulEpisodes = episodes.filter((e) => e.success).length;
    const accuracyImprovement = episodes.length > 0
      ? (successfulEpisodes / episodes.length) * 100
      : 0;

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      reflexionEpisodes: episodes,
      skills,
      causalEdges: causalData.edges,
      causalNodes: causalData.nodes,
      reactionEvents: reactions,
      insights,
      stats: {
        totalScans: episodes.length,
        totalReactions: reactions.filter((r) => r.reaction.occurred).length,
        skillsLearned: skills.length,
        accuracyImprovement,
      },
    };
  }

  /**
   * Get learning stats
   */
  async getStats(): Promise<{
    totalScans: number;
    skillsLearned: number;
    patternsDiscovered: number;
    accuracyRate: number;
    unreadInsights: number;
  }> {
    const [episodes, skills, patterns, insights] = await Promise.all([
      this.reflexion.getAll(),
      this.skills.getAll(),
      this.causal.discoverPatterns(),
      this.insights.getUnacknowledged(),
    ]);

    const successful = episodes.filter((e) => e.success).length;

    return {
      totalScans: episodes.length,
      skillsLearned: skills.length,
      patternsDiscovered: patterns.length,
      accuracyRate: episodes.length > 0 ? (successful / episodes.length) * 100 : 100,
      unreadInsights: insights.length,
    };
  }
}

// Singleton instance
let agentMemoryInstance: AgentMemory | null = null;

export function getAgentMemory(): AgentMemory {
  if (!agentMemoryInstance) {
    agentMemoryInstance = new AgentMemory();
  }
  return agentMemoryInstance;
}

export { AgentMemory };
