-- installation
npx expo install expo-glass-effect
-- Usage

GlassView


import { StyleSheet, View, Image } from 'react-native';
import { GlassView } from 'expo-glass-effect';

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        source={{
          uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
        }}
      />

      {/* Basic Glass View */}
      <GlassView style={styles.glassView} />

      {/* Glass View with clear style */}
      <GlassView style={styles.tintedGlassView} glassEffectStyle="clear" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  glassView: {
    position: 'absolute',
    top: 100,
    left: 50,
    width: 200,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tintedGlassView: {
    position: 'absolute',
    top: 250,
    left: 50,
    width: 200,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});

GlassContainer

import { StyleSheet, View, Image } from 'react-native';
import { GlassView, GlassContainer } from 'expo-glass-effect';

export default function GlassContainerDemo() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        source={{
          uri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop',
        }}
      />
      <GlassContainer spacing={10} style={styles.containerStyle}>
        <GlassView style={styles.glass1} isInteractive />
        <GlassView style={styles.glass2} />
        <GlassView style={styles.glass3} />
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  containerStyle: {
    position: 'absolute',
    top: 200,
    left: 50,
    width: 250,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  glass1: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  glass2: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  glass3: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});


Animated glass effect style
import { useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { GlassView } from 'expo-glass-effect';

export default function AnimatedGlassStyleExample() {
  const [visible, setVisible] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundImage}>
        <Image
          style={{
            width: 300,
            height: 200,
          }}
          source={{
            uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          }}
        />
        <GlassView
          style={styles.glassView}
          glassEffectStyle={{
            style: visible ? 'clear' : 'none',
            animate: true,
            animationDuration: 0.5,
          }}
        />
      </View>
      <Pressable style={styles.toggleButton} onPress={() => setVisible(prev => !prev)}>
        <Text style={styles.toggleButtonText}>{visible ? 'Hide' : 'Show'} Glass Effect</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: 300,
  },
  backgroundImage: {
    position: 'absolute',
  },
  glassView: {
    position: 'absolute',
    width: 200,
    height: 120,
    borderRadius: 12,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


Opacity animation workaround

import { GlassView } from 'expo-glass-effect';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView);

export default function GlassOpacityAnimationExample() {
  const fadeOpacity = useSharedValue(0);

  const glassViewProps = useAnimatedProps(() => {
    const glassEffectStyle = fadeOpacity.value > 0.01 ? 'regular' : 'none';
    return {
      glassEffectStyle,
      style: {
        width: 150,
        height: 100,
        borderRadius: 12,
        position: 'absolute',
      },
    };
  });

  const fadeOpacityStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    opacity: fadeOpacity.value,
    width: 150,
    height: 100,
    borderRadius: 12,
  }));

  return (
    <>
      <Text style={styles.title}>Opacity Animation Workaround (iOS 26.1+)</Text>
      <View style={styles.backgroundContainer}>
        <Image
          style={styles.backgroundImage}
          source={{
            uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          }}
        />
        <Animated.View style={fadeOpacityStyle}>
          <AnimatedGlassView animatedProps={glassViewProps} />
        </Animated.View>
      </View>

      <Pressable
        style={styles.toggleButton}
        onPress={() => {
          fadeOpacity.value = withTiming(fadeOpacity.value > 0.5 ? 0 : 1, { duration: 500 });
        }}>
        <Text style={styles.toggleButtonText}>Toggle Glass Visibility</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backgroundContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


isLiquidGlassAvailable
import { isLiquidGlassAvailable } from 'expo-glass-effect';

export default function CheckLiquidGlass() {
return (
<Text>
{isLiquidGlassAvailable()
? 'Liquid Glass effect is available'
: 'Liquid Glass effect is not available'}
</Text>

);

isLiquidEffectAPIAvailable

