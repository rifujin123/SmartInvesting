import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { spacing } from '../../theme/tokens';
import { formatVnd } from '../../utils/formatCurrency';

interface PortfolioCardProps {
  totalValue: number;
  change: number;
  changePercent: number;
  sparklineData?: number[];
}

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 32; // 16px horizontal margins

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  totalValue,
  change,
  changePercent,
  sparklineData = [40, 35, 38, 28, 30, 18, 20, 10, 8, 5],
}) => {
  const isPositive = change >= 0;

  // Build SVG path for sparkline (340x48 aspect ratio mock)
  const buildSvgPath = () => {
    if (!sparklineData || sparklineData.length === 0) return '';
    const width = 340;
    const height = 48;
    const padding = 2;
    const segmentWidth = width / (sparklineData.length - 1);

    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;

    return sparklineData
      .map((val, idx) => {
        const x = idx * segmentWidth;
        // Map value to SVG space (inverted Y)
        const y = padding + ((val - min) / range) * (height - padding * 2);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const pathD = buildSvgPath();
  const closedPathD = pathD ? `${pathD} L 340 48 L 0 48 Z` : '';

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <Text style={styles.label}>Total Portfolio</Text>
      <Text style={styles.value}>{formatVnd(totalValue)}</Text>

      <View style={styles.changeRow}>
        <Ionicons
          name={isPositive ? "trending-up" : "trending-down"}
          size={16}
          color="#9fe870"
          style={styles.changeIcon}
        />
        <Text style={styles.changeText}>
          {isPositive ? '+' : ''}
          {formatVnd(change)} ({changePercent.toFixed(2)}%)
          <Text style={styles.mutedText}> all time</Text>
        </Text>
      </View>

      <View style={styles.sparklineWrap}>
        {pathD ? (
          <Svg viewBox="0 0 340 48" style={styles.svg} preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#9fe870" stopOpacity={0.4} />
                <Stop offset="100%" stopColor="#9fe870" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {/* Filled area */}
            <Path d={closedPathD} fill="url(#sparkGrad)" />
            {/* Stroke line */}
            <Path d={pathD} stroke="#9fe870" strokeWidth={2} fill="none" />
          </Svg>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A', // Wise/reference dark surface
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginHorizontal: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(159, 232, 112, 0.15)', // light green glow
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changeIcon: {
    marginRight: 4,
  },
  changeText: {
    color: '#9fe870', // wise green
    fontSize: 14,
    fontWeight: '600',
  },
  mutedText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  sparklineWrap: {
    marginTop: 16,
    height: 48,
    width: '100%',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
