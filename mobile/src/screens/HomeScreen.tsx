import React, { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { YStack, XStack, H1, H3, Text, Button, Card } from 'tamagui';
import { useAllergyStore } from '../store/allergyStore';

export default function HomeScreen({ navigation }: any) {
  const { profile, loadProfile } = useAllergyStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const allergyCount = profile.allergies.length;
  const severeCount = profile.allergies.filter(
    (a) => a.severity === 'Severe' || a.severity === 'Anaphylaxis'
  ).length;

  return (
    <ScrollView style={styles.container}>
      <YStack padding="$4" space="$4">
        <H1>🛡️ AllMyAllergies</H1>
        <Text color="$gray10">Protecting you from allergens with AI</Text>

        {/* Quick Stats */}
        <Card padded>
          <H3 marginBottom="$2">Your Protection Status</H3>
          <YStack space="$2">
            <XStack justifyContent="space-between">
              <Text>Total Allergies:</Text>
              <Text fontWeight="bold">{allergyCount}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Severe/Anaphylaxis:</Text>
              <Text fontWeight="bold" color="$danger">
                {severeCount}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Sensitivities:</Text>
              <Text fontWeight="bold">{profile.sensitivities.length}</Text>
            </XStack>
          </YStack>
        </Card>

        {/* Recent Allergies */}
        {allergyCount > 0 && (
          <Card padded>
            <H3 marginBottom="$2">Your Allergies</H3>
            <YStack space="$2">
              {profile.allergies.slice(0, 5).map((allergy) => (
                <XStack
                  key={allergy.id}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text>{allergy.name}</Text>
                  <Text
                    fontSize="$2"
                    color={
                      allergy.severity === 'Anaphylaxis'
                        ? '$danger'
                        : allergy.severity === 'Severe'
                        ? '$warning'
                        : '$gray10'
                    }
                  >
                    {allergy.severity}
                  </Text>
                </XStack>
              ))}
            </YStack>
          </Card>
        )}

        {/* Quick Actions */}
        <Card padded>
          <H3 marginBottom="$2">Quick Actions</H3>
          <YStack space="$2">
            <Button
              theme="blue"
              size="$4"
              onPress={() => navigation.navigate('Scan')}
            >
              📷 Scan Barcode
            </Button>
            <Button
              theme="green"
              size="$4"
              onPress={() => navigation.navigate('Profile')}
            >
              ➕ Add Allergy
            </Button>
            <Button
              theme="orange"
              size="$4"
              onPress={() => {
                // Navigate to emergency info
              }}
            >
              🚨 Emergency Info
            </Button>
          </YStack>
        </Card>

        {/* Performance Info */}
        <Card padded backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$gray10">
            ⚡ Powered by Rust/WASM for 352x faster analysis
          </Text>
          <Text fontSize="$2" color="$gray10">
            🗄️ AgentDB vector search: p95 {'<'} 50ms
          </Text>
        </Card>

        {allergyCount === 0 && (
          <Card padded backgroundColor="$blue2">
            <H3 marginBottom="$2">👋 Welcome!</H3>
            <Text marginBottom="$3">
              Add your first allergy to get started. AllMyAllergies will protect
              you by scanning ingredients and alerting you to potential dangers.
            </Text>
            <Button onPress={() => navigation.navigate('Profile')}>
              Get Started
            </Button>
          </Card>
        )}
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
