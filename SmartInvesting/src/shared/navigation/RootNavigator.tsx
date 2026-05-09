import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { SplashScreen } from "../../features/splash/screens/SplashScreen";
import { OnboardingScreen } from "../../features/onboarding/screens/OnboardingScreen";
import { LoginScreen } from "../../features/login/screens/LoginScreen";
import { RegisterScreen } from "../../features/register/screens/RegisterScreen";
import { ForgotPasswordScreen } from "../../features/forgot-password/screens/ForgotPasswordScreen";
import { DashboardScreen } from "../../features/dashboard/screens/DashboardScreen";
import { FinanceScreen } from "../../features/finance/screens/FinanceScreen";
import { PortfolioScreen } from "../../features/portfolio/screens/PortfolioScreen";
import { TransactionsScreen } from "../../features/transactions/screens/TransactionsScreen";
import { BottomTabs, TabName } from "../components/BottomTabs";

const SCREEN_BG = "#FFFFFF";

type AuthScreen = "splash" | "onboarding" | "login" | "register" | "forgot-password";

interface RootNavigatorProps {
  initialOnboarding?: boolean;
}

const AnimatedScreen: React.FC<{
  children: React.ReactNode;
  enterFrom: "left" | "right" | "none";
}> = ({ children, enterFrom }) => {
  const translateX = useRef(new Animated.Value(enterFrom === "right" ? 300 : enterFrom === "left" ? -300 : 0)).current;
  const opacity = useRef(new Animated.Value(enterFrom === "none" ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacity]);

  return (
    <Animated.View
      style={[
        styles.fullScreen,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  initialOnboarding = true,
}) => {
  const [authScreen, setAuthScreen] = useState<AuthScreen>("splash");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");

  const handleSplashFinish = () => {
    if (!initialOnboarding) {
      setAuthScreen("onboarding");
    } else {
      setAuthScreen("login");
    }
  };

  const handleOnboardingFinish = () => {
    setAuthScreen("login");
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
  };

  const handleLoginPress = () => {
    setAuthScreen("register");
  };

  const handleRegisterPress = () => {
    setAuthScreen("login");
  };

  const handleForgotPasswordPress = () => {
    setAuthScreen("forgot-password");
  };

  const handleForgotPasswordBack = () => {
    setAuthScreen("login");
  };

  const handleSendCode = () => {
    setAuthScreen("login");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthScreen("login");
    setActiveTab("dashboard");
  };

  const renderAuthScreen = () => {
    switch (authScreen) {
      case "splash":
        return (
          <AnimatedScreen enterFrom="none">
            <SplashScreen onFinish={handleSplashFinish} />
          </AnimatedScreen>
        );
      case "onboarding":
        return (
          <AnimatedScreen enterFrom="none">
            <OnboardingScreen onFinish={handleOnboardingFinish} />
          </AnimatedScreen>
        );
      case "login":
        return (
          <AnimatedScreen enterFrom="none">
            <LoginScreen
              onLogin={handleLogin}
              onRegisterPress={handleLoginPress}
              onForgotPasswordPress={handleForgotPasswordPress}
            />
          </AnimatedScreen>
        );
      case "register":
        return (
          <AnimatedScreen enterFrom="none">
            <RegisterScreen
              onRegister={handleRegister}
              onLoginPress={handleRegisterPress}
            />
          </AnimatedScreen>
        );
      case "forgot-password":
        return (
          <AnimatedScreen enterFrom="none">
            <ForgotPasswordScreen
              onBackPress={handleForgotPasswordBack}
              onSendCode={handleSendCode}
            />
          </AnimatedScreen>
        );
    }
  };

  const renderMainScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen onLogout={handleLogout} />;
      case "finance":
        return <FinanceScreen />;
      case "portfolio":
        return <PortfolioScreen />;
      case "transactions":
        return <TransactionsScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {!isLoggedIn ? (
        renderAuthScreen()
      ) : (
        <View style={styles.mainContainer}>
          <View style={styles.screenContainer}>{renderMainScreen()}</View>
          <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
  },
  mainContainer: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
