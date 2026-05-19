import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SplashScreen } from "../../features/splash/screens/SplashScreen";
import { OnboardingScreen } from "../../features/onboarding/screens/OnboardingScreen";
import { LoginScreen } from "../../features/login/screens/LoginScreen";
import { RegisterScreen } from "../../features/register/screens/RegisterScreen";
import { ForgotPasswordScreen } from "../../features/forgot-password/screens/ForgotPasswordScreen";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { BuyAssetsScreen } from "../../features/investing/screens/BuyAssetsScreen";
import { AssetDetailScreen } from "../../features/investing/screens/AssetDetailScreen";
import { FinanceScreen } from "../../features/finance/screens/FinanceScreen";
import { GoalDetailScreen } from "../../features/finance/screens/GoalDetailScreen";
import { BudgetDetailScreen } from "../../features/finance/screens/BudgetDetailScreen";
import { PortfolioScreen } from "../../features/portfolio/screens/PortfolioScreen";
import { TransactionsScreen } from "../../features/transactions/screens/TransactionsScreen";
import { DiscoveryScreen } from "../../features/discovery/screens/DiscoveryScreen";
import { ProfileScreen } from "../../features/profile/screens/ProfileScreen";
import { PersonalInformationScreen } from "../../features/profile/screens/PersonalInformationScreen";
import { SecurityScreen } from "../../features/profile/screens/SecurityScreen";
import { SettingsScreen } from "../../features/settings/screens/SettingsScreen";
import { BottomTabs } from "../components/BottomTabs";
import { useAuth } from "../../context/AuthContext";
import { LoginRequest, RegisterRequest } from "../../services/auth/types";
import { AssetType } from "../../features/investing/data/investableAssets";
import { AppStackParamList, AppTabParamList, AuthStackParamList, RootStackParamList } from "./types";

const SCREEN_BG = "#FFFFFF";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

interface RootNavigatorProps {
  initialOnboarding?: boolean;
  onOnboardingComplete?: () => void | Promise<void>;
}

const AuthNavigator: React.FC<{
  initialOnboarding: boolean;
  onOnboardingComplete?: () => void | Promise<void>;
}> = ({ initialOnboarding, onOnboardingComplete }) => {
  const { login, loginWithBiometrics, register, forgotPassword, isSubmitting, isBiometricSubmitting, isBiometricAvailable, biometricLabel, lastLoginEmail, error, clearError } = useAuth();
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(initialOnboarding);

  useEffect(() => {
    setShowOnboarding(initialOnboarding);
  }, [initialOnboarding]);

  const initialRouteName = useMemo<keyof AuthStackParamList>(
    () => (showOnboarding ? "Splash" : "Login"),
    [showOnboarding],
  );

  const handleSplashFinish = useCallback(() => {
    if (showOnboarding) {
      setRegisterSuccessMessage(null);
    }
  }, [showOnboarding]);

  const handleOnboardingFinish = useCallback(async () => {
    await onOnboardingComplete?.();
    setShowOnboarding(false);
  }, [onOnboardingComplete]);

  const handleLogin = useCallback(
    async (payload: LoginRequest) => {
      setRegisterSuccessMessage(null);
      await login(payload);
    },
    [login],
  );

  const handleRegister = useCallback(
    async (payload: RegisterRequest) => {
      await register(payload);
      setRegisterSuccessMessage("Registration successful. Please sign in.");
    },
    [register],
  );

  const handleSendResetLink = useCallback(
    async (email: string) => {
      await forgotPassword({ email });
    },
    [forgotPassword],
  );

  return (
    <AuthStack.Navigator
      key={showOnboarding ? "with-onboarding" : "without-onboarding"}
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false, animation: "none" }}
    >
      {showOnboarding && (
        <>
          <AuthStack.Screen name="Splash">
            {({ navigation }) => (
              <SplashScreen
                onFinish={() => {
                  handleSplashFinish();
                  navigation.replace("Onboarding");
                }}
              />
            )}
          </AuthStack.Screen>
          <AuthStack.Screen name="Onboarding">
            {({ navigation }) => (
              <OnboardingScreen
                onFinish={() => {
                  void handleOnboardingFinish();
                  navigation.replace("Login");
                }}
              />
            )}
          </AuthStack.Screen>
        </>
      )}

      <AuthStack.Screen name="Login">
        {({ navigation, route }) => (
          <LoginScreen
            onLogin={handleLogin}
            onRegisterPress={() => {
              clearError();
              setRegisterSuccessMessage(null);
              navigation.navigate("Register");
            }}
            onForgotPasswordPress={() => {
              clearError();
              setRegisterSuccessMessage(null);
              navigation.navigate("ForgotPassword");
            }}
            onBiometricLogin={loginWithBiometrics}
            isSubmitting={isSubmitting}
            isBiometricSubmitting={isBiometricSubmitting}
            isBiometricAvailable={isBiometricAvailable}
            biometricLabel={biometricLabel}
            initialEmail={lastLoginEmail}
            serverError={error ?? route.params?.successMessage ?? registerSuccessMessage}
            clearServerError={clearError}
          />
        )}
      </AuthStack.Screen>

      <AuthStack.Screen name="Register">
        {({ navigation }) => (
          <RegisterScreen
            onRegister={async (payload) => {
              await handleRegister(payload);
              clearError();
              navigation.replace("Login", { successMessage: "Registration successful. Please sign in." });
            }}
            onLoginPress={() => {
              clearError();
              navigation.navigate("Login");
            }}
            isSubmitting={isSubmitting}
            serverError={error}
            clearServerError={clearError}
          />
        )}
      </AuthStack.Screen>

      <AuthStack.Screen name="ForgotPassword">
        {({ navigation }) => (
          <ForgotPasswordScreen
            onBackPress={() => {
              clearError();
              navigation.goBack();
            }}
            onSendResetLink={handleSendResetLink}
            isSubmitting={isSubmitting}
            serverError={error}
            clearServerError={clearError}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

const MainTabsNavigator: React.FC<{ onBuyAsset: (type: AssetType) => void }> = ({ onBuyAsset }) => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabs {...props} />}
    >
      <Tab.Screen name="Dashboard">
        {() => <DashboardScreen onBuyAsset={onBuyAsset} />}
      </Tab.Screen>
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Finance" component={FinanceScreen} />
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs">
        {({ navigation }) => (
          <MainTabsNavigator
            onBuyAsset={(type) => navigation.navigate("BuyAssets", { initialAssetType: type })}
          />
        )}
      </AppStack.Screen>
      <AppStack.Screen name="BuyAssets" component={BuyAssetsScreen} />
      <AppStack.Screen name="AssetDetail" component={AssetDetailScreen} />
      <AppStack.Screen name="GoalDetail" component={GoalDetailScreen} />
      <AppStack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
      <AppStack.Screen name="Security" component={SecurityScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
    </AppStack.Navigator>
  );
};

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  initialOnboarding = true,
  onOnboardingComplete,
}) => {
  const { status } = useAuth();
  const [hasShownSplash, setHasShownSplash] = useState(false);

  if (status === "booting") {
    return <View style={styles.container} />;
  }

  // Show splash only on first app launch (onboarding flow)
  if (!hasShownSplash && initialOnboarding) {
    return (
      <View style={styles.container}>
        <SplashScreen onFinish={() => setHasShownSplash(true)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {status === "authenticated" ? (
            <RootStack.Screen name="AppStack">
              {() => <AppNavigator />}
            </RootStack.Screen>
          ) : (
            <RootStack.Screen name="AuthStack">
              {() => (
                <AuthNavigator
                  initialOnboarding={initialOnboarding}
                  onOnboardingComplete={onOnboardingComplete}
                />
              )}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
});
