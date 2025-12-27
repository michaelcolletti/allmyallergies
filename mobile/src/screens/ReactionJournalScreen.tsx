/**
 * Reaction Journal Screen
 * Track allergic reactions to build causal memory graph
 *
 * Following ruv's SPARC methodology - Completion phase
 * Powered by AgentDB agentic-flow
 */

import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, TextInput as RNTextInput } from 'react-native';
import {
  YStack,
  XStack,
  H2,
  H3,
  Text,
  Button,
  Card,
  Separator,
} from 'tamagui';
import * as Haptics from 'expo-haptics';
import { trackReaction, getRecentReactions } from '../services/allergiesService';
import type { ReactionEvent, ReactionSeverity } from '../core/agenticTypes';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface ReactionForm {
  foodName: string;
  ingredients: string;
  mealType: MealType;
  reactionOccurred: boolean;
  severity: ReactionSeverity;
  symptoms: string[];
  timeToOnset: string;
  duration: string;
  treatmentRequired: boolean;
  medicationUsed: string;
  notes: string;
}

const SYMPTOM_OPTIONS = [
  'Hives',
  'Swelling',
  'Itching',
  'Breathing difficulty',
  'Stomach pain',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Dizziness',
  'Throat tightness',
  'Coughing',
  'Sneezing',
  'Runny nose',
  'Watery eyes',
  'Skin rash',
  'Tingling mouth',
];

const SEVERITY_OPTIONS: { value: ReactionSeverity; label: string; color: string }[] = [
  { value: 'none', label: 'No Reaction', color: '#4CAF50' },
  { value: 'mild', label: 'Mild', color: '#8BC34A' },
  { value: 'moderate', label: 'Moderate', color: '#FF9800' },
  { value: 'severe', label: 'Severe', color: '#FF5722' },
  { value: 'anaphylaxis', label: 'Anaphylaxis', color: '#F44336' },
];

export default function ReactionJournalScreen() {
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ReactionForm>({
    foodName: '',
    ingredients: '',
    mealType: 'snack',
    reactionOccurred: false,
    severity: 'none',
    symptoms: [],
    timeToOnset: '',
    duration: '',
    treatmentRequired: false,
    medicationUsed: '',
    notes: '',
  });

  useEffect(() => {
    loadRecentReactions();
  }, []);

  const loadRecentReactions = async () => {
    try {
      const reactions = await getRecentReactions(10);
      setRecentReactions(reactions);
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  const toggleSymptom = (symptom: string) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleSave = async () => {
    if (!form.foodName.trim()) {
      Alert.alert('Error', 'Please enter the food name');
      return;
    }

    setSaving(true);
    try {
      const ingredientsList = form.ingredients
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await trackReaction({
        userId: 'current_user', // TODO: Get from profile
        consumedItems: [
          {
            name: form.foodName,
            ingredients: ingredientsList,
            mealType: form.mealType,
          },
        ],
        reaction: {
          occurred: form.reactionOccurred,
          severity: form.severity,
          symptoms: form.symptoms,
          timeToOnset: parseInt(form.timeToOnset) || 0,
          duration: parseInt(form.duration) || 0,
          treatmentRequired: form.treatmentRequired,
          medicationUsed: form.medicationUsed
            ? form.medicationUsed.split(',').map((m) => m.trim())
            : undefined,
        },
        notes: form.notes,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Saved!',
        form.reactionOccurred
          ? 'Reaction logged. I will learn from this to improve future detections.'
          : 'Safe consumption logged. This helps build your personalized safety profile.',
        [{ text: 'OK' }]
      );

      // Reset form
      setForm({
        foodName: '',
        ingredients: '',
        mealType: 'snack',
        reactionOccurred: false,
        severity: 'none',
        symptoms: [],
        timeToOnset: '',
        duration: '',
        treatmentRequired: false,
        medicationUsed: '',
        notes: '',
      });
      setShowForm(false);
      loadRecentReactions();
    } catch (error) {
      console.error('Failed to save reaction:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: ReactionSeverity) => {
    return SEVERITY_OPTIONS.find((s) => s.value === severity)?.color || '#666';
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <YStack padding="$4" space="$4">
        <YStack>
          <H2>Reaction Journal</H2>
          <Text color="$gray10">
            Track what you eat and any reactions to improve detection accuracy
          </Text>
        </YStack>

        {/* Add New Entry Button */}
        {!showForm && (
          <Button
            size="$5"
            theme="green"
            onPress={() => setShowForm(true)}
          >
            + Log Food / Reaction
          </Button>
        )}

        {/* New Entry Form */}
        {showForm && (
          <Card padded elevate>
            <YStack space="$3">
              <H3>New Entry</H3>

              {/* Food Name */}
              <YStack space="$1">
                <Text fontWeight="bold">What did you eat?</Text>
                <RNTextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: '#fff',
                  }}
                  placeholder="e.g., Peanut butter sandwich"
                  value={form.foodName}
                  onChangeText={(text) => setForm({ ...form, foodName: text })}
                />
              </YStack>

              {/* Ingredients */}
              <YStack space="$1">
                <Text fontWeight="bold">Ingredients (comma-separated)</Text>
                <RNTextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: '#fff',
                    minHeight: 60,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  placeholder="e.g., bread, peanut butter, jelly"
                  value={form.ingredients}
                  onChangeText={(text) => setForm({ ...form, ingredients: text })}
                />
              </YStack>

              {/* Meal Type */}
              <YStack space="$1">
                <Text fontWeight="bold">Meal Type</Text>
                <XStack space="$2" flexWrap="wrap">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
                    <Button
                      key={meal}
                      size="$3"
                      theme={form.mealType === meal ? 'blue' : 'gray'}
                      onPress={() => setForm({ ...form, mealType: meal })}
                    >
                      {meal.charAt(0).toUpperCase() + meal.slice(1)}
                    </Button>
                  ))}
                </XStack>
              </YStack>

              <Separator marginVertical="$2" />

              {/* Reaction Occurred */}
              <YStack space="$1">
                <Text fontWeight="bold">Did you have a reaction?</Text>
                <XStack space="$2">
                  <Button
                    flex={1}
                    theme={!form.reactionOccurred ? 'green' : 'gray'}
                    onPress={() =>
                      setForm({ ...form, reactionOccurred: false, severity: 'none', symptoms: [] })
                    }
                  >
                    No Reaction
                  </Button>
                  <Button
                    flex={1}
                    theme={form.reactionOccurred ? 'red' : 'gray'}
                    onPress={() => setForm({ ...form, reactionOccurred: true })}
                  >
                    Had Reaction
                  </Button>
                </XStack>
              </YStack>

              {/* Reaction Details (if reaction occurred) */}
              {form.reactionOccurred && (
                <YStack space="$3" marginTop="$2">
                  {/* Severity */}
                  <YStack space="$1">
                    <Text fontWeight="bold">Severity</Text>
                    <XStack space="$2" flexWrap="wrap">
                      {SEVERITY_OPTIONS.filter((s) => s.value !== 'none').map((option) => (
                        <Button
                          key={option.value}
                          size="$3"
                          backgroundColor={
                            form.severity === option.value ? option.color : '#e0e0e0'
                          }
                          color={form.severity === option.value ? '#fff' : '#333'}
                          onPress={() => setForm({ ...form, severity: option.value })}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </XStack>
                  </YStack>

                  {/* Symptoms */}
                  <YStack space="$1">
                    <Text fontWeight="bold">Symptoms</Text>
                    <XStack flexWrap="wrap" gap="$2">
                      {SYMPTOM_OPTIONS.map((symptom) => (
                        <Button
                          key={symptom}
                          size="$2"
                          theme={form.symptoms.includes(symptom) ? 'orange' : 'gray'}
                          onPress={() => toggleSymptom(symptom)}
                        >
                          {symptom}
                        </Button>
                      ))}
                    </XStack>
                  </YStack>

                  {/* Time to onset */}
                  <XStack space="$2">
                    <YStack flex={1} space="$1">
                      <Text fontWeight="bold">Time to onset (min)</Text>
                      <RNTextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          padding: 12,
                          backgroundColor: '#fff',
                        }}
                        keyboardType="numeric"
                        placeholder="e.g., 30"
                        value={form.timeToOnset}
                        onChangeText={(text) => setForm({ ...form, timeToOnset: text })}
                      />
                    </YStack>
                    <YStack flex={1} space="$1">
                      <Text fontWeight="bold">Duration (min)</Text>
                      <RNTextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          padding: 12,
                          backgroundColor: '#fff',
                        }}
                        keyboardType="numeric"
                        placeholder="e.g., 60"
                        value={form.duration}
                        onChangeText={(text) => setForm({ ...form, duration: text })}
                      />
                    </YStack>
                  </XStack>

                  {/* Treatment */}
                  <YStack space="$1">
                    <Text fontWeight="bold">Required treatment?</Text>
                    <XStack space="$2">
                      <Button
                        flex={1}
                        theme={!form.treatmentRequired ? 'gray' : 'gray'}
                        onPress={() => setForm({ ...form, treatmentRequired: false })}
                      >
                        No
                      </Button>
                      <Button
                        flex={1}
                        theme={form.treatmentRequired ? 'orange' : 'gray'}
                        onPress={() => setForm({ ...form, treatmentRequired: true })}
                      >
                        Yes
                      </Button>
                    </XStack>
                  </YStack>

                  {form.treatmentRequired && (
                    <YStack space="$1">
                      <Text fontWeight="bold">Medication used</Text>
                      <RNTextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          padding: 12,
                          backgroundColor: '#fff',
                        }}
                        placeholder="e.g., Benadryl, EpiPen"
                        value={form.medicationUsed}
                        onChangeText={(text) => setForm({ ...form, medicationUsed: text })}
                      />
                    </YStack>
                  )}
                </YStack>
              )}

              {/* Notes */}
              <YStack space="$1">
                <Text fontWeight="bold">Additional Notes</Text>
                <RNTextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: '#fff',
                    minHeight: 60,
                    textAlignVertical: 'top',
                  }}
                  multiline
                  placeholder="Any other observations..."
                  value={form.notes}
                  onChangeText={(text) => setForm({ ...form, notes: text })}
                />
              </YStack>

              {/* Action Buttons */}
              <XStack space="$2" marginTop="$2">
                <Button
                  flex={1}
                  theme="gray"
                  onPress={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  theme={form.reactionOccurred ? 'red' : 'green'}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </Button>
              </XStack>
            </YStack>
          </Card>
        )}

        <Separator marginVertical="$2" />

        {/* Recent Entries */}
        <YStack space="$3">
          <H3>Recent Entries</H3>

          {recentReactions.length === 0 ? (
            <Card padded>
              <Text color="$gray10" textAlign="center">
                No entries yet. Start logging your meals and reactions to help improve allergen detection accuracy!
              </Text>
            </Card>
          ) : (
            recentReactions.map((reaction) => (
              <Card key={reaction.id} padded>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1}>
                    <Text fontWeight="bold">
                      {reaction.consumedItems[0]?.name || 'Unknown food'}
                    </Text>
                    <Text color="$gray10" fontSize="$2">
                      {formatDate(reaction.timestamp)}
                    </Text>
                  </YStack>
                  <YStack
                    backgroundColor={getSeverityColor(reaction.reaction.severity)}
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                  >
                    <Text color="#fff" fontSize="$2" fontWeight="bold">
                      {reaction.reaction.occurred
                        ? reaction.reaction.severity.toUpperCase()
                        : 'SAFE'}
                    </Text>
                  </YStack>
                </XStack>

                {reaction.reaction.symptoms.length > 0 && (
                  <XStack marginTop="$2" flexWrap="wrap" gap="$1">
                    {reaction.reaction.symptoms.slice(0, 3).map((symptom) => (
                      <Text
                        key={symptom}
                        fontSize="$1"
                        backgroundColor="$gray4"
                        paddingHorizontal="$2"
                        paddingVertical="$1"
                        borderRadius="$1"
                      >
                        {symptom}
                      </Text>
                    ))}
                    {reaction.reaction.symptoms.length > 3 && (
                      <Text fontSize="$1" color="$gray10">
                        +{reaction.reaction.symptoms.length - 3} more
                      </Text>
                    )}
                  </XStack>
                )}
              </Card>
            ))
          )}
        </YStack>

        {/* Learning Info */}
        <Card padded backgroundColor="$blue2">
          <YStack space="$2">
            <Text fontWeight="bold">How this helps</Text>
            <Text fontSize="$2" color="$gray11">
              Every entry you log helps the AI learn your personal allergy patterns.
              Over time, it will:
            </Text>
            <YStack marginLeft="$2" space="$1">
              <Text fontSize="$2">
                - Discover hidden allergen triggers
              </Text>
              <Text fontSize="$2">
                - Identify cross-reactions specific to you
              </Text>
              <Text fontSize="$2">
                - Improve detection accuracy for your profile
              </Text>
            </YStack>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
