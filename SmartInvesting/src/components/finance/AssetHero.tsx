import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../../theme/tokens';

interface AssetHeroProps {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
}

export const AssetHero: React.FC<AssetHeroProps> = ({ ticker, name, price, changePercent }) => {
  const changeSign = changePercent >= 0 ? '+' : '';
  const changeColor = changePercent >= 0 ? '#163300' : '#d03238';

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{ticker}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.ticker}>{ticker}</Text>
      <Text style={styles.price}>${price.toFixed(2)}</Text>
      <Text style={[styles.change, { color: changeColor }]}>
        {changeSign}{changePercent.toFixed(2)}% today
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e2f6d5',
    padding: 32,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(159,232,112,0.2)',
    filter: 'blur(40px)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#163300',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 28,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 1.05,
    letterSpacing: -0.02,
    color: '#163300',
    marginBottom: 4,
  },
  ticker: {
    fontSize: 14,
    color: 'rgba(22,51,0,0.6)',
    fontWeight: '600',
  },
  price: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.02,
    color: '#163300',
    marginTop: 16,
    fontFamily: 'monospace',
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'monospace',
  },
});
