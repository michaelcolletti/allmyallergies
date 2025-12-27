import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, TextInput as RNTextInput, ScrollView, Modal } from 'react-native';
import { YStack, XStack, H2, H3, Text, Button, Card, Separator } from 'tamagui';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Haptics from 'expo-haptics';
import { useAllergyStore } from '../store/allergyStore';
import {
  analyzeIngredients,
  lookupBarcode,
  provideFeedback,
  getLearningStats,
} from '../services/allergiesService';
import type { EnhancedDetectionResult } from '../core/agenticTypes';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState<{
    product: { productName: string; ingredients: string };
    analysis: EnhancedDetectionResult;
  } | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'missed' | 'wrong' | null>(null);
  const [feedbackAllergen, setFeedbackAllergen] = useState('');
  const [learningStats, setLearningStats] = useState({ totalScans: 0, skillsLearned: 0 });

  const { profile } = useAllergyStore();

  useEffect(() => {
    loadLearningStats();
  }, [result]);

  const loadLearningStats = async () => {
    try {
      const stats = await getLearningStats();
      setLearningStats(stats);
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    console.log(`Scanned barcode: ${data} (${type})`);

    setAnalyzing(true);
    try {
      // Lookup barcode
      const productData = await lookupBarcode(data);

      // Analyze ingredients using TypeScript engine
      const analysisResult = await analyzeIngredients(
        productData.ingredients,
        profile
      );

      setResult({
        product: productData,
        analysis: analysisResult,
      });

      // Haptic feedback based on safety
      if (!analysisResult.isSafe) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          '⚠️ ALLERGEN DETECTED',
          analysisResult.warnings.join('\n'),
          [{ text: 'OK' }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze product');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualAnalysis = async () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter ingredients');
      return;
    }

    setAnalyzing(true);
    try {
      const analysisResult = await analyzeIngredients(manualInput, profile);

      setResult({
        product: {
          productName: 'Manual Entry',
          ingredients: manualInput,
        },
        analysis: analysisResult,
      });

      if (!analysisResult.isSafe) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          '⚠️ ALLERGEN DETECTED',
          analysisResult.warnings.join('\n'),
          [{ text: 'OK' }]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Safe', 'No allergens detected!');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      Alert.alert('Error', 'Failed to analyze ingredients');
    } finally {
      setAnalyzing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Text>Requesting camera permission...</Text>
      </YStack>
    );
  }

  if (hasPermission === false) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text marginBottom="$4">Camera access is required to scan barcodes</Text>
        <Button onPress={() => BarCodeScanner.requestPermissionsAsync()}>
          Grant Permission
        </Button>
      </YStack>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <YStack padding="$4">
        <H2>Scan Product</H2>
        <Text color="$gray10" marginBottom="$4">
          Scan barcode or enter ingredients manually
        </Text>
      </YStack>

      {/* Barcode Scanner */}
      {!scanned && (
        <YStack flex={1} marginBottom="$4">
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <YStack
            position="absolute"
            bottom={20}
            left={20}
            right={20}
            alignItems="center"
          >
            <Button onPress={() => setScanned(false)} theme="blue">
              Scan Barcode
            </Button>
          </YStack>
        </YStack>
      )}

      {scanned && (
        <YStack padding="$4" space="$4">
          <Button onPress={() => setScanned(false)}>Scan Another</Button>
        </YStack>
      )}

      {/* Manual Input */}
      <YStack padding="$4" space="$3">
        <Card padded>
          <Text fontWeight="bold" marginBottom="$2">
            Or enter ingredients manually:
          </Text>
          <RNTextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            multiline
            placeholder="e.g., wheat flour, milk, eggs, sugar..."
            value={manualInput}
            onChangeText={setManualInput}
          />
          <Button
            marginTop="$3"
            onPress={handleManualAnalysis}
            disabled={analyzing}
            theme="green"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Ingredients'}
          </Button>
        </Card>
      </YStack>

      {/* Results */}
      {result && (
        <YStack padding="$4" space="$3">
          <Card
            padded
            backgroundColor={result.analysis.isSafe ? '$green2' : '$red2'}
          >
            <H2 marginBottom="$2">
              {result.analysis.isSafe ? 'SAFE' : 'DANGER'}
            </H2>
            <Text fontWeight="bold">{result.product.productName}</Text>
            <Text marginTop="$2" marginBottom="$2" fontSize="$2" color="$gray11">
              {result.product.ingredients}
            </Text>

            {result.analysis.detectedAllergens.length > 0 && (
              <YStack marginTop="$3" space="$2">
                <Text fontWeight="bold" color="$red10">
                  Detected Allergens:
                </Text>
                {result.analysis.detectedAllergens.map((allergen: string) => (
                  <Text key={allergen}>- {allergen}</Text>
                ))}
              </YStack>
            )}

            {result.analysis.warnings.length > 0 && (
              <YStack marginTop="$3" space="$2">
                <Text fontWeight="bold" color="$orange10">
                  Warnings:
                </Text>
                {result.analysis.warnings.map((warning: string, idx: number) => (
                  <Text key={idx} fontSize="$2">{warning}</Text>
                ))}
              </YStack>
            )}

            {/* Learning Enhancement Info */}
            {result.analysis.learnedMatches && result.analysis.learnedMatches.length > 0 && (
              <YStack marginTop="$3" padding="$2" backgroundColor="$blue3" borderRadius="$2">
                <Text fontSize="$2" fontWeight="bold" color="$blue10">
                  AI Learned ({result.analysis.learnedMatches.length}):
                </Text>
                {result.analysis.learnedMatches.slice(0, 3).map((match, idx) => (
                  <Text key={idx} fontSize="$2" color="$blue11">
                    {match.ingredient} contains {match.allergen}
                  </Text>
                ))}
              </YStack>
            )}

            {/* Confidence Breakdown */}
            <YStack marginTop="$3" space="$1">
              <XStack justifyContent="space-between">
                <Text fontSize="$2" color="$gray10">
                  Confidence: {(result.analysis.confidence * 100).toFixed(0)}%
                </Text>
                <Text fontSize="$2" color="$gray10">
                  Severity: {result.analysis.severity}
                </Text>
              </XStack>
              {result.analysis.improvementFromLearning > 0 && (
                <Text fontSize="$1" color="$green10">
                  +{result.analysis.improvementFromLearning.toFixed(1)}% from learning
                </Text>
              )}
            </YStack>
          </Card>

          {/* Feedback Buttons */}
          <Card padded>
            <Text fontWeight="bold" marginBottom="$2">
              Was this detection correct?
            </Text>
            <XStack space="$2">
              <Button
                flex={1}
                size="$3"
                theme="green"
                onPress={() => handleFeedback('correct')}
              >
                Correct
              </Button>
              <Button
                flex={1}
                size="$3"
                theme="orange"
                onPress={() => {
                  setFeedbackType('missed');
                  setShowFeedbackModal(true);
                }}
              >
                Missed One
              </Button>
              <Button
                flex={1}
                size="$3"
                theme="red"
                onPress={() => {
                  setFeedbackType('wrong');
                  setShowFeedbackModal(true);
                }}
              >
                Wrong
              </Button>
            </XStack>
            <Text fontSize="$1" color="$gray9" marginTop="$2" textAlign="center">
              Your feedback helps the AI learn and improve
            </Text>
          </Card>
        </YStack>
      )}

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          backgroundColor="rgba(0,0,0,0.5)"
          padding="$4"
        >
          <Card padded width="100%" maxWidth={400}>
            <H3 marginBottom="$3">
              {feedbackType === 'missed' ? 'What did I miss?' : 'What was wrong?'}
            </H3>

            <Text marginBottom="$2">
              {feedbackType === 'missed'
                ? 'Enter the allergen that was not detected:'
                : 'Enter the allergen that was incorrectly flagged:'}
            </Text>

            <RNTextInput
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
              placeholder="e.g., peanut, shellfish, milk..."
              value={feedbackAllergen}
              onChangeText={setFeedbackAllergen}
              autoFocus
            />

            <XStack space="$2">
              <Button
                flex={1}
                theme="gray"
                onPress={() => {
                  setShowFeedbackModal(false);
                  setFeedbackAllergen('');
                }}
              >
                Cancel
              </Button>
              <Button
                flex={1}
                theme="blue"
                onPress={() => handleFeedback(feedbackType!)}
                disabled={!feedbackAllergen.trim()}
              >
                Submit
              </Button>
            </XStack>
          </Card>
        </YStack>
      </Modal>

      {/* Learning Stats Footer */}
      <YStack padding="$4" alignItems="center" space="$1">
        {analyzing ? (
          <Text fontSize="$2" color="$gray10">
            AI-powered analysis in progress...
          </Text>
        ) : (
          <Text fontSize="$2" color="$gray10">
            {learningStats.totalScans} scans | {learningStats.skillsLearned} patterns learned
          </Text>
        )}
      </YStack>
    </ScrollView>
  );

  async function handleFeedback(type: 'correct' | 'missed' | 'wrong') {
    try {
      if (type === 'correct') {
        await provideFeedback({ wasCorrect: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Thanks!', 'Your feedback helps improve future detections.');
      } else if (type === 'missed' && feedbackAllergen) {
        await provideFeedback({
          wasCorrect: false,
          missedAllergen: feedbackAllergen,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Learned!',
          `I will now detect "${feedbackAllergen}" in similar ingredients.`
        );
      } else if (type === 'wrong' && feedbackAllergen) {
        await provideFeedback({
          wasCorrect: false,
          falsePositive: feedbackAllergen,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Noted!',
          `I will be more careful about "${feedbackAllergen}" in the future.`
        );
      }

      setShowFeedbackModal(false);
      setFeedbackAllergen('');
      loadLearningStats();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      Alert.alert('Error', 'Failed to save feedback. Please try again.');
    }
  }
}
