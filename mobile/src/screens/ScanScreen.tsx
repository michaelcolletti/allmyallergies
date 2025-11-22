import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, TextInput as RNTextInput } from 'react-native';
import { YStack, XStack, H2, Text, Button, Card, Input } from 'tamagui';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Haptics from 'expo-haptics';
import { useAllergyStore } from '../store/allergyStore';
import { analyzeIngredients, lookupBarcode } from '../services/allergiesService';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState<any>(null);

  const { profile } = useAllergyStore();

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
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4">
        <H2>📷 Scan Product</H2>
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
        <YStack padding="$4">
          <Card
            padded
            backgroundColor={result.analysis.isSafe ? '$green2' : '$red2'}
          >
            <H2 marginBottom="$2">
              {result.analysis.isSafe ? '✅ SAFE' : '⚠️ DANGER'}
            </H2>
            <Text fontWeight="bold">{result.product.productName}</Text>
            <Text marginTop="$2" marginBottom="$2">
              {result.product.ingredients}
            </Text>

            {result.analysis.detectedAllergens.length > 0 && (
              <YStack marginTop="$3" space="$2">
                <Text fontWeight="bold" color="$danger">
                  Detected Allergens:
                </Text>
                {result.analysis.detectedAllergens.map((allergen: string) => (
                  <Text key={allergen}>• {allergen}</Text>
                ))}
              </YStack>
            )}

            {result.analysis.warnings.length > 0 && (
              <YStack marginTop="$3" space="$2">
                <Text fontWeight="bold" color="$danger">
                  Warnings:
                </Text>
                {result.analysis.warnings.map((warning: string, idx: number) => (
                  <Text key={idx}>{warning}</Text>
                ))}
              </YStack>
            )}

            <XStack marginTop="$3" justifyContent="space-between">
              <Text fontSize="$2" color="$gray10">
                Confidence: {(result.analysis.confidence * 100).toFixed(0)}%
              </Text>
              <Text fontSize="$2" color="$gray10">
                Severity: {result.analysis.severity}
              </Text>
            </XStack>
          </Card>
        </YStack>
      )}

      {/* Performance Footer */}
      {analyzing && (
        <YStack padding="$4" alignItems="center">
          <Text fontSize="$2" color="$gray10">
            ⚡ Fast TypeScript analysis in progress...
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
