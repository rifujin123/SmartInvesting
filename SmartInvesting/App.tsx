import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/shared/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "./src/context/AuthContext";

const ONBOARDING_KEY = "@smartinvesting_onboarding_completed";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(completed !== "true");
      } catch {
        setShowOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } finally {
      setShowOnboarding(false);
    }
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator
          initialOnboarding={showOnboarding}
          onOnboardingComplete={handleOnboardingComplete}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
