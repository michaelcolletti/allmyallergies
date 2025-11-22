import React, { useState } from 'react';
import { ScrollView, Alert, TextInput as RNTextInput } from 'react-native';
import { YStack, XStack, H2, H3, Text, Button, Card, Select } from 'tamagui';
import { useAllergyStore, type SeverityLevel } from '../store/allergyStore';

export default function ProfileScreen() {
  const { profile, addAllergy, removeAllergy, addEmergencyContact } =
    useAllergyStore();

  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergySeverity, setNewAllergySeverity] =
    useState<SeverityLevel>('Moderate');

  const handleAddAllergy = () => {
    if (!newAllergyName.trim()) {
      Alert.alert('Error', 'Please enter an allergen name');
      return;
    }

    addAllergy({
      name: newAllergyName.trim(),
      severity: newAllergySeverity,
      aliases: [],
    });

    setNewAllergyName('');
    setShowAddAllergy(false);
    Alert.alert('Success', `Added ${newAllergyName} to your profile`);
  };

  const handleRemoveAllergy = (id: string, name: string) => {
    Alert.alert(
      'Remove Allergy',
      `Remove ${name} from your profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeAllergy(id),
        },
      ]
    );
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'Anaphylaxis':
        return '$red9';
      case 'Severe':
        return '$orange9';
      case 'Moderate':
        return '$yellow9';
      case 'Mild':
        return '$blue9';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <YStack padding="$4" space="$4">
        <H2>👤 Allergy Profile</H2>

        {/* User Info */}
        <Card padded>
          <H3 marginBottom="$2">Profile Information</H3>
          <Text color="$gray10">User ID: {profile.userId}</Text>
          {profile.medicalId && (
            <Text color="$gray10">Medical ID: {profile.medicalId}</Text>
          )}
          {profile.epiPenExpiry && (
            <Text color="$gray10">EpiPen Expiry: {profile.epiPenExpiry}</Text>
          )}
        </Card>

        {/* Allergies List */}
        <Card padded>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <H3>Your Allergies ({profile.allergies.length})</H3>
            <Button
              size="$3"
              onPress={() => setShowAddAllergy(!showAddAllergy)}
              theme="green"
            >
              ➕ Add
            </Button>
          </XStack>

          {showAddAllergy && (
            <Card padded backgroundColor="$backgroundHover" marginBottom="$3">
              <Text fontWeight="bold" marginBottom="$2">
                Add New Allergy
              </Text>
              <RNTextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  backgroundColor: '#fff',
                }}
                placeholder="Allergen name (e.g., peanuts)"
                value={newAllergyName}
                onChangeText={setNewAllergyName}
              />

              <Text marginBottom="$2">Severity Level:</Text>
              <YStack space="$2" marginBottom="$3">
                {(['Mild', 'Moderate', 'Severe', 'Anaphylaxis'] as SeverityLevel[]).map(
                  (severity) => (
                    <Button
                      key={severity}
                      size="$3"
                      theme={newAllergySeverity === severity ? 'active' : undefined}
                      onPress={() => setNewAllergySeverity(severity)}
                    >
                      {severity}
                    </Button>
                  )
                )}
              </YStack>

              <XStack space="$2">
                <Button flex={1} onPress={handleAddAllergy} theme="blue">
                  Save
                </Button>
                <Button
                  flex={1}
                  onPress={() => setShowAddAllergy(false)}
                  theme="gray"
                >
                  Cancel
                </Button>
              </XStack>
            </Card>
          )}

          <YStack space="$2">
            {profile.allergies.length === 0 && (
              <Text color="$gray10" textAlign="center" paddingVertical="$4">
                No allergies added yet. Tap "Add" to get started.
              </Text>
            )}

            {profile.allergies.map((allergy) => (
              <Card key={allergy.id} padded backgroundColor="$backgroundHover">
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1}>
                    <Text fontWeight="bold" fontSize="$5">
                      {allergy.name}
                    </Text>
                    <Text
                      fontSize="$2"
                      color={getSeverityColor(allergy.severity)}
                      fontWeight="600"
                    >
                      {allergy.severity}
                    </Text>
                    {allergy.notes && (
                      <Text fontSize="$2" color="$gray10">
                        {allergy.notes}
                      </Text>
                    )}
                  </YStack>
                  <Button
                    size="$3"
                    theme="red"
                    onPress={() => handleRemoveAllergy(allergy.id, allergy.name)}
                  >
                    🗑️
                  </Button>
                </XStack>
              </Card>
            ))}
          </YStack>
        </Card>

        {/* Sensitivities */}
        <Card padded>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <H3>Sensitivities ({profile.sensitivities.length})</H3>
            <Button size="$3" theme="green">
              ➕ Add
            </Button>
          </XStack>

          {profile.sensitivities.length === 0 && (
            <Text color="$gray10" textAlign="center">
              No sensitivities added
            </Text>
          )}
        </Card>

        {/* Emergency Contacts */}
        <Card padded>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <H3>Emergency Contacts ({profile.emergencyContacts.length})</H3>
            <Button size="$3" theme="red">
              ➕ Add
            </Button>
          </XStack>

          {profile.emergencyContacts.length === 0 && (
            <Text color="$gray10" textAlign="center">
              No emergency contacts added
            </Text>
          )}

          {profile.emergencyContacts.map((contact) => (
            <Card key={contact.id} padded backgroundColor="$backgroundHover" marginTop="$2">
              <Text fontWeight="bold">{contact.name}</Text>
              <Text>{contact.relationship}</Text>
              <Text color="$blue10">{contact.phone}</Text>
            </Card>
          ))}
        </Card>

        {/* Data Management */}
        <Card padded>
          <H3 marginBottom="$2">Data Management</H3>
          <YStack space="$2">
            <Button theme="blue">📤 Export Profile</Button>
            <Button theme="green">📥 Import Profile</Button>
            <Button theme="gray">☁️ Sync to Cloud</Button>
          </YStack>
        </Card>

        {/* About */}
        <Card padded backgroundColor="$backgroundHover">
          <Text fontSize="$2" color="$gray10" textAlign="center">
            AllMyAllergies v0.1.0
          </Text>
          <Text fontSize="$2" color="$gray10" textAlign="center">
            Built with Rust/WASM + AgentDB
          </Text>
          <Text fontSize="$2" color="$gray10" textAlign="center">
            Powered by agentic-flow
          </Text>
        </Card>
      </YStack>
    </ScrollView>
  );
}
