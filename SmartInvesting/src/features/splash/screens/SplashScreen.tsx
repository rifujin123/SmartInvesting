import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Image } from "react-native";
import { colors } from "../../../theme/colors";

const LOGO_SIZE = 112;
const MORPH_SIZE = 172;

interface SplashScreenProps {
  onFinish: () => void;
}

const LogoImage: React.FC<{ size: number }> = ({ size }) => (
  <Image
    source={require("./logo.png")}
    style={{ width: size, height: size, resizeMode: "contain" }}
  />
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeOut = useRef(new Animated.Value(1)).current;
  const seedOpacity = useRef(new Animated.Value(0)).current;
  const seedScale = useRef(new Animated.Value(0.35)).current;
  const morphScaleX = useRef(new Animated.Value(1)).current;
  const morphScaleY = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const ringScale = useRef(new Animated.Value(0.72)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let finishTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      finishTimer = setTimeout(() => {
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 480,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            onFinish();
          }
        });
      }, 1050);
    };

    const animationSequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(seedOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(seedScale, {
          toValue: 1,
          tension: 90,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(morphScaleX, {
          toValue: 1.42,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(morphScaleY, {
          toValue: 0.72,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(morphScaleX, {
          toValue: 1,
          tension: 105,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(morphScaleY, {
          toValue: 1,
          tension: 105,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 0.52,
          duration: 160,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          toValue: 1.85,
          duration: 740,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(160),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 560,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]);

    animationSequence.start(({ finished }) => {
      if (finished) {
        finish();
      }
    });

    return () => {
      animationSequence.stop();
      clearTimeout(finishTimer);
    };
  }, [
    fadeOut,
    logoOpacity,
    logoScale,
    morphScaleX,
    morphScaleY,
    onFinish,
    ringOpacity,
    ringScale,
    seedOpacity,
    seedScale,
  ]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowAccent} />
      <View style={styles.gridOverlay} />

      <View style={styles.content}>
        <View style={styles.logoStage}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.morphOrb,
              {
                opacity: seedOpacity,
                transform: [
                  { scale: seedScale },
                  { scaleX: morphScaleX },
                  { scaleY: morphScaleY },
                ],
              },
            ]}
          >
            <View style={styles.logoPlate}>
              <Animated.View
                style={{
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                }}
              >
                <LogoImage size={LOGO_SIZE} />
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.figma.appBg,
  },
  glowPrimary: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    top: -80,
    right: -110,
    backgroundColor: "rgba(69, 110, 254, 0.24)",
  },
  glowAccent: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    bottom: -70,
    left: -90,
    backgroundColor: "rgba(19, 201, 153, 0.18)",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22,
    backgroundColor: "rgba(255, 255, 255, 0.015)",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoStage: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: MORPH_SIZE,
    height: MORPH_SIZE,
    borderRadius: MORPH_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.figma.accent,
  },
  morphOrb: {
    width: MORPH_SIZE,
    height: MORPH_SIZE,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.figma.primary,
    shadowColor: colors.figma.primary,
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  logoPlate: {
    width: 140,
    height: 140,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
  },
});
