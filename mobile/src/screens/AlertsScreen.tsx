import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, H2, H3, Text, Button, Card } from 'tamagui';
import { format } from 'date-fns';

interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  allergen?: string;
  timestamp: Date;
  read: boolean;
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'danger',
      title: 'High Risk Product Scanned',
      message: 'Product contains peanuts - ANAPHYLAXIS RISK',
      allergen: 'peanuts',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Cross-Contamination Warning',
      message: 'Product may contain traces of tree nuts',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'EpiPen Expiry Reminder',
      message: 'Your EpiPen expires in 30 days',
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
  ]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return '$red2';
      case 'warning':
        return '$orange2';
      case 'info':
        return '$blue2';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <YStack padding="$4" space="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <H2>🔔 Alerts</H2>
            <Text color="$gray10">
              {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'}
            </Text>
          </YStack>
          {unreadCount > 0 && (
            <Button size="$3" onPress={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </XStack>

        {/* Quick Actions */}
        <Card padded>
          <H3 marginBottom="$2">Quick Actions</H3>
          <YStack space="$2">
            <Button theme="red" size="$4">
              🚨 Emergency Call
            </Button>
            <Button theme="orange" size="$4">
              📍 Find Nearest Hospital
            </Button>
          </YStack>
        </Card>

        {/* Alerts List */}
        <YStack space="$3">
          {alerts.length === 0 && (
            <Card padded>
              <Text textAlign="center" color="$gray10">
                No alerts. You're all caught up! ✓
              </Text>
            </Card>
          )}

          {alerts.map((alert) => (
            <Card
              key={alert.id}
              padded
              backgroundColor={getAlertColor(alert.type)}
              opacity={alert.read ? 0.6 : 1}
            >
              <XStack justifyContent="space-between" marginBottom="$2">
                <XStack space="$2" alignItems="center" flex={1}>
                  <Text fontSize="$6">{getAlertIcon(alert.type)}</Text>
                  <YStack flex={1}>
                    <Text fontWeight="bold" fontSize="$4">
                      {alert.title}
                    </Text>
                    <Text fontSize="$2" color="$gray11">
                      {format(alert.timestamp, 'MMM d, h:mm a')}
                    </Text>
                  </YStack>
                </XStack>
                {!alert.read && (
                  <Button size="$2" onPress={() => markAsRead(alert.id)}>
                    ✓
                  </Button>
                )}
              </XStack>

              <Text marginBottom="$2">{alert.message}</Text>

              {alert.allergen && (
                <Card padded backgroundColor="$backgroundStrong" marginBottom="$2">
                  <Text fontSize="$2">
                    <Text fontWeight="bold">Allergen:</Text> {alert.allergen}
                  </Text>
                </Card>
              )}

              <XStack space="$2">
                <Button
                  flex={1}
                  size="$3"
                  theme="gray"
                  onPress={() => deleteAlert(alert.id)}
                >
                  Delete
                </Button>
                <Button flex={1} size="$3" theme="blue">
                  View Details
                </Button>
              </XStack>
            </Card>
          ))}
        </YStack>

        {/* Alert Settings */}
        <Card padded>
          <H3 marginBottom="$2">Alert Settings</H3>
          <YStack space="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text>Push Notifications</Text>
              <Text>✓</Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text>Sound Alerts</Text>
              <Text>✓</Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text>Haptic Feedback</Text>
              <Text>✓</Text>
            </XStack>
            <Button marginTop="$2" theme="blue">
              Configure Alerts
            </Button>
          </YStack>
        </Card>

        {/* Alert History Stats */}
        <Card padded backgroundColor="$backgroundHover">
          <H3 marginBottom="$2">This Week</H3>
          <YStack space="$2">
            <XStack justifyContent="space-between">
              <Text>Products Scanned:</Text>
              <Text fontWeight="bold">24</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Allergens Detected:</Text>
              <Text fontWeight="bold" color="$danger">
                3
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text>Safe Products:</Text>
              <Text fontWeight="bold" color="$green10">
                21
              </Text>
            </XStack>
          </YStack>
        </Card>
      </YStack>
    </ScrollView>
  );
}
