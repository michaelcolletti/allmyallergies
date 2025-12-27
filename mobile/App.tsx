import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TamaguiProvider, Theme, Text } from 'tamagui';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from 'react-query';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import ReactionJournalScreen from './src/screens/ReactionJournalScreen';
import LearningInsightsScreen from './src/screens/LearningInsightsScreen';

// Services
import { initEngine } from './src/services/allergiesService';
import config from './tamagui.config';

const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    // Initialize TypeScript engine (instant!)
    initEngine()
      .then(() => {
        console.log('✅ AllergiesEngine initialized');
        setEngineReady(true);
      })
      .catch((err) => {
        console.error('❌ Engine initialization failed:', err);
      });
  }, []);

  if (!engineReady) {
    return null; // Show loading screen (optional - TS init is instant)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        <Theme name="light">
          <NavigationContainer>
            <StatusBar style="auto" />
            <Tab.Navigator
              screenOptions={{
                headerShown: false,
                tabBarStyle: {
                  backgroundColor: '#fff',
                  borderTopColor: '#e0e0e0',
                  height: 60,
                  paddingBottom: 8,
                  paddingTop: 4,
                },
                tabBarLabelStyle: {
                  fontSize: 10,
                },
              }}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  tabBarIcon: () => <Text fontSize={20}>H</Text>,
                  tabBarLabel: 'Home',
                }}
              />
              <Tab.Screen
                name="Scan"
                component={ScanScreen}
                options={{
                  tabBarIcon: () => <Text fontSize={20}>S</Text>,
                  tabBarLabel: 'Scan',
                }}
              />
              <Tab.Screen
                name="Journal"
                component={ReactionJournalScreen}
                options={{
                  tabBarIcon: () => <Text fontSize={20}>J</Text>,
                  tabBarLabel: 'Journal',
                }}
              />
              <Tab.Screen
                name="Learn"
                component={LearningInsightsScreen}
                options={{
                  tabBarIcon: () => <Text fontSize={20}>AI</Text>,
                  tabBarLabel: 'AI Learn',
                }}
              />
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  tabBarIcon: () => <Text fontSize={20}>P</Text>,
                  tabBarLabel: 'Profile',
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
