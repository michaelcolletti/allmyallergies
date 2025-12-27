/**
 * Learning Insights Screen
 * Shows AI-discovered patterns and learning statistics
 *
 * Following ruv's SPARC methodology - Completion phase
 * Powered by AgentDB agentic-flow
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import {
  YStack,
  XStack,
  H2,
  H3,
  Text,
  Button,
  Card,
  Separator,
  Progress,
} from 'tamagui';
import * as Haptics from 'expo-haptics';
import {
  getLearningStats,
  getInsights,
  acknowledgeInsight,
  exportLearningData,
} from '../services/allergiesService';
import type { LearningInsight, InsightType } from '../core/agenticTypes';

const INSIGHT_ICONS: Record<InsightType, string> = {
  new_allergen_suspected: '?',
  cross_reaction_discovered: '',
  hidden_ingredient_found: '',
  safe_alternative_found: '',
  pattern_detected: '',
  accuracy_improved: '',
};

const INSIGHT_COLORS: Record<InsightType, string> = {
  new_allergen_suspected: '#FF9800',
  cross_reaction_discovered: '#FF5722',
  hidden_ingredient_found: '#9C27B0',
  safe_alternative_found: '#4CAF50',
  pattern_detected: '#2196F3',
  accuracy_improved: '#00BCD4',
};

export default function LearningInsightsScreen() {
  const [stats, setStats] = useState({
    totalScans: 0,
    skillsLearned: 0,
    patternsDiscovered: 0,
    accuracyRate: 100,
    unreadInsights: 0,
  });
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, insightsData] = await Promise.all([
        getLearningStats(),
        getInsights(),
      ]);
      setStats(statsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load learning data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAcknowledge = async (insightId: string) => {
    try {
      await acknowledgeInsight(insightId);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInsights((prev) => prev.filter((i) => i.id !== insightId));
      setStats((prev) => ({
        ...prev,
        unreadInsights: Math.max(0, prev.unreadInsights - 1),
      }));
    } catch (error) {
      console.error('Failed to acknowledge insight:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportLearningData();
      const summary = `
Export Summary:
- Total Scans: ${data.stats.totalScans}
- Skills Learned: ${data.stats.skillsLearned}
- Reactions Tracked: ${data.stats.totalReactions}
- Accuracy: ${data.stats.accuracyImprovement.toFixed(1)}%
- Exported At: ${new Date(data.exportedAt).toLocaleString()}
      `.trim();

      Alert.alert('Learning Data Export', summary, [
        { text: 'OK' },
        // In a real app, this would share or save the data
      ]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to export:', error);
      Alert.alert('Error', 'Failed to export learning data');
    } finally {
      setExporting(false);
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return '#4CAF50';
    if (value >= 70) return '#8BC34A';
    if (value >= 50) return '#FF9800';
    return '#FF5722';
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <YStack padding="$4" space="$4">
        <YStack>
          <H2>AI Learning</H2>
          <Text color="$gray10">
            Powered by AgentDB agentic-flow
          </Text>
        </YStack>

        {/* Stats Overview */}
        <Card padded elevate>
          <H3 marginBottom="$3">Learning Statistics</H3>

          {/* Accuracy */}
          <YStack space="$2" marginBottom="$4">
            <XStack justifyContent="space-between">
              <Text fontWeight="bold">Detection Accuracy</Text>
              <Text fontWeight="bold" color={getProgressColor(stats.accuracyRate)}>
                {stats.accuracyRate.toFixed(1)}%
              </Text>
            </XStack>
            <Progress value={stats.accuracyRate} max={100}>
              <Progress.Indicator
                animation="bouncy"
                backgroundColor={getProgressColor(stats.accuracyRate)}
              />
            </Progress>
          </YStack>

          {/* Stats Grid */}
          <XStack flexWrap="wrap" gap="$3">
            <YStack flex={1} minWidth={120} alignItems="center" padding="$3" backgroundColor="$blue2" borderRadius="$3">
              <Text fontSize="$8" fontWeight="bold" color="$blue10">
                {stats.totalScans}
              </Text>
              <Text fontSize="$2" color="$gray10">
                Total Scans
              </Text>
            </YStack>

            <YStack flex={1} minWidth={120} alignItems="center" padding="$3" backgroundColor="$green2" borderRadius="$3">
              <Text fontSize="$8" fontWeight="bold" color="$green10">
                {stats.skillsLearned}
              </Text>
              <Text fontSize="$2" color="$gray10">
                Skills Learned
              </Text>
            </YStack>

            <YStack flex={1} minWidth={120} alignItems="center" padding="$3" backgroundColor="$purple2" borderRadius="$3">
              <Text fontSize="$8" fontWeight="bold" color="$purple10">
                {stats.patternsDiscovered}
              </Text>
              <Text fontSize="$2" color="$gray10">
                Patterns Found
              </Text>
            </YStack>

            <YStack flex={1} minWidth={120} alignItems="center" padding="$3" backgroundColor="$orange2" borderRadius="$3">
              <Text fontSize="$8" fontWeight="bold" color="$orange10">
                {stats.unreadInsights}
              </Text>
              <Text fontSize="$2" color="$gray10">
                New Insights
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* How It Works */}
        <Card padded backgroundColor="$gray2">
          <H3 marginBottom="$2">How AI Learning Works</H3>
          <YStack space="$2">
            <XStack space="$2" alignItems="flex-start">
              <Text fontSize="$4">1.</Text>
              <YStack flex={1}>
                <Text fontWeight="bold">Reflexion Memory</Text>
                <Text fontSize="$2" color="$gray10">
                  Every scan is analyzed and stored. The AI reflects on what worked and what didn't.
                </Text>
              </YStack>
            </XStack>

            <XStack space="$2" alignItems="flex-start">
              <Text fontSize="$4">2.</Text>
              <YStack flex={1}>
                <Text fontWeight="bold">Skill Library</Text>
                <Text fontSize="$2" color="$gray10">
                  Successful detection patterns become reusable skills that improve future scans.
                </Text>
              </YStack>
            </XStack>

            <XStack space="$2" alignItems="flex-start">
              <Text fontSize="$4">3.</Text>
              <YStack flex={1}>
                <Text fontWeight="bold">Causal Memory</Text>
                <Text fontSize="$2" color="$gray10">
                  Your reaction journal helps discover cause-and-effect relationships specific to you.
                </Text>
              </YStack>
            </XStack>
          </YStack>
        </Card>

        <Separator marginVertical="$2" />

        {/* Insights */}
        <YStack space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <H3>Recent Insights</H3>
            {insights.length > 0 && (
              <Text fontSize="$2" color="$blue10">
                {insights.length} new
              </Text>
            )}
          </XStack>

          {insights.length === 0 ? (
            <Card padded>
              <YStack alignItems="center" padding="$4" space="$2">
                <Text fontSize="$6"></Text>
                <Text textAlign="center" color="$gray10">
                  No new insights yet. Keep scanning products and logging reactions to help the AI discover patterns!
                </Text>
              </YStack>
            </Card>
          ) : (
            insights.map((insight) => (
              <Card
                key={insight.id}
                padded
                borderLeftWidth={4}
                borderLeftColor={INSIGHT_COLORS[insight.type]}
              >
                <XStack space="$3" alignItems="flex-start">
                  <YStack
                    width={40}
                    height={40}
                    backgroundColor={INSIGHT_COLORS[insight.type]}
                    borderRadius="$4"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text fontSize="$5">{INSIGHT_ICONS[insight.type]}</Text>
                  </YStack>

                  <YStack flex={1} space="$1">
                    <Text fontWeight="bold">{insight.title}</Text>
                    <Text fontSize="$2" color="$gray11">
                      {insight.description}
                    </Text>

                    {insight.recommendation && (
                      <Card
                        padding="$2"
                        marginTop="$2"
                        backgroundColor="$gray3"
                      >
                        <Text fontSize="$2">
                          Recommendation: {insight.recommendation}
                        </Text>
                      </Card>
                    )}

                    <XStack marginTop="$2" justifyContent="space-between" alignItems="center">
                      <Text fontSize="$1" color="$gray9">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Text>
                      <Button
                        size="$2"
                        theme="blue"
                        onPress={() => handleAcknowledge(insight.id)}
                      >
                        Got it
                      </Button>
                    </XStack>
                  </YStack>
                </XStack>
              </Card>
            ))
          )}
        </YStack>

        {/* Learning Milestones */}
        <Card padded backgroundColor="$yellow2">
          <H3 marginBottom="$2">Milestones</H3>
          <YStack space="$2">
            <XStack space="$2" alignItems="center">
              <Text fontSize="$4">
                {stats.totalScans >= 10 ? '' : ''}
              </Text>
              <Text flex={1}>Scan 10 products</Text>
              <Text color={stats.totalScans >= 10 ? '$green10' : '$gray9'}>
                {Math.min(stats.totalScans, 10)}/10
              </Text>
            </XStack>

            <XStack space="$2" alignItems="center">
              <Text fontSize="$4">
                {stats.skillsLearned >= 5 ? '' : ''}
              </Text>
              <Text flex={1}>Learn 5 patterns</Text>
              <Text color={stats.skillsLearned >= 5 ? '$green10' : '$gray9'}>
                {Math.min(stats.skillsLearned, 5)}/5
              </Text>
            </XStack>

            <XStack space="$2" alignItems="center">
              <Text fontSize="$4">
                {stats.accuracyRate >= 90 ? '' : ''}
              </Text>
              <Text flex={1}>Reach 90% accuracy</Text>
              <Text color={stats.accuracyRate >= 90 ? '$green10' : '$gray9'}>
                {stats.accuracyRate.toFixed(0)}%
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Export Button */}
        <Button
          size="$4"
          theme="gray"
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export Learning Data'}
        </Button>

        {/* Footer */}
        <Card padded backgroundColor="$gray2">
          <Text fontSize="$1" color="$gray9" textAlign="center">
            All learning happens locally on your device.
            Your health data never leaves your phone.
          </Text>
        </Card>
      </YStack>
    </ScrollView>
  );
}
