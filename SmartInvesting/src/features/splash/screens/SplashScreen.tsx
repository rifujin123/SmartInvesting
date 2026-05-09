import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Image } from "react-native";
import { colors } from "../../../theme/colors";

const CIRCLE_SIZE = 120;
const PARTICLE_COUNT = 12;

interface SplashScreenProps {
  onFinish: () => void;
}

const LogoImage: React.FC<{ size: number }> = ({ size }) => (
  <Image
    source={require("./logo.png")}
    style={{ width: size, height: size, resizeMode: "contain" }}
  />
);

const Particle: React.FC<{ index: number; opacity: Animated.Value; scale: Animated.Value }> = ({
  index,
  opacity,
  scale,
}) => {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const radius = 80;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          opacity,
          transform: [
            { translateX: x },
            { translateY: y },
            { scale },
          ],
        },
      ]}
    />
  );
};

const DotsIndicator: React.FC<{ activeIndex: Animated.Value; count: number }> = ({
  activeIndex,
  count,
}) => {
  return (
    <View style={styles.dotsContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <AnimatedDot key={i} activeIndex={activeIndex} index={i} />
      ))}
    </View>
  );
};

const AnimatedDot: React.FC<{ activeIndex: Animated.Value; index: number }> = ({
  activeIndex,
  index,
}) => {
  const opacity = activeIndex.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0.3, 1, 0.3],
    extrapolate: "clamp",
  });

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;
  const particleScale = useRef(new Animated.Value(0.5)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(particleOpacity, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(particleScale, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      const timer = setTimeout(() => {
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 1500);
      return () => clearTimeout(timer);
    });
  }, [logoScale, logoOpacity, particleOpacity, particleScale, ringScale, ringOpacity, textOpacity, textTranslateY, fadeOut, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <Particle
              key={i}
              index={i}
              opacity={particleOpacity}
              scale={particleScale}
            />
          ))}
          <Animated.View
            style={[
              styles.logo,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <LogoImage size={80} />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text style={styles.appName}>SmartInvesting</Text>
          <Text style={styles.tagline}>Grow your wealth, plan your future</Text>
        </Animated.View>
      </View>

      <View style={styles.bottomDots}>
        <DotsIndicator activeIndex={new Animated.Value(0)} count={3} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0836e6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
  },
  ring: {
    position: "absolute",
    width: CIRCLE_SIZE + 20,
    height: CIRCLE_SIZE + 20,
    borderRadius: (CIRCLE_SIZE + 20) / 2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    opacity: 0.5,
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 8,
    letterSpacing: 0.3,
  },
  bottomDots: {
    position: "absolute",
    bottom: 60,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});
