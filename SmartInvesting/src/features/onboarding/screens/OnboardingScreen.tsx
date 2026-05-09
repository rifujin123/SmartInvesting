import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";
import { IllustrationOnboarding1 } from "../components/IllustrationOnboarding1";
import { IllustrationOnboarding2 } from "../components/IllustrationOnboarding2";
import { IllustrationOnboarding3 } from "../components/IllustrationOnboarding3";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const ILLUSTRATION_SIZE = Math.min(SCREEN_WIDTH * 0.7, 320);

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  IllustrationComponent: React.FC<{ width: number; height: number }>;
}

const SLIDES: SlideData[] = [
  {
    id: 0,
    title: "Track Your\nDaily Expenses",
    subtitle: "Get insights on where your money goes, set budgets, and save more effortlessly.",
    IllustrationComponent: IllustrationOnboarding1,
  },
  {
    id: 1,
    title: "Send Money\nAnywhere",
    subtitle: "Transfer funds instantly to anyone, anywhere with just a few taps.",
    IllustrationComponent: IllustrationOnboarding2,
  },
  {
    id: 2,
    title: "Get Loans\nEasily",
    subtitle: "Apply for personal loans with competitive rates and quick approval.",
    IllustrationComponent: IllustrationOnboarding3,
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

const Slide: React.FC<{
  slide: SlideData;
  index: number;
  currentIndex: number;
  scrollX: Animated.Value;
}> = ({ slide, index, currentIndex, scrollX }) => {
  const Illustration = slide.IllustrationComponent;

  const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.85, 1, 0.85],
    extrapolate: "clamp",
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Illustration width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} />
      </Animated.View>
    </View>
  );
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    scrollX.setValue(offsetX);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const handleDotPress = (index: number) => {
    scrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const inputRange = [0, 1, 2];
  const dotWidth = scrollX.interpolate({
    inputRange: inputRange.map((i) => i * SCREEN_WIDTH),
    outputRange: [8, 24, 8],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {SLIDES.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            index={index}
            currentIndex={currentIndex}
            scrollX={scrollX}
          />
        ))}
      </Animated.ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleDotPress(i)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.dot,
                  i === currentIndex && styles.dotActive,
                  {
                    width: i === currentIndex ? dotWidth : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
          <Text style={styles.subtitle}>{SLIDES[currentIndex].subtitle}</Text>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, isLastSlide && styles.getStartedButton]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextText, isLastSlide && styles.getStartedText]}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
          {!isLastSlide && <Text style={styles.arrowIcon}>→</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
    letterSpacing: 0.3,
  },
  scrollContent: {
    alignItems: "center",
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  illustrationContainer: {
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E2E8F0",
  },
  dotActive: {
    backgroundColor: "#0836e6",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  getStartedButton: {
    backgroundColor: "#0836e6",
  },
  nextText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  getStartedText: {
    letterSpacing: 0.5,
  },
  arrowIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
