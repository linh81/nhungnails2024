import React from 'react';
import { Tabs, Redirect } from 'expo-router';

import {Colors} from '@/constants/Colors';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const { user, isLoading } = useAuth();
  
// Show loading while checking auth state
if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

// Redirect to sign-in if not authenticated
if (!user) {
  return <Redirect href="/sign-in" />;
}

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabIconSelected,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}>
      <Tabs.Screen redirect name="index" />
      <Tabs.Screen
        name="workingdays"
        options={{
          title: 'Werkdagen',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? "calendar-month" : "calendar-month-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
          name="salary"
          options={{
            title: "Salaris",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="cash-multiple" color={color} />
            ),
            // href: !user.isAdmin ? null : undefined,
          }}
        />
        <Tabs.Screen
          name="revenue"
          options={{
            title: "Omzet",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={"chart-line"} color={color} />
            ),
            // href: !user.isAdmin ? null : undefined,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profiel",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "account" : "account-outline"}
                color={color}
              />
            ),
          }}
        />
    </Tabs>
  );
}
